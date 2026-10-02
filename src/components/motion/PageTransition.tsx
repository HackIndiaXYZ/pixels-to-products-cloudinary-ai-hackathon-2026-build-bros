"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function PageTransition({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`h-full w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}
