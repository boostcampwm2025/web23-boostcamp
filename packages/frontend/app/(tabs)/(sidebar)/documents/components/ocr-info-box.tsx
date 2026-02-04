import { AlertCircle } from "lucide-react";
import { Card } from "@/app/components/ui/card";

interface OcrInfoBoxProps {
  ocrUsedPages: number[];
  portfolioContent: string;
  showMarkerWarning: boolean;
  onMarkAsReviewed: (pageNum: number) => void;
  onScrollToMarker: (pageNum: number) => void;
}

export function OcrInfoBox({
  ocrUsedPages,
  portfolioContent,
  showMarkerWarning,
  onMarkAsReviewed,
  onScrollToMarker,
}: OcrInfoBoxProps) {
  if (ocrUsedPages.length === 0) return null;

  return (
    <Card
      className={`p-4 ${
        showMarkerWarning
          ? "border-red-300 bg-red-50"
          : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className={`mt-0.5 h-5 w-5 shrink-0 ${
            showMarkerWarning ? "text-red-600" : "text-amber-600"
          }`}
        />
        <div className="flex-1">
          <h4
            className={`mb-1 text-sm font-semibold ${
              showMarkerWarning ? "text-red-800" : "text-amber-800"
            }`}
          >
            {showMarkerWarning
              ? "⚠️ 마커를 삭제해야 서류를 생성할 수 있습니다"
              : "OCR로 추출된 페이지가 있습니다"}
          </h4>
          <p
            className={`mb-2 text-xs ${
              showMarkerWarning ? "text-red-700" : "text-amber-700"
            }`}
          >
            {showMarkerWarning ? (
              <>
                다음 페이지를 검수하고{" "}
                <strong className="font-semibold">
                  검수완료 버튼을 눌러주세요.
                </strong>
              </>
            ) : (
              <>
                다음 페이지는 이미지에서 텍스트를 추출했습니다. 반드시 검수하고
                검수완료 버튼을 눌러주세요.
              </>
            )}
          </p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {ocrUsedPages.map((pageNum) => {
              const isReviewed = portfolioContent.includes(
                `[✓ 페이지 ${pageNum} - 검수완료]`,
              );

              return (
                <div key={pageNum} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onScrollToMarker(pageNum)}
                    className={`inline-flex cursor-pointer items-center rounded-md px-2 py-1 text-xs font-medium ring-1 transition-colors ring-inset ${
                      isReviewed
                        ? "bg-green-100 text-green-700 ring-green-600/20 hover:bg-green-200 hover:ring-green-600/40"
                        : "bg-amber-100 text-amber-700 ring-amber-600/20 hover:bg-amber-200 hover:ring-amber-600/40"
                    }`}
                  >
                    {isReviewed ? "✓ " : ""}
                    {pageNum}페이지
                  </button>
                  {!isReviewed && (
                    <button
                      type="button"
                      onClick={() => onMarkAsReviewed(pageNum)}
                      className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-600/20 transition-colors hover:bg-blue-200 hover:ring-blue-600/40"
                    >
                      검수완료
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <p className="rounded border border-amber-200 bg-amber-100/50 px-2 py-1.5 text-xs text-amber-600">
            💡 텍스트에서{" "}
            <code className="rounded bg-amber-200 px-1">
              [📄 페이지 X - OCR 추출]
            </code>{" "}
            마커를 찾아 해당 부분을 확인하고 검수완료 버튼을 눌러주세요.
          </p>
        </div>
      </div>
    </Card>
  );
}
