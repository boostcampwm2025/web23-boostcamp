export default function InterviewWelomeHeader({
  username,
}: {
  username: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-2xl font-bold md:text-3xl">
        반갑습니다, {username}님
      </h3>
      <span className="text-sm font-semibold text-muted-foreground md:text-base">
        오늘도 새로운 도전을 준비해볼까요?
      </span>
    </div>
  );
}
