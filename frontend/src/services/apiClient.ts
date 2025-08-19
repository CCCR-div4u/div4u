import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { APIResponse, APIError, APIClientConfig, RetryConfig } from '../types/api';

/**
 * API 클라이언트 클래스
 * axios 기반으로 재시도 로직, 에러 처리, 타임아웃 등을 포함
 */
export class APIClient {
  private client: AxiosInstance;
  private retryConfig: RetryConfig;

  constructor(config: APIClientConfig) {
    this.retryConfig = config.retryConfig;
    
    // axios 인스턴스 생성
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터
    this.client.interceptors.request.use(
      (config) => {
        // 요청 로깅 (개발 환경에서만)
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params,
          });
        }
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response) => {
        // 응답 로깅 (개발 환경에서만)
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }
        return response;
      },
      (error) => {
        // 에러 로깅
        console.error('❌ Response Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * 재시도 로직이 포함된 요청 실행
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      const shouldRetry = 
        retryCount < this.retryConfig.maxRetries &&
        (this.retryConfig.retryCondition ? this.retryConfig.retryCondition(error) : this.isRetryableError(error));

      if (shouldRetry) {
        const delay = this.retryConfig.retryDelay * Math.pow(2, retryCount); // 지수 백오프
        console.warn(`⏳ Retrying request in ${delay}ms (attempt ${retryCount + 1}/${this.retryConfig.maxRetries})`);
        
        await this.delay(delay);
        return this.executeWithRetry(requestFn, retryCount + 1);
      }

      throw this.transformError(error);
    }
  }

  /**
   * 재시도 가능한 에러인지 확인
   */
  private isRetryableError(error: any): boolean {
    if (axios.isAxiosError(error)) {
      // 네트워크 에러
      if (!error.response) return true;
      
      // 5xx 서버 에러
      if (error.response.status >= 500) return true;
      
      // 408 Request Timeout
      if (error.response.status === 408) return true;
      
      // 429 Too Many Requests
      if (error.response.status === 429) return true;
    }
    
    return false;
  }

  /**
   * 에러를 APIError로 변환
   */
  private transformError(error: any): APIError {
    const apiError = new Error() as APIError;
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      apiError.message = this.getErrorMessage(axiosError);
      apiError.status = axiosError.response?.status;
      apiError.code = axiosError.code;
      apiError.details = axiosError.response?.data;
    } else {
      apiError.message = error.message || '알 수 없는 오류가 발생했습니다.';
    }
    
    return apiError;
  }

  /**
   * 사용자 친화적 에러 메시지 생성
   */
  private getErrorMessage(error: AxiosError): string {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
      }
      return '네트워크 연결을 확인해주세요.';
    }

    const status = error.response.status;
    const data = error.response.data as any;

    // 백엔드에서 제공하는 에러 메시지 사용
    if (data?.message) {
      return data.message;
    }

    // HTTP 상태 코드별 기본 메시지
    switch (status) {
      case 400:
        return '잘못된 요청입니다. 입력 내용을 확인해주세요.';
      case 401:
        return '인증이 필요합니다.';
      case 403:
        return '접근 권한이 없습니다.';
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.';
      case 408:
        return '요청 시간이 초과되었습니다.';
      case 429:
        return '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.';
      case 500:
        return '서버 내부 오류가 발생했습니다.';
      case 502:
        return '서버 게이트웨이 오류가 발생했습니다.';
      case 503:
        return '서비스를 일시적으로 사용할 수 없습니다.';
      case 504:
        return '서버 응답 시간이 초과되었습니다.';
      default:
        return `서버 오류가 발생했습니다. (${status})`;
    }
  }

  /**
   * 지연 함수
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET 요청
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return this.executeWithRetry(async () => {
      const response = await this.client.get<APIResponse<T>>(url, config);
      return response.data;
    });
  }

  /**
   * POST 요청
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return this.executeWithRetry(async () => {
      const response = await this.client.post<APIResponse<T>>(url, data, config);
      return response.data;
    });
  }

  /**
   * PUT 요청
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return this.executeWithRetry(async () => {
      const response = await this.client.put<APIResponse<T>>(url, data, config);
      return response.data;
    });
  }

  /**
   * DELETE 요청
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return this.executeWithRetry(async () => {
      const response = await this.client.delete<APIResponse<T>>(url, config);
      return response.data;
    });
  }
}

// 기본 API 클라이언트 인스턴스 생성
export const apiClient = new APIClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000, // 30초
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000, // 1초
  },
});