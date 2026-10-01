"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Trash2, Download, RotateCcw } from "lucide-react";
import { archiveEvidenceAction, unarchiveEvidenceAction, deleteEvidenceAction } from "@/lib/actions";

export function ReportActions({ id, isArchived }: { id: string, isArchived: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleArchive() {
    setLoading(true);
    await (isArchived ? unarchiveEvidenceAction(id) : archiveEvidenceAction(id));
    router.refresh();
    router.push(isArchived ? "/dashboard/evidence" : "/dashboard/archive");
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this analysis? The underlying Cloudinary asset will not be deleted.")) return;
    setLoading(true);
    await deleteEvidenceAction(id);
    router.refresh();
    router.push("/dashboard/evidence");
  }

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleArchive}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1 border border-[--color-rule] bg-[--color-surface] text-[--color-ink-2] font-technical text-[10px] uppercase hover:bg-[--color-surface-2] disabled:opacity-50"
      >
        {isArchived ? (
          <><RotateCcw className="w-3 h-3" /> Restore</>
        ) : (
          <><Archive className="w-3 h-3" /> Archive</>
        )}
      </button>

      <button 
        onClick={handleDelete}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1 border border-red-500/30 text-red-600 bg-[--color-surface] font-technical text-[10px] uppercase hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 className="w-3 h-3" /> Delete
      </button>
      
      <button className="flex items-center gap-2 px-3 py-1 border border-[--color-rule] bg-[--color-surface] text-[--color-ink-2] font-technical text-[10px] uppercase hover:bg-[--color-surface-2]">
        <Download className="w-3 h-3" /> PDF
      </button>
    </div>
  );
}
