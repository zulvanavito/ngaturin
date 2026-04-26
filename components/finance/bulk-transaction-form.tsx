"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useCategories } from "@/hooks/use-categories";
import { useWallets } from "@/hooks/use-wallets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Check, Loader2, CalendarDays } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import { CategoryIcon } from "@/components/categories/category-icon";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface BulkRow {
  date: string;
  amount: string;
  type: "income" | "expense";
  wallet_id: string;
  category: string;
  description: string;
}

interface BulkFormValues {
  rows: BulkRow[];
}

interface BulkTransactionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const defaultRow = (): BulkRow => ({
  date: new Date().toISOString().split("T")[0],
  amount: "",
  type: "expense",
  wallet_id: "_none",
  category: "",
  description: "",
});

export function BulkTransactionForm({
  onSuccess,
  onCancel,
}: BulkTransactionFormProps) {
  const { showToast } = useToast();
  const { categories: allCategories, loading: catLoading } = useCategories();
  const { wallets } = useWallets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { control, handleSubmit, watch, setValue } = useForm<BulkFormValues>({
    defaultValues: {
      rows: [defaultRow(), defaultRow(), defaultRow()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rows",
  });

  const watchedRows = watch("rows");

  const getFilteredCategories = (type: "income" | "expense") => {
    return allCategories.filter((c) => c.type === type || c.type === "all");
  };

  const handleAddRow = () => {
    const lastRow = watchedRows[watchedRows.length - 1];
    append({
      date: lastRow?.date || new Date().toISOString().split("T")[0],
      amount: "",
      type: lastRow?.type || "expense",
      wallet_id: lastRow?.wallet_id || "_none",
      category: lastRow?.category || "",
      description: "",
    });
  };

  const onSubmit = async (data: BulkFormValues) => {
    const validRows = data.rows.filter(
      (r) => r.amount && r.category && r.description,
    );

    if (validRows.length === 0) {
      setApiError("Minimal 1 baris transaksi yang lengkap harus diisi");
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const res = await fetch("/api/transactions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions: validRows.map((r) => ({
            ...r,
            amount: Number(r.amount),
          })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menyimpan transaksi");
      }

      showToast(
        "success",
        `${validRows.length} transaksi berhasil ditambahkan!`,
      );
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setApiError(msg);
      showToast("error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="mb-4 sm:mb-6 px-1 shrink-0">
        <h2 className="text-2xl font-black tracking-tight">
          Input Transaksi Massal
        </h2>
        <p className="text-muted-foreground font-medium mt-1">
          Tambah banyak transaksi sekaligus. Otomatis ikut baris sebelumnya.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 flex flex-col min-h-0 gap-4"
      >
        {/* Scrollable rows area */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scrollbar -mx-1 px-1">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[120px_110px_130px_140px_1fr_1fr_44px] gap-2 mb-2 px-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Tanggal
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Jumlah
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Tipe
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Dompet
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Kategori
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Catatan
              </span>
              <span></span>
            </div>

            <div className="space-y-2">
              {fields.map((field, index) => {
                const rowType = watchedRows[index]?.type || "expense";
                const filteredCats = getFilteredCategories(rowType);

                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-[120px_110px_130px_140px_1fr_1fr_44px] gap-2 items-center p-2 rounded-2xl bg-muted/20 border border-border/20 hover:border-border/40 transition-colors"
                  >
                    <Input
                      type="date"
                      value={watchedRows[index]?.date || ""}
                      onChange={(e) =>
                        setValue(`rows.${index}.date`, e.target.value)
                      }
                      className="h-10 rounded-xl border-border/30 text-sm px-2"
                    />
                    <Input
                      type="number"
                      placeholder="0"
                      min="1"
                      value={watchedRows[index]?.amount || ""}
                      onChange={(e) =>
                        setValue(`rows.${index}.amount`, e.target.value)
                      }
                      className="h-10 rounded-xl border-border/30 text-sm px-2"
                    />
                    <Select
                      value={rowType}
                      onValueChange={(val) => {
                        setValue(
                          `rows.${index}.type`,
                          val as "income" | "expense",
                        );
                        const currentCat = watchedRows[index]?.category;
                        const stillValid = allCategories.some(
                          (c) =>
                            c.name === currentCat &&
                            (c.type === val || c.type === "all"),
                        );
                        if (!stillValid) setValue(`rows.${index}.category`, "");
                      }}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-border/30 text-sm px-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem
                          value="expense"
                          className="text-[11px] font-bold"
                        >
                          Pengeluaran
                        </SelectItem>
                        <SelectItem
                          value="income"
                          className="text-[11px] font-bold"
                        >
                          Pemasukan
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={watchedRows[index]?.wallet_id || "_none"}
                      onValueChange={(val) =>
                        setValue(`rows.${index}.wallet_id`, val)
                      }
                    >
                      <SelectTrigger className="h-10 rounded-xl border-border/30 text-sm px-2">
                        <SelectValue placeholder="Dompet" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem
                          value="_none"
                          className="text-[11px] font-bold"
                        >
                          Tanpa Dompet
                        </SelectItem>
                        {wallets.map((w) => (
                          <SelectItem
                            key={w.id}
                            value={w.id}
                            className="text-[11px] font-medium"
                          >
                            <div className="flex items-center gap-2">
                              <CategoryIcon
                                iconName={w.icon}
                                className="w-3.5 h-3.5 opacity-70"
                              />
                              <span>{w.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={watchedRows[index]?.category || ""}
                      onValueChange={(val) =>
                        setValue(`rows.${index}.category`, val)
                      }
                      disabled={catLoading || filteredCats.length === 0}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-border/30 text-sm px-2">
                        <SelectValue
                          placeholder={
                            catLoading ? "Memuat..." : "Pilih salah satu..."
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-2xl max-h-[200px]">
                        {filteredCats.map((cat) => (
                          <SelectItem
                            key={cat.id}
                            value={cat.name}
                            className="text-[11px] font-medium"
                          >
                            <div className="flex items-center gap-2">
                              <CategoryIcon
                                iconName={cat.icon}
                                className="w-3.5 h-3.5 opacity-70"
                              />
                              <span>{cat.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="cth.  Kopi Kenangan"
                      value={watchedRows[index]?.description || ""}
                      onChange={(e) =>
                        setValue(`rows.${index}.description`, e.target.value)
                      }
                      className="h-10 rounded-xl border-border/30 text-sm px-3"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => fields.length > 1 && remove(index)}
                      disabled={fields.length <= 1}
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3">
            {fields.map((field, index) => {
              const rowType = watchedRows[index]?.type || "expense";
              const filteredCats = getFilteredCategories(rowType);

              return (
                <div
                  key={field.id}
                  className="p-4 rounded-2xl bg-muted/15 border border-border/20 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Baris {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => fields.length > 1 && remove(index)}
                      disabled={fields.length <= 1}
                      className="h-8 w-8 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Tanggal
                      </label>
                      <DatePicker
                        selected={
                          watchedRows[index]?.date
                            ? new Date(watchedRows[index].date + "T00:00:00")
                            : new Date()
                        }
                        onChange={(date: Date | null) => {
                          if (date) {
                            const y = date.getFullYear();
                            const m = String(date.getMonth() + 1).padStart(
                              2,
                              "0",
                            );
                            const d = String(date.getDate()).padStart(2, "0");
                            setValue(`rows.${index}.date`, `${y}-${m}-${d}`);
                          }
                        }}
                        dateFormat="dd/MM/yyyy"
                        maxDate={new Date()}
                        popperPlacement="bottom-start"
                        customInput={
                          <button
                            type="button"
                            className="h-10 w-full rounded-xl border border-border/30 bg-transparant px-3 text-sm text-left flex items-center gap-2 hover:border-border/50 transition-colors"
                          >
                            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">
                              {watchedRows[index]?.date
                                ? new Date(
                                    watchedRows[index].date + "T00:00:00",
                                  ).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })
                                : "Pilih..."}
                            </span>
                          </button>
                        }
                        wrapperClassName="w-full"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Jumlah
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        min="1"
                        value={watchedRows[index]?.amount || ""}
                        onChange={(e) =>
                          setValue(`rows.${index}.amount`, e.target.value)
                        }
                        className="h-10 rounded-xl border-border/30 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Tipe
                    </label>
                    <Select
                      value={rowType}
                      onValueChange={(val) => {
                        setValue(
                          `rows.${index}.type`,
                          val as "income" | "expense",
                        );
                        const currentCat = watchedRows[index]?.category;
                        const stillValid = allCategories.some(
                          (c) =>
                            c.name === currentCat &&
                            (c.type === val || c.type === "all"),
                        );
                        if (!stillValid) setValue(`rows.${index}.category`, "");
                      }}
                    >
                      <SelectTrigger className="h-10 rounded-xl w-full border-border/30 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem
                          value="expense"
                          className="text-[11px] font-medium"
                        >
                          Pengeluaran
                        </SelectItem>
                        <SelectItem
                          value="income"
                          className="text-[11px] font-medium"
                        >
                          Pemasukan
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Dompet
                      </label>
                      <Select
                        value={watchedRows[index]?.wallet_id || "_none"}
                        onValueChange={(val) =>
                          setValue(`rows.${index}.wallet_id`, val)
                        }
                      >
                        <SelectTrigger className="h-10 rounded-xl w-full border-border/30 text-sm">
                          <SelectValue placeholder="Dompet" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                          <SelectItem
                            value="_none"
                            className="text-[11px] font-memedium"
                          >
                            Tanpa Dompet
                          </SelectItem>
                          {wallets.map((w) => (
                            <SelectItem
                              key={w.id}
                              value={w.id}
                              className="text-[11px] font-medium"
                            >
                              <div className="flex items-center gap-2">
                                <CategoryIcon
                                  iconName={w.icon}
                                  className="w-3.5 h-3.5 opacity-70"
                                />
                                <span className="truncate w-20">{w.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Kategori
                      </label>
                      <Select
                        value={watchedRows[index]?.category || ""}
                        onValueChange={(val) =>
                          setValue(`rows.${index}.category`, val)
                        }
                        disabled={catLoading || filteredCats.length === 0}
                      >
                        <SelectTrigger className="h-10 rounded-xl w-full border-border/30 text-sm">
                          <SelectValue
                            placeholder={catLoading ? "Memuat..." : "Pilih..."}
                          />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl max-h-[200px]">
                          {filteredCats.map((cat) => (
                            <SelectItem
                              key={cat.id}
                              value={cat.name}
                              className="text-[11px] font-medium"
                            >
                              <div className="flex items-center gap-2">
                                <CategoryIcon
                                  iconName={cat.icon}
                                  className="w-3.5 h-3.5 opacity-70"
                                />
                                <span className="truncate w-20">
                                  {cat.name}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Catatan
                    </label>
                    <Input
                      placeholder="cth. Kopi Kenangan"
                      value={watchedRows[index]?.description || ""}
                      onChange={(e) =>
                        setValue(`rows.${index}.description`, e.target.value)
                      }
                      className="h-10 rounded-xl border-border/30 text-sm"
                    />
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              onClick={handleAddRow}
              className="w-full text-center text-sm font-bold flex items-center justify-center gap-2 py-2 text-foreground/80 hover:text-foreground transition-colors"
            >
              + Tambah Baris
            </button>
          </div>
        </div>

        {/* Error */}
        {apiError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-bold shrink-0">
            <span className="shrink-0 text-base">⚠️</span> {apiError}
          </div>
        )}

        {/* Desktop Footer */}
        <div className="hidden md:flex items-center justify-between pt-4 border-t border-border/20 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddRow}
            className="rounded-full border-border/40 font-bold text-xs uppercase tracking-widest gap-2 h-11 px-5 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Tambah Baris
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="rounded-full h-11 px-5 font-bold text-xs uppercase tracking-widest"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-[#9fe870] text-[#163300] hover:bg-[#cdffad] font-black text-sm h-11 px-6 gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3px]" />
                  Simpan Semau
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="md:hidden flex flex-col gap-4 shrink-0">
          <div className="h-px w-full bg-border/40"></div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="rounded-full h-11 font-bold text-xs uppercase tracking-widest border-border/40"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-[#9fe870] text-[#163300] hover:bg-[#cdffad] font-black text-xs uppercase tracking-widest h-11 gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                  Simpan
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
