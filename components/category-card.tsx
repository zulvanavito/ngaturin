"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryIcon } from "@/components/category-icon";

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: string;
}

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

const TYPE_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  expense: { label: "Pengeluaran", bg: "bg-expense/10", text: "text-expense" },
  income: { label: "Pemasukan", bg: "bg-income/10", text: "text-income" },
  all: { label: "Keduanya", bg: "bg-blue-500/10", text: "text-blue-600" },
};

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const style = TYPE_STYLES[category.type] || TYPE_STYLES.expense;

  // Generate a consistent accent color from the category name
  const hue = category.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const accentColor = `hsl(${hue}, 60%, 55%)`;

  return (
    <div className="group relative bg-white dark:bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 p-5 sm:p-6 shadow-ring transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
      {/* Subtle background glow */}
      <div
        className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-[0.04] blur-2xl transition-transform duration-700 group-hover:scale-150 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0">
          {/* Icon Bubble */}
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-6"
            style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
          >
            <CategoryIcon iconName={category.icon} className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>

          {/* Title & Badge */}
          <div className="min-w-0">
            <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight leading-tight truncate">
              {category.name}
            </h3>
            <span className={`inline-block mt-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${style.bg} ${style.text}`}>
              {style.label}
            </span>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted/50 transition-colors relative z-10 shrink-0"
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl border-border/40 shadow-xl p-2">
            <DropdownMenuItem
              onClick={() => onEdit(category)}
              className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-muted/50"
            >
              <Pencil className="w-4 h-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(category.id)}
              className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-semibold text-expense cursor-pointer hover:bg-expense/10"
            >
              <Trash2 className="w-4 h-4" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
