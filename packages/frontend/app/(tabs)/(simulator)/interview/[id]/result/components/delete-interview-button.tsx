"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { deleteInterview } from "../actions";

export default function DeleteInterviewButton({
  interviewId,
  userToken,
}: {
  interviewId: string;
  userToken: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteInterview({ interviewId, userToken });
      router.push("/");
    } catch (error) {
      console.error("면접 삭제 실패:", error);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-start justify-between">
            <h3 className="text-lg font-semibold">면접 기록 삭제</h3>
            <button
              onClick={() => setShowConfirm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mb-6 text-sm text-gray-600">
            정말로 이 면접 기록을 삭제하시겠습니까?
            <br />
            삭제된 데이터는 복구할 수 없습니다.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="destructive"
      onClick={() => setShowConfirm(true)}
      className="w-full sm:w-auto"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      면접 기록 삭제
    </Button>
  );
}
