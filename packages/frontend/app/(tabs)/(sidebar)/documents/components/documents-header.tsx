"use client";

import { Button } from "@/app/components/ui/button";
import { Trash, Plus } from "lucide-react";

interface Props {
  selectedCount: number;
  onOpenCreate: () => void;
  onDeleteClick: () => void;
}

export default function DocumentsHeader({
  selectedCount,
  onOpenCreate,
  onDeleteClick,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-bold">Documents</h2>
      <div className="flex items-center gap-2">
        {selectedCount > 0 ? (
          <Button variant="destructive" size="sm" onClick={onDeleteClick}>
            <Trash className="mr-2" /> 삭제
          </Button>
        ) : (
          <Button size="sm" onClick={onOpenCreate}>
            <Plus className="mr-2" /> 새 서류 등록
          </Button>
        )}
      </div>
    </div>
  );
}
