import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
}

export function EmptyState({ icon, title, description, primaryAction, secondaryAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white/50 border border-dashed border-gray-200 rounded-[24px]">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 text-gray-400">
        {icon}
      </div>
      <h3 className="font-editorial text-xl text-gray-900 mb-2">{title}</h3>
      <p className="font-ui text-[13px] text-gray-500 max-w-sm mx-auto mb-8 leading-relaxed">
        {description}
      </p>
      <div className="flex items-center gap-3">
        {primaryAction}
        {secondaryAction}
      </div>
    </div>
  );
}
