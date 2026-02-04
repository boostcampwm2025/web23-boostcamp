export default function AISummary({ summary }: { summary?: string }) {
  const displaySummary =
    summary && summary.trim()
      ? summary
      : "답변이 충분하지 않아 피드백을 생성할 수 없습니다. 더 성실하게 면접에 임해주세요.";

  return (
    <>
      <h5 className="font-semibold tracking-wide text-primary">
        AI Executive Summary
      </h5>
      <span className="text-sm">{`"${displaySummary}"`}</span>
    </>
  );
}
