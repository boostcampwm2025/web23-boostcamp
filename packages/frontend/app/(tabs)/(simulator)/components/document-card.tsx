"use client";

import { Calendar, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/app/components/ui/card";
import { cn } from "@/app/lib/utils";

export type DocType = "COVER_LETTER" | "PORTFOLIO";

export interface DocumentItem {
  id: string;
  type: DocType;
  title: string;
  date: string;
}

interface DocumentCardProps {
  doc: DocumentItem;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  isSelectable?: boolean;
}

export function DocumentCard({
  doc,
  isSelected,
  onSelect,
  isSelectable = true,
}: DocumentCardProps) {
  const canClick = isSelectable && !!onSelect;

  return (
    <motion.div whileTap={canClick ? { scale: 0.98 } : {}} className="h-full">
      <Card
        onClick={() => canClick && onSelect(doc.id)}
        className={cn(
          "relative h-[180px] overflow-hidden rounded-2xl border-2 transition-all select-none",
          canClick ? "cursor-pointer" : "cursor-default",
          isSelected
            ? "border-emerald-500 bg-emerald-50/20 shadow-md ring-1 ring-emerald-500"
            : "border-border shadow-sm hover:border-emerald-200",
        )}
      >
        <CardContent className="flex h-full flex-col justify-between p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "rounded-md px-2 py-0.5 text-[10px] font-bold tracking-tight uppercase",
                  doc.type === "COVER_LETTER"
                    ? "bg-orange-100 text-orange-600"
                    : "bg-blue-100 text-blue-600",
                )}
              >
                {doc.type === "COVER_LETTER" ? "Cover Letter" : "Portfolio"}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {doc.date}
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="line-clamp-2 text-sm leading-snug font-bold text-foreground">
                {doc.title}
              </h3>
            </div>
          </div>
          <AnimatePresence>
            {isSelectable && isSelected && (
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
