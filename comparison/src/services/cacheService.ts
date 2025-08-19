import { config } from '../config';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * 메모리 기반 캐싱 서비스
 */
export class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.defaultTTL = config.cache.ttlMinutes * 60 * 1000; // 분을 밀리초로 변환
    
    // 5분마다 만료된 캐시 정리
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);

    console.log(`💾 Cache Service initialized with TTL: ${config.cache.ttlMinutes} minutes`);
  }

  /**
   * 캐시에 데이터 저장
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };

    this.cache.set(key, cacheItem);
    
    console.log(`💾 Cache SET: ${key} (TTL: ${Math.round((ttl || this.defaultTTL) / 1000)}s)`);
  }

  /**
   * 캐시에서 데이터 조회
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      console.log(`💾 Cache MISS: ${key}`);
      return null;
    }

    // TTL 확인
    const now = Date.now();
    const age = now - item.timestamp;
    
    if (age > item.ttl) {
      this.cache.delete(key);
      console.log(`💾 Cache EXPIRED: ${key} (age: ${Math.round(age / 1000)}s)`);
      return null;
    }

    console.log(`💾 Cache HIT: ${key} (age: ${Math.round(age / 1000)}s)`);
    return item.data as T;
  }

  /**
   * 캐시에서 데이터 삭제
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`💾 Cache DELETE: ${key}`);
    }
    return deleted;
  }

  /**
   * 패턴으로 캐시 키 삭제
   */
  deletePattern(pattern: string): number {
    let deletedCount = 0;
    const regex = new RegExp(pattern);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`💾 Cache DELETE PATTERN: ${pattern} (${deletedCount} items)`);
    }

    return deletedCount;
  }

  /**
   * 캐시 존재 여부 확인
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    // TTL 확인
    const now = Date.now();
    const age = now - item.timestamp;
    
    if (age > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 캐시 통계 조회
   */
  getStats(): {
    totalItems: number;
    memoryUsage: number;
    hitRate: number;
    oldestItem: number;
    newestItem: number;
  } {
    const now = Date.now();
    let oldestTimestamp = now;
    let newestTimestamp = 0;
    let totalSize = 0;

    for (const [key, item] of this.cache.entries()) {
      // 대략적인 메모리 사용량 계산
      totalSize += key.length * 2; // 문자열은 UTF-16이므로 2바이트
      totalSize += JSON.stringify(item.data).length * 2;
      totalSize += 24; // 객체 오버헤드

      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
      }
      if (item.timestamp > newestTimestamp) {
        newestTimestamp = item.timestamp;
      }
    }

    return {
      totalItems: this.cache.size,
      memoryUsage: totalSize,
      hitRate: 0, // 실제 구현에서는 hit/miss 카운터 필요
      oldestItem: this.cache.size > 0 ? now - oldestTimestamp : 0,
      newestItem: this.cache.size > 0 ? now - newestTimestamp : 0
    };
  }

  /**
   * 만료된 캐시 항목 정리
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      const age = now - item.timestamp;
      if (age > item.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cache cleanup: removed ${cleanedCount} expired items`);
    }
  }

  /**
   * 전체 캐시 초기화
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`💾 Cache CLEAR: removed ${size} items`);
  }

  /**
   * 캐시 서비스 종료
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
    console.log('💾 Cache Service destroyed');
  }

  /**
   * 캐시 키 생성 헬퍼
   */
  static generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  /**
   * 해시 기반 캐시 키 생성 (긴 키를 짧게)
   */
  static generateHashKey(prefix: string, data: any): string {
    const hash = this.simpleHash(JSON.stringify(data));
    return `${prefix}:${hash}`;
  }

  /**
   * 간단한 해시 함수
   */
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32비트 정수로 변환
    }
    return Math.abs(hash).toString(36);
  }
}