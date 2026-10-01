import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <div className="flex items-center gap-2 font-technical text-[10px] tracking-widest text-[--color-ink-3] uppercase mb-8">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          {item.href ? (
            <Link href={item.href} className="hover:text-[--color-ink] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[--color-ink]">{item.label}</span>
          )}
          {index < items.length - 1 && <ChevronRight className="w-3 h-3 text-[--color-ink-4]" />}
        </div>
      ))}
    </div>
  );
}
