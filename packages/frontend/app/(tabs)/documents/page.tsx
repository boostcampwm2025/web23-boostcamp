import { getDocuments } from "@/app/lib/actions/document";
import DocumentsClient from "./components/documents-client";

export default async function Page() {
  const { documents } = await getDocuments();

  return (
    <div className="mx-auto max-w-7xl py-12">
      <header className="mb-10 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          서류 관리
        </h1>
        <p className="text-sm text-muted-foreground">
          면접에 활용할 자기소개서와 포트폴리오를 관리하세요.
        </p>
      </header>
      <DocumentsClient initialDocuments={documents} />
    </div>
  );
}
