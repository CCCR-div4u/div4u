import { Request, Response, NextFunction } from 'express';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

/**
 * 간단한 메모리 기반 레이트 리미터
 */
export class RateLimiter {
  private requests = new Map<string, RateLimitInfo>();
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor(maxRequests: number = 100, windowMs: number = 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // 5분마다 만료된 기록 정리
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);

    console.log(`🛡️ Rate Limiter initialized: ${maxRequests} requests per ${windowMs / 1000}s`);
  }

  /**
   * 레이트 리미팅 미들웨어
   */
  middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const clientId = this.getClientId(req);
      const now = Date.now();

      // 클라이언트의 요청 기록 조회
      let clientInfo = this.requests.get(clientId);

      if (!clientInfo) {
        // 새로운 클라이언트
        clientInfo = {
          count: 1,
          resetTime: now + this.windowMs
        };
        this.requests.set(clientId, clientInfo);
        this.setHeaders(res, clientInfo);
        next();
        return;
      }

      // 윈도우 시간이 지났으면 리셋
      if (now >= clientInfo.resetTime) {
        clientInfo.count = 1;
        clientInfo.resetTime = now + this.windowMs;
        this.requests.set(clientId, clientInfo);
        this.setHeaders(res, clientInfo);
        next();
        return;
      }

      // 요청 수 증가
      clientInfo.count++;

      // 제한 초과 확인
      if (clientInfo.count > this.maxRequests) {
        const retryAfter = Math.ceil((clientInfo.resetTime - now) / 1000);
        
        res.status(429).json({
          success: false,
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
          retryAfter,
          timestamp: new Date().toISOString()
        });

        console.warn(`🚫 Rate limit exceeded for ${clientId}: ${clientInfo.count}/${this.maxRequests}`);
        return;
      }

      this.setHeaders(res, clientInfo);
      next();
    };
  }

  /**
   * 클라이언트 식별자 생성
   */
  private getClientId(req: Request): string {
    // IP 주소 기반 (실제 환경에서는 더 정교한 식별 방법 사용)
    const forwarded = req.headers['x-forwarded-for'] as string;
    const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
    return ip || 'unknown';
  }

  /**
   * 응답 헤더 설정
   */
  private setHeaders(res: Response, clientInfo: RateLimitInfo): void {
    const remaining = Math.max(0, this.maxRequests - clientInfo.count);
    const resetTime = Math.ceil((clientInfo.resetTime - Date.now()) / 1000);

    res.set({
      'X-RateLimit-Limit': this.maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetTime.toString()
    });
  }

  /**
   * 만료된 기록 정리
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [clientId, info] of this.requests.entries()) {
      if (now >= info.resetTime) {
        this.requests.delete(clientId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Rate limiter cleanup: removed ${cleanedCount} expired records`);
    }
  }

  /**
   * 통계 조회
   */
  getStats(): {
    totalClients: number;
    activeClients: number;
    memoryUsage: number;
  } {
    const now = Date.now();
    let activeClients = 0;
    let memoryUsage = 0;

    for (const [clientId, info] of this.requests.entries()) {
      memoryUsage += clientId.length * 2 + 16; // 대략적인 메모리 사용량
      
      if (now < info.resetTime) {
        activeClients++;
      }
    }

    return {
      totalClients: this.requests.size,
      activeClients,
      memoryUsage
    };
  }

  /**
   * 레이트 리미터 종료
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.requests.clear();
    console.log('🛡️ Rate Limiter destroyed');
  }
}

// 기본 레이트 리미터 인스턴스
export const defaultRateLimiter = new RateLimiter(100, 60 * 1000); // 분당 100회