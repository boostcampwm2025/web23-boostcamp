import DocumentsClient from "./components/documents-client";

export const dynamic = "force-dynamic";

async function getDocuments() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/document?page=1&take=20`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return { documents: [] };
  }

  return res.json();
}

export default async function Page() {
  const data = await getDocuments();
  const documents = data?.documents ?? [];

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
