import { z } from "zod";

/**
 * Regex for HEX Color validation
 */
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

/**
 * Transaction Creation Schema
 */
export const TransactionCreateSchema = z.object({
  description: z.string().trim().min(1, "Deskripsi wajib diisi").max(255, "Deskripsi terlalu panjang"),
  amount: z.coerce.number().positive("Jumlah harus lebih dari 0").max(1000000000, "Jumlah terlalu besar"),
  category: z.string().trim().min(1, "Kategori wajib diisi"),
  type: z.enum(["income", "expense"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD").optional(),
  wallet_id: z.preprocess(
    (val) => (val === "_none" || val === "" ? null : val),
    z.string().uuid("ID Dompet tidak valid").nullable()
  ).optional(),
  bill_id: z.string().uuid("ID Tagihan tidak valid").nullable().optional(),
  debt_id: z.string().uuid("ID Hutang tidak valid").nullable().optional(),
});

/**
 * Transaction Query Schema (GET /api/transactions)
 */
export const TransactionQuerySchema = z.object({
  category: z.string().optional(),
  type: z.enum(["income", "expense", "transfer"]).optional(),
  keyword: z.string().max(100, "Kata kunci terlalu panjang").optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Format bulan harus YYYY-MM").optional(),
  wallet_id: z.string().uuid("ID Dompet tidak valid").optional(),
});

/**
 * Wallet Creation Schema
 */
export const WalletCreateSchema = z.object({
  name: z.string().trim().min(1, "Nama dompet wajib diisi").max(50, "Nama dompet terlalu panjang"),
  icon: z.string().max(10).optional().default("💳"),
  type: z.enum(["cash", "bank", "emoney", "credit"]).default("bank"),
  color: z.string().regex(HEX_COLOR_REGEX, "Format warna tidak valid").default("#10b981"),
});

/**
 * Transfer Params Schema (URL segment [id])
 */
export const TransferParamsSchema = z.object({
  id: z.string().uuid("ID Dompet asal tidak valid"),
});

/**
 * Transfer Body Schema (POST body)
 */
export const TransferBodySchema = z.object({
  toWalletId: z.string().uuid("ID Dompet tujuan tidak valid"),
  amount: z.coerce.number().positive("Jumlah harus lebih dari 0"),
  description: z.string().trim().max(120, "Deskripsi terlalu panjang").optional().default("Transfer Antar Dompet"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD").optional(),
});
