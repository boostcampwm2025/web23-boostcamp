import { Lightbulb } from "lucide-react";

const tips = [
  "면접 시작 전 깊게 숨을 쉬고 긴장을 풀어보세요.",
  "질문을 완전히 이해한 후 답변하세요. 서두르지 마세요.",
  "구체적인 예시와 경험을 들어 답변의 신뢰도를 높이세요.",
  "눈 맞춤을 유지하고 천천히 명확하게 말씀하세요.",
  "침묵이 생기더라도 생각할 시간이 필요하다고 말씀하세요.",
  "자신의 강점뿐 아니라 개선할 점도 언급하면 좋은 인상을 줍니다.",
  "STAR 방법론(상황, 과제, 행동, 결과)을 활용해 구조적으로 답변하세요.",
  "기술 면접에서는 사고 과정을 소리내어 설명하며 진행하세요.",
  "답변 후 면접관의 피드백을 받을 준비를 하고 열린 마음으로 들으세요.",
  "성과를 이야기할 때는 구체적인 수치와 데이터를 포함하세요.",
  "준비하지 못한 질문이 나오면 당황하지 말고 차분하게 생각한 후 답변하세요.",
  "면접 후 감사 메일을 보내며 추가 의견을 표현하는 것도 좋습니다.",
];

const randomTip = tips[Math.floor(Math.random() * tips.length)];

export default function Tip({
  title,
  content,
}: {
  title?: string;
  content?: string;
}) {
  return (
    <div className="flex gap-5">
      <div className="rounded-lg bg-primary/20 p-3">
        <Lightbulb className="text-primary" />
      </div>
      <div className="mt-2 flex flex-col gap-1.5">
        <span className="text-xs font-semibold tracking-wide text-primary uppercase">
          {title ?? "면접 팁"}
        </span>
        <span className="text-xs">{content ?? randomTip}</span>
      </div>
    </div>
  );
}
