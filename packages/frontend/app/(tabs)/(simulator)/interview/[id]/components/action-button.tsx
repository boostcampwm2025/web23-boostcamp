"use client";

import { motion } from "motion/react";

const iconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

interface IActionButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
}

export default function ActionButton({ icon, onClick }: IActionButtonProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={iconVariants}
      transition={{ duration: 0.15 }}
      onClick={onClick}
    >
      {icon}
    </motion.div>
  );
}
