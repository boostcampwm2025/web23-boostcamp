import { Cpu } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const questionVariants = {
  enter: { opacity: 0, y: 16 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
} as const;

interface IInterviewQuestion {
  question: string;
}

export const InterviewQuestion = ({ question }: IInterviewQuestion) => {
  return (
    <>
      <div className="w-fit rounded-3xl bg-primary p-5 shadow-2xl">
        <Cpu className="size-8 text-white" />
      </div>

      <motion.div
        layout
        className="max-w-lg text-center text-3xl font-extrabold text-pretty"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={question}
            initial="enter"
            animate="center"
            exit="exit"
            variants={questionVariants}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {question}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </>
  );
};
