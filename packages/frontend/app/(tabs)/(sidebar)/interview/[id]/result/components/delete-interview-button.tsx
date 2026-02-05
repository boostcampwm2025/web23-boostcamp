"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { deleteInterview } from "../actions";
import { useConfirm } from "@/app/components/confirm/ConfirmProvider";
import { toast } from "react-hot-toast";

export default function DeleteInterviewButton({
  interviewId,
  userToken,
}: {
  interviewId: string;
  userToken: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const showConfirm = useConfirm();

  const handleDelete = async () => {
    const confirmed = await showConfirm(
      "정말로 이 면접 기록을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.",
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteInterview({ interviewId, userToken });
      router.push("/");
    } catch (error) {
      console.error("면접 삭제 실패:", error);
      toast.error("면접 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={isDeleting}
      className="w-full sm:w-auto"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isDeleting ? "삭제 중..." : "면접 기록 삭제"}
    </Button>
  );
}
