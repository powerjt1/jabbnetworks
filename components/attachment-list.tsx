import {
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  File as FileIcon,
} from "lucide-react";
import type { Attachment } from "@/lib/types";
import { formatBytes, relativeTime } from "@/lib/utils";

const ICONS = {
  pdf: FileText,
  doc: FileText,
  sheet: FileSpreadsheet,
  image: FileImage,
  zip: FileArchive,
  other: FileIcon,
} as const;

export function AttachmentList({ items }: { items: Attachment[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-3">No attachments.</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((a) => {
        const Icon = ICONS[a.kind];
        return (
          <li key={a.id}>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg border border-line-soft bg-surface p-3 text-left transition-colors hover:border-line"
            >
              <Icon className="size-4 shrink-0 text-ink-3" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{a.name}</span>
                <span className="block text-xs text-ink-3">
                  {formatBytes(a.size)} · {relativeTime(a.uploadedAt)}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
