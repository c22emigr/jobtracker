"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Star, StarOff, Check } from "lucide-react";
import { Job } from "@/lib/types";

export function RowMenu({
  job,
  onEdit,
  onDelete,
  onUpdateStatus,
  onToggleFavorite,
}: {
  job: Job;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateStatus: (s: Job["status"]) => void;
  onToggleFavorite: () => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="More actions"
          className="p-2 rounded-md hover:bg-[var(--surface-2)] transition border border-[color:var(--border)]"
        >
          <MoreHorizontal className="w-5 h-5 text-[var(--muted-foreground)]" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={8}
          className="z-50 min-w-56 rounded-2xl 
                    border border-[color:var(--border)]
                    bg-[var(--surface)] text-[var(--foreground)]
                    [box-shadow:var(--shadow-lg)]"
        >
          <DropdownMenu.Label className="px-2 py-1.5 text-xs opacity-70 border-b border-[color:var(--border)]">
            Update status
          </DropdownMenu.Label>

          <Item onSelect={() => onUpdateStatus("applied")} icon={<Check className="w-4 h-4" />}>
            Mark as Applied
          </Item>
          <Item onSelect={() => onUpdateStatus("interview")} icon={<Check className="w-4 h-4" />}>
            Mark as Interview
          </Item>
          <Item onSelect={() => onUpdateStatus("rejected")} icon={<Check className="w-4 h-4" />}>
            Mark as Rejected
          </Item>

          <DropdownMenu.Separator className="my-1 h-px bg-[color:var(--border)]" />

          <Item onSelect={onEdit} icon={<Pencil className="w-4 h-4" />}>Edit</Item>
          <Item
            onSelect={onToggleFavorite}
            icon={job.favorite ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
          >
            {job.favorite ? "Unfavorite" : "Favorite"}
          </Item>

          <DropdownMenu.Separator className="my-1 h-px bg-[color:var(--border)]" />

          <Item
            onSelect={onDelete}
            destructive
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function Item({
  onSelect,
  children,
  icon,
  destructive,
}: {
  onSelect: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <DropdownMenu.Item
      onSelect={onSelect}
      className={`relative flex items-center gap-2
                px-3 py-2.5 text-sm rounded-xl outline-none select-none
                data-[highlighted]:bg-[var(--surface-2)]
                data-[highlighted]:text-[var(--foreground)]
                  ${destructive ? "text-red-600" : ""}`}
    >
      {icon}
      <span className="text-sm">{children}</span>
    </DropdownMenu.Item>
  );
}