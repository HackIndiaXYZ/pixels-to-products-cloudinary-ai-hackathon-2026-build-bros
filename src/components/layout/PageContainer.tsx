import { ReactNode } from "react";
import { PageTransition } from "@/components/motion/PageTransition";

export function PageContainer({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <PageTransition className={`p-8 max-w-[1600px] mx-auto ${className}`}>
      {children}
    </PageTransition>
  );
}
