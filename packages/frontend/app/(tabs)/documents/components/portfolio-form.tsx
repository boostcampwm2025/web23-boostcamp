import { RefObject } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { IPdfExtractionProgress } from "@/app/lib/pdf-extractor";
import { OcrInfoBox } from "./ocr-info-box";

const MAX_CONTENT_LENGTH = 30000;

interface PortfolioFormProps {
  portfolioContent: string;
  onContentChange: (content: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  isExtracting: boolean;
  uploadProgress: IPdfExtractionProgress | null;
  ocrUsedPages: number[];
  showMarkerWarning: boolean;
  onPdfUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onMarkPageAsReviewed: (pageNum: number) => void;
  onScrollToMarker: (pageNum: number) => void;
}

export function PortfolioForm({
  portfolioContent,
  onContentChange,
  textareaRef,
  isExtracting,
  uploadProgress,
  ocrUsedPages,
  showMarkerWarning,
  onPdfUpload,
  onMarkPageAsReviewed,
  onScrollToMarker,
}: PortfolioFormProps) {
  const portfolioLength = portfolioContent.length;
  const isPortfolioTooLong = portfolioLength > MAX_CONTENT_LENGTH;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">
          포트폴리오 내용
        </label>
        <label
          htmlFor="pdf-upload"
          className="cursor-pointer rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
        >
          <Upload className="mr-1.5 inline h-4 w-4" />
          PDF 업로드
        </label>
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onPdfUpload}
          disabled={isExtracting}
        />
      </div>

      {/* PDF 추출 진행률 */}
      {uploadProgress && (
        <Card className="border-blue-200 bg-blue-50 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-blue-700">
              {uploadProgress.message}
            </span>
            <span className="text-blue-600">
              {uploadProgress.currentPage}/{uploadProgress.totalPages}
            </span>
          </div>
          <Progress
            value={
              (uploadProgress.currentPage / uploadProgress.totalPages) * 100
            }
            className="h-2"
          />
        </Card>
      )}

      {/* OCR 사용 안내 */}
      <OcrInfoBox
        ocrUsedPages={ocrUsedPages}
        portfolioContent={portfolioContent}
        showMarkerWarning={showMarkerWarning}
        onMarkAsReviewed={onMarkPageAsReviewed}
        onScrollToMarker={onScrollToMarker}
      />

      <textarea
        ref={textareaRef}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm leading-relaxed transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        placeholder="포트폴리오 내용을 입력하거나 PDF를 업로드하세요"
        rows={16}
        value={portfolioContent}
        onChange={(event) => onContentChange(event.target.value)}
        disabled={isExtracting}
        required
      />

      {/* 글자수 카운터 */}
      <div className="flex items-center justify-between text-xs">
        <span
          className={`font-medium ${
            isPortfolioTooLong ? "text-red-600" : "text-gray-500"
          }`}
        >
          {portfolioLength.toLocaleString()} /{" "}
          {MAX_CONTENT_LENGTH.toLocaleString()}자
        </span>
        {isPortfolioTooLong && (
          <span className="flex items-center gap-1 text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            최대 글자수를 초과했습니다
          </span>
        )}
      </div>
    </div>
  );
}
