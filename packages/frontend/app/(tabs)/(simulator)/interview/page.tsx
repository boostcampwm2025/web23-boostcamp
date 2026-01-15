import Link from "next/link";

export default function InterviewPage() {
  return (
    <div>
      <h3>데모용 기술 면접 시작 페이지 입니다.</h3>
      <p>곧 기능이 추가될 예정입니다.</p>
      <Link href={"/interview/1"}>
        <button className="cursor-pointer">면접 시작</button>
      </Link>
    </div>
  );
}
