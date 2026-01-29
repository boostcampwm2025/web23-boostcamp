"use client";

import { Calendar, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import { cn } from "@/app/lib/utils";

export type DocType = "COVER" | "PORTFOLIO";

export interface DocumentItem {
  documentId: string;
  type: DocType;
  title: string;
  createdAt: string;
  modifiedAt: string;
}

interface DocumentCardProps {
  doc: DocumentItem;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  isSelectable?: boolean;
  showDeleteAction?: boolean;
  showCheckbox?: boolean;
  onCardClick?: (doc: DocumentItem) => void;
}

export function DocumentCard({
  doc,
  isSelected,
  onSelect,
  isSelectable = true,
  showDeleteAction = false,
  showCheckbox = false,
  onCardClick,
}: DocumentCardProps) {
  const canClick = isSelectable && !!onSelect;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(doc.documentId);
    }
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(doc);
    } else if (canClick) {
      onSelect!(doc.documentId);
    }
  };

  return (
    <motion.div
      whileTap={onCardClick || canClick ? { scale: 0.98 } : {}}
      className="h-full"
    >
      <Card
        onClick={handleCardClick}
        className={cn(
          "relative h-[180px] overflow-hidden rounded-2xl border-2 transition-all select-none",
          onCardClick || canClick ? "cursor-pointer" : "cursor-default",
          isSelected
            ? "border-emerald-500 bg-emerald-50/20 shadow-md ring-1 ring-emerald-500"
            : "border-border shadow-sm hover:border-emerald-200",
        )}
      >
        <CardContent className="flex h-full flex-col justify-between p-5">
          {showCheckbox && (
            <div
              onClick={handleCheckboxClick}
              className="absolute top-3 left-3 z-20 -m-2 cursor-pointer p-2"
            >
              <Checkbox
                checked={isSelected}
                className="h-4 w-4 border-2 data-checked:border-emerald-500 data-checked:bg-emerald-500"
              />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "rounded-md px-2 py-0.5 text-[10px] font-bold tracking-tight uppercase",
                  doc.type === "COVER"
                    ? "bg-orange-100 text-orange-600"
                    : "bg-blue-100 text-blue-600",
                )}
              >
                {doc.type === "COVER" ? "Cover Letter" : "Portfolio"}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {doc.createdAt}
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="line-clamp-2 text-sm leading-snug font-bold text-foreground">
                {doc.title}
              </h3>
            </div>
          </div>
          <AnimatePresence>
            {showDeleteAction && isSelectable && isSelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm"
              >
                <Check className="h-3.5 w-3.5 stroke-[3px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
