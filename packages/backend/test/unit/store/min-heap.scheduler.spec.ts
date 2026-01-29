import { MinHeapScheduler } from '../../../src/interview/stores/min-heap.scheduler';

describe('MinHeapScheduler', () => {
  let scheduler: MinHeapScheduler;

  beforeEach(() => {
    scheduler = new MinHeapScheduler();
  });

  it('executeAt이 더 이른 task를 push하면 peek는 가장 빠른 task를 반환해야 한다', () => {
    // Given
    scheduler.push('b', 200);
    scheduler.push('a', 100);
    scheduler.push('c', 300);

    // When
    const top = scheduler.peek();

    // Then
    expect(top).toEqual({ key: 'a', executeAt: 100 });
    expect(scheduler.size).toBe(3);
  });

  it('pop을 호출하면 executeAt이 가장 작은 task부터 순서대로 반환되어야 한다', () => {
    // Given
    scheduler.push('b', 200);
    scheduler.push('a', 100);
    scheduler.push('c', 300);

    // When
    const first = scheduler.pop();
    const second = scheduler.pop();
    const third = scheduler.pop();
    const fourth = scheduler.pop();

    // Then
    expect(first).toEqual({ key: 'a', executeAt: 100 });
    expect(second).toEqual({ key: 'b', executeAt: 200 });
    expect(third).toEqual({ key: 'c', executeAt: 300 });
    expect(fourth).toBeUndefined();
    expect(scheduler.size).toBe(0);
  });

  it('remove를 호출하면 해당 key의 task가 힙에서 제거되어야 한다', () => {
    // Given
    scheduler.push('a', 100);
    scheduler.push('b', 200);
    scheduler.push('c', 300);

    // When
    scheduler.remove('b');

    // Then
    expect(scheduler.size).toBe(2);
    expect(scheduler.pop()).toEqual({ key: 'a', executeAt: 100 });
    expect(scheduler.pop()).toEqual({ key: 'c', executeAt: 300 });
  });

  it('remove 대상이 존재하지 않으면 힙 상태는 변하지 않아야 한다', () => {
    // Given
    scheduler.push('a', 100);
    scheduler.push('b', 200);

    // When
    scheduler.remove('not-exist');

    // Then
    expect(scheduler.size).toBe(2);
    expect(scheduler.peek()).toEqual({ key: 'a', executeAt: 100 });
  });

  it('동일 key로 push/remove/push를 반복하면 마지막 push 값 기준으로 우선순위가 반영되어야 한다', () => {
    // Given
    scheduler.push('k', 500);
    scheduler.remove('k');

    // When
    scheduler.push('k', 100);
    scheduler.push('x', 200);

    // Then
    expect(scheduler.pop()).toEqual({ key: 'k', executeAt: 100 });
    expect(scheduler.pop()).toEqual({ key: 'x', executeAt: 200 });
  });
});
