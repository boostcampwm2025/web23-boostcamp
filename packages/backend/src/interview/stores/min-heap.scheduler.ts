export interface ScheduledTask {
  key: string;
  executeAt: number;
}

export class MinHeapScheduler {
  private heap: ScheduledTask[] = [];

  public push(key: string, executeAt: number): void {
    const task: ScheduledTask = { key, executeAt };
    this.heap.push(task);
    this.bubbleUp(this.heap.length - 1);
  }

  public pop(): ScheduledTask | undefined {
    if (this.heap.length === 0) return undefined;

    const root = this.heap[0];
    const last = this.heap.pop();

    if (this.heap.length > 0 && last) {
      this.heap[0] = last;
      this.trickleDown(0);
    }

    return root;
  }

  public peek(): ScheduledTask | undefined {
    return this.heap.length > 0 ? this.heap[0] : undefined;
  }

  public remove(key: string): void {
    const index = this.heap.findIndex((task) => task.key === key);
    if (index === -1) return;

    // 만약 제거하려는 요소가 마지막 요소라면 그냥 pop
    if (index === this.heap.length - 1) {
      this.heap.pop();
      return;
    }

    // 마지막 요소를 제거하려는 위치로 가져옴
    const last = this.heap.pop();
    if (last) {
      this.heap[index] = last;
      // 위치 변경 후 정렬 조건 유지를 위해 위/아래로 이동 확인
      this.bubbleUp(index);
      this.trickleDown(index);
    }
  }

  public get size(): number {
    return this.heap.length;
  }

  private bubbleUp(index: number): void {
    const element = this.heap[index];
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex];

      if (element.executeAt >= parent.executeAt) break;

      this.heap[index] = parent;
      this.heap[parentIndex] = element;
      index = parentIndex;
    }
  }

  private trickleDown(index: number): void {
    const length = this.heap.length;
    const element = this.heap[index];

    // 무한 루프처럼 보이지만, 트리 높이(log N)만큼만 반복되므로 성능 이슈 없음.
    // 힙의 속성(부모 노드가 자식 노드보다 항상 작아야 함)을 만족시키기 위해
    // 현재 요소를 적절한 위치로 내려보냄.
    while (true) {
      let swapIndex = -1;
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;

      if (leftChildIndex < length) {
        if (this.heap[leftChildIndex].executeAt < element.executeAt) {
          swapIndex = leftChildIndex;
        }
      }

      if (rightChildIndex < length) {
        const swapTarget = swapIndex === -1 ? element : this.heap[swapIndex];
        if (this.heap[rightChildIndex].executeAt < swapTarget.executeAt) {
          swapIndex = rightChildIndex;
        }
      }

      if (swapIndex === -1) break;

      this.heap[index] = this.heap[swapIndex];
      this.heap[swapIndex] = element;
      index = swapIndex;
    }
  }
}
