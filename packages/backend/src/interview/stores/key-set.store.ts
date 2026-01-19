import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MinHeapScheduler } from './min-heap.scheduler';

@Injectable()
export class KeySetStore implements OnModuleInit {
  private readonly store = new Map<string, Set<string>>();
  // TTL 관리를 위한 Min-Heap 스케줄러
  private readonly scheduler = new MinHeapScheduler();
  private readonly logger = new Logger(KeySetStore.name);

  /**
   * 모듈 초기화 시 cleanup 타이머 시작
   */
  onModuleInit() {
    // 5초마다 만료된 키 확인
    setInterval(() => {
      this.cleanupExpiredKeys();
    }, 5000);
  }

  /**
   * 스케줄러를 확인하여 만료된 키를 스토어에서 제거
   */
  private cleanupExpiredKeys() {
    const now = Date.now();
    while (true) {
      const task = this.scheduler.peek();
      if (!task || task.executeAt > now) break;

      // 만료된 작업 꺼내기
      const expired = this.scheduler.pop();
      if (expired) {
        // 해당 키의 데이터 삭제
        this.logger.log(`Removing expired key: ${expired.key}`);
        this.clear(expired.key);
      }
    }
  }

  /**
   * @param key The key to identify the set (e.g., interviewId).
   * @param value The value to add to the set (e.g., topic or question).
   * @param ttl Optional TTL in milliseconds. Default is 40 minutes (2400000ms).
   */
  addToSet(key: string, value: string, ttl: number = 40 * 60 * 1000): void {
    if (!this.store.has(key)) {
      this.store.set(key, new Set<string>());
    }
    this.store.get(key)?.add(value);

    // TTL이 0이거나 음수면 스케줄링 하지 않음 (필요 시 정책 조정)
    if (ttl > 0) {
      // 기존 스케줄 제거 후 새로 등록 (TTL 갱신)
      // 스케줄러는 O(log N)으로 동작하므로 무거운 연산 아님
      this.scheduler.remove(key);
      this.scheduler.push(key, Date.now() + ttl);
    }
  }

  /**
   * Get all values from the set identified by key.
   * @param key The key to identify the set.
   * @returns An array of values in the set.
   */
  getSet(key: string): string[] {
    const set = this.store.get(key);
    return set ? Array.from(set) : [];
  }

  /**
   * Check if a value exists in the set identified by key.
   * @param key The key to identify the set.
   * @param value The value to check.
   */
  has(key: string, value: string): boolean {
    return this.store.get(key)?.has(value) ?? false;
  }

  /**
   * Remove a value from the set identified by key.
   * @param key The key to identify the set.
   * @param value The value to remove.
   */
  removeFromSet(key: string, value: string): void {
    this.store.get(key)?.delete(value);
  }

  /**
   * Clear the set identified by key.
   * @param key The key to identify the set.
   */
  clear(key: string): void {
    this.store.delete(key);
    // 스케줄러에서도 제거
    this.scheduler.remove(key);
  }
}
