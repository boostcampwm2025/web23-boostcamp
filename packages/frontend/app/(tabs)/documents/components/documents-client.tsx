"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Trash, Plus } from "lucide-react";
import {
  DocumentCard,
  DocumentItem,
} from "@/app/(tabs)/(simulator)/components/document-card";
import DocumentCreateModal from "./document-create-modal";
import { deleteDocumentsClientSideBulk } from "../../../lib/client/document";

interface Props {
  initialDocuments: DocumentItem[];
}

export default function DocumentsClient({ initialDocuments }: Props) {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>(
    initialDocuments || [],
  );
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Set<string>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allDocumentIds = useMemo(
    () => documents.map((document) => document.documentId),
    [documents],
  );

  const isAllSelected = useMemo(
    () =>
      allDocumentIds.length > 0 &&
      allDocumentIds.every((id) => selectedDocumentIds.has(id)),
    [allDocumentIds, selectedDocumentIds],
  );

  function toggleDocumentSelection(documentId: string) {
    setSelectedDocumentIds((previousIds) => {
      const nextIds = new Set(previousIds);
      if (nextIds.has(documentId)) {
        nextIds.delete(documentId);
      } else {
        nextIds.add(documentId);
      }
      return nextIds;
    });
  }

  function toggleSelectAllVisible() {
    setSelectedDocumentIds((previousIds) => {
      const nextIds = new Set(previousIds);
      if (isAllSelected) {
        allDocumentIds.forEach((id) => nextIds.delete(id));
      } else {
        allDocumentIds.forEach((id) => nextIds.add(id));
      }
      return nextIds;
    });
  }

  async function handleDeleteDocuments() {
    if (selectedDocumentIds.size === 0) return;

    const shouldProceed = window.confirm(
      `${selectedDocumentIds.size}개의 서류를 삭제하시겠습니까?`,
    );
    if (!shouldProceed) return;

    setIsLoading(true);
    try {
      const documentMap: Record<string, DocumentItem> = {};
      documents.forEach(
        (document) => (documentMap[document.documentId] = document),
      );

      const targetIds = Array.from(selectedDocumentIds);
      const { successIds, failedIds } = await deleteDocumentsClientSideBulk(
        targetIds,
        documentMap,
      );

      if (successIds.length > 0) {
        setDocuments((previousDocuments) =>
          previousDocuments.filter(
            (document) => !successIds.includes(document.documentId),
          ),
        );
      }

      setSelectedDocumentIds((previousIds) => {
        const nextIds = new Set(previousIds);
        successIds.forEach((id) => nextIds.delete(id));
        return nextIds;
      });

      if (failedIds.length > 0) {
        alert(`${failedIds.length}개 항목 삭제에 실패했습니다.`);
      }

      router.refresh();
    } catch (error) {
      console.error("Bulk deletion failed:", error);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Documents</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleSelectAllVisible}>
            {isAllSelected ? "Unselect all" : "Select all"}
          </Button>

          {selectedDocumentIds.size > 0 ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteDocuments}
              disabled={isLoading}
            >
              <Trash className="mr-2 h-4 w-4" /> 삭제
            </Button>
          ) : (
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> 새 서류 등록
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((document: DocumentItem) => (
          <DocumentCard
            key={document.documentId}
            doc={document}
            isSelected={selectedDocumentIds.has(document.documentId)}
            onSelect={toggleDocumentSelection}
            isSelectable={true}
            showDeleteAction={true}
          />
        ))}
      </div>

      <DocumentCreateModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={(newDocument: DocumentItem) => {
          setDocuments((previousDocuments) => [
            newDocument,
            ...previousDocuments,
          ]);
          setIsModalOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
