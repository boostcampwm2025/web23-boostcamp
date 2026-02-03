import { useState, useEffect } from "react";
import { DocumentItem } from "@/app/(tabs)/(simulator)/components/document-card";
import { formatIsoDateToDot } from "@/app/lib/utils";
import { getDocuments } from "./actions";

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDocs = async () => {
      try {
        setIsLoading(true);

        const data = await getDocuments();
        const mapped: DocumentItem[] = data.documents.map((item) => ({
          documentId: item.documentId,
          type: item.type,
          title: item.title,
          createdAt: formatIsoDateToDot(item.createdAt),
          modifiedAt: formatIsoDateToDot(item.createdAt),
        }));
        setDocuments(mapped);
      } catch {
        setDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocs();
  }, []);

  const addDocument = (newDocument: DocumentItem) => {
    setDocuments((prev) => [newDocument, ...prev]);
  };

  return { documents, isLoading, addDocument };
}
