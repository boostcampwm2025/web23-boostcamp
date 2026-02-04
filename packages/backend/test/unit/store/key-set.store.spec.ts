import { KeySetStore } from '../../../src/interview/stores/key-set.store';

describe('KeySetStore', () => {
  let store: KeySetStore;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));
    store = new KeySetStore();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('새로운 key에 addToSet을 호출하면 값이 저장되고 getSet으로 조회되어야 한다', () => {
    // Given
    const key = 'iv_1';

    // When
    store.addToSet(key, 'topic1', 60_000);

    // Then
    expect(store.getSet(key)).toEqual(['topic1']);
    expect(store.has(key, 'topic1')).toBe(true);
  });

  it('동일 key에 addToSet을 여러 번 호출하면 Set 특성상 중복 없이 저장되어야 한다', () => {
    // Given
    const key = 'iv_1';

    // When
    store.addToSet(key, 't1', 60_000);
    store.addToSet(key, 't1', 60_000);
    store.addToSet(key, 't2', 60_000);

    // Then
    const values = store.getSet(key).sort();
    expect(values).toEqual(['t1', 't2']);
  });

  it('removeFromSet을 호출하면 특정 값이 Set에서 제거되어야 한다', () => {
    // Given
    const key = 'iv_1';
    store.addToSet(key, 't1', 60_000);
    store.addToSet(key, 't2', 60_000);

    // When
    store.removeFromSet(key, 't1');

    // Then
    expect(store.has(key, 't1')).toBe(false);
    expect(store.getSet(key)).toEqual(['t2']);
  });

  it('clear를 호출하면 Set이 삭제되고 getSet은 빈 배열을 반환해야 한다', () => {
    // Given
    const key = 'iv_1';
    store.addToSet(key, 't1', 60_000);

    // When
    store.clear(key);

    // Then
    expect(store.getSet(key)).toEqual([]);
    expect(store.has(key, 't1')).toBe(false);
  });

  it('addToNumber를 호출하면 숫자가 저장되고 getNumber로 조회되어야 한다', () => {
    // Given
    const key = 'iv_1';

    // When
    store.addToNumber(key, 1, 60_000);

    // Then
    expect(store.getNumber(key)).toBe(1);
  });

  it('deleteNumber를 호출하면 숫자가 삭제되어 getNumber가 undefined를 반환해야 한다', () => {
    // Given
    const key = 'iv_1';
    store.addToNumber(key, 123, 60_000);

    // When
    store.deleteNumber(key);

    // Then
    expect(store.getNumber(key)).toBeUndefined();
  });

  it('ttl이 0 이하이면 스케줄링하지 않으며 시간이 지나도 데이터가 유지되어야 한다', () => {
    // Given
    const key = 'iv_1';
    store.onModuleInit(); // cleanup interval 시작 (fake timer)

    // When: ttl=0 (스케줄링 X)
    store.addToSet(key, 't1', 0);
    store.addToNumber(key, 1, -1);

    // cleanup 주기가 여러 번 돌아도 삭제되면 안 됨
    jest.advanceTimersByTime(60_000); // 60초

    // Then
    expect(store.getSet(key)).toEqual(['t1']);
    expect(store.getNumber(key)).toBe(1);
  });

  it('ttl이 지난 key는 cleanup 주기에서 자동 삭제되어야 한다', () => {
    // Given
    store.onModuleInit(); // 5초마다 cleanup
    const key = 'iv_1';

    // When: ttl=3000ms -> 3초 후 만료
    store.addToSet(key, 't1', 3000);

    // 아직 2초 경과: 만료 전
    jest.advanceTimersByTime(2000);
    expect(store.getSet(key)).toEqual(['t1']);

    // 3초 더 경과(총 5초) -> cleanup interval 1회 실행 시점(5초)과 겹치게 만들어 만료 처리 유도
    jest.advanceTimersByTime(3000);

    // Then: 만료되어 삭제
    expect(store.getSet(key)).toEqual([]);
    expect(store.has(key, 't1')).toBe(false);
  });

  it('같은 key에 다시 addToSet을 호출하면 TTL이 갱신되어 이전 만료 시점에 삭제되면 안 된다', () => {
    // Given
    store.onModuleInit();
    const key = 'iv_1';

    // When: ttl=3000ms로 등록
    store.addToSet(key, 't1', 3000);

    // 2초 경과 후 다시 등록(갱신) ttl=10초
    jest.advanceTimersByTime(2000);
    store.addToSet(key, 't2', 10_000);

    // 초기 ttl(3초) 기준이면 이미 만료됐어야 하는 시점까지 이동 (추가 2초 -> 총 4초)
    jest.advanceTimersByTime(2000);

    // Then: TTL 갱신으로 삭제되지 않아야 함
    const values = store.getSet(key).sort();
    expect(values).toEqual(['t1', 't2']);

    // 갱신된 ttl(10초) 기준 만료를 유도: 지금이 총 4초 경과 상태이므로 +6초 더 -> 총 10초 경과
    // cleanup은 5초마다라, 10초 지점 이후 한 번 더 돌게 +5초 추가
    jest.advanceTimersByTime(11_000);

    // Then: 만료되어 삭제
    expect(store.getSet(key)).toEqual([]);
  });

  it('addToNumber도 TTL이 지나면 cleanup에서 자동 삭제되어야 한다', () => {
    // Given
    store.onModuleInit();
    const key = 'iv_1';

    // When: ttl=3000ms
    store.addToNumber(key, 7, 3000);

    // 5초 지나면 cleanup 실행되며 만료 처리됨
    jest.advanceTimersByTime(5000);

    // Then
    expect(store.getNumber(key)).toBeUndefined();
  });

  it('clear를 호출하면 스케줄에서도 제거되어 이후 cleanup 주기에서 추가 삭제 동작이 발생하지 않아야 한다', () => {
    // Given
    store.onModuleInit();
    const key = 'iv_1';
    store.addToSet(key, 't1', 3000);

    // When: 바로 clear
    store.clear(key);

    // 만료 시점이 지나도록 시간 이동
    jest.advanceTimersByTime(10_000);

    // Then: 이미 비어있고 안정적으로 유지
    expect(store.getSet(key)).toEqual([]);
  });
});
