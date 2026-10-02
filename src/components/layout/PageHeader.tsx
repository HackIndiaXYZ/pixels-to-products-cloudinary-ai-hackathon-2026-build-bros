import { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs?: Breadcrumb[];
  category?: string;
  title: string;
  description?: string;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
  backLink?: string;
  backLabel?: string;
}

export function PageHeader({
  breadcrumbs,
  category,
  title,
  description,
  primaryAction,
  secondaryActions,
  backLink,
  backLabel = "BACK"
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-6 mb-8 mt-2">
      {backLink && (
        <div className="mb-[-12px]">
          <Link href={backLink} className="font-ui text-[10px] font-semibold tracking-wider text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 uppercase">
            <ArrowLeft className="w-3 h-3" /> {backLabel}
          </Link>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-3">
          {/* Breadcrumbs & Category */}
          <div className="flex flex-wrap items-center gap-2 font-ui text-[11px] font-medium tracking-wide text-gray-500 uppercase">
            {breadcrumbs && breadcrumbs.map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-gray-900 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300" />}
              </div>
            ))}
            {breadcrumbs && category && (
              <>
                <ChevronRight className="w-3 h-3 text-gray-300" />
                <span className="text-gray-900">{category}</span>
              </>
            )}
            {!breadcrumbs && category && <span className="text-gray-900">{category}</span>}
          </div>

          {/* Title & Description */}
          <div>
            <h1 className="font-editorial text-3xl font-medium tracking-tight text-gray-900">
              {title}
            </h1>
            {description && (
              <p className="font-ui text-[13px] text-gray-500 mt-2 max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {(primaryAction || secondaryActions) && (
          <div className="flex items-center gap-3 shrink-0">
            {secondaryActions}
            {primaryAction}
          </div>
        )}
      </div>
    </div>
  );
}
