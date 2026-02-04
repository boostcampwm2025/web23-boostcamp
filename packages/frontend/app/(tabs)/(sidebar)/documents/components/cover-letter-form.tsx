import { Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";

interface QuestionAnswer {
  question: string;
  answer: string;
}

interface CoverLetterFormProps {
  questionAnswerList: QuestionAnswer[];
  onUpdate: (index: number, field: keyof QuestionAnswer, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function CoverLetterForm({
  questionAnswerList,
  onUpdate,
  onAdd,
  onRemove,
}: CoverLetterFormProps) {
  return (
    <div className="space-y-4">
      <div className="mb-3 flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">
          질문 & 답변
        </label>
        <Button type="button" onClick={onAdd} size="sm" variant="outline">
          <Plus className="mr-1 h-4 w-4" />
          질문 추가
        </Button>
      </div>

      <AnimatePresence mode="popLayout">
        {questionAnswerList.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="relative overflow-hidden border-2 p-5 transition-shadow hover:shadow-md">
              <div className="absolute top-0 left-0 h-full w-1 bg-blue-500" />

              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">
                  질문 {index + 1}
                </span>
                {questionAnswerList.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => onRemove(index)}
                    className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <input
                placeholder="질문을 입력하세요"
                className="mb-3 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-400/20 focus:outline-none"
                value={item.question}
                onChange={(event) =>
                  onUpdate(index, "question", event.target.value)
                }
                required
              />

              <textarea
                placeholder="답변을 입력하세요"
                className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-relaxed transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none"
                rows={4}
                value={item.answer}
                onChange={(event) =>
                  onUpdate(index, "answer", event.target.value)
                }
                required
              />
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
