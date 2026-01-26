import { FALLBACK_MOCK_DATA } from "@/app/lib/mock/documents";
import DocumentsClient from "./components/documents-client";

export const dynamic = "force-dynamic";

async function getDocuments() {
  if (process.env.NODE_ENV === "development") {
    return { documents: FALLBACK_MOCK_DATA };
  }

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
    <div>
      <main className="mx-auto max-w-180">
        <div className="mt-12">
          <DocumentsClient initialDocuments={documents} />
        </div>
      </main>
    </div>
  );
}
