import { Injectable } from '@nestjs/common';

@Injectable()
export class KeySetStore {
  private readonly store = new Map<string, Set<string>>();

  /**
   * Add a value to the set identified by key.
   * @param key The key to identify the set (e.g., interviewId).
   * @param value The value to add to the set (e.g., topic or question).
   */
  addToSet(key: string, value: string): void {
    if (!this.store.has(key)) {
      this.store.set(key, new Set<string>());
    }
    this.store.get(key)?.add(value);
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
  }
}
