import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Standard API Error Response format
 */
export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

/**
 * Maps known database error messages (from RPC or Postgres) to user-friendly messages.
 */
const ERROR_MAP: Record<string, { message: string; status: number; code?: string }> = {
  // RPC / Business Logic Errors
  "Unauthorized": { message: "Sesi Anda telah berakhir. Silakan login kembali.", status: 401, code: "UNAUTHORIZED" },
  "Source wallet not found or access denied": { message: "Dompet asal tidak ditemukan atau Anda tidak memiliki akses.", status: 404, code: "WALLET_NOT_FOUND" },
  "Destination wallet not found or access denied": { message: "Dompet tujuan tidak ditemukan atau Anda tidak memiliki akses.", status: 404, code: "WALLET_NOT_FOUND" },
  "Source and destination wallets must be different": { message: "Dompet sumber dan tujuan tidak boleh sama.", status: 400, code: "INVALID_TRANSFER" },
  "Insufficient funds in source wallet": { message: "Saldo dompet asal tidak mencukupi untuk melakukan transaksi ini.", status: 422, code: "INSUFFICIENT_FUNDS" },
  "Amount must be greater than zero": { message: "Jumlah transaksi harus lebih besar dari nol.", status: 400, code: "INVALID_AMOUNT" },
  
  // Postgres / PostgREST Error Codes
  "23505": { message: "Data ini sudah ada dalam sistem.", status: 409, code: "DUPLICATE_ENTRY" },
  "23503": { message: "Data tidak dapat diproses karena masih terkait dengan data lain.", status: 409, code: "FOREIGN_KEY_VIOLATION" },
  "23514": { message: "Data tidak memenuhi syarat validasi sistem.", status: 400, code: "CONSTRAINT_VIOLATION" },
  "PGRST116": { message: "Data yang Anda cari tidak ditemukan.", status: 404, code: "NOT_FOUND" },
};

/**
 * Handles errors from API routes and returns a sanitized NextResponse.
 */
export function handleApiError(error: any) {
  // Log full error on server for development/debugging
  console.error("[API Error]:", error);

  // 1. Handle Zod Validation Errors
  if (error instanceof ZodError || error?.name === "ZodError") {
    const details: Record<string, string[]> = {};
    const issues = error.issues ?? error.errors ?? [];
    
    issues.forEach((err: any) => {
      const path = err.path?.join(".") || "field";
      if (!details[path]) details[path] = [];
      details[path].push(err.message);
    });

    return NextResponse.json(
      {
        error: "Validasi input gagal.",
        code: "VALIDATION_ERROR",
        details,
      } as ApiErrorResponse,
      { status: 400 }
    );
  }

  // 1.5. Handle JSON Parsing Errors
  if (error instanceof SyntaxError && error.message.includes("JSON")) {
    return NextResponse.json(
      {
        error: "Format JSON tidak valid.",
        code: "INVALID_JSON",
      } as ApiErrorResponse,
      { status: 400 }
    );
  }

  // 2. Handle Known Database / RPC Errors
  const errorMessage = error?.message || String(error);
  const errorCode = error?.code;

  // Check mapping by code first, then by message
  const mapped = ERROR_MAP[errorCode] || ERROR_MAP[errorMessage];

  if (mapped) {
    return NextResponse.json(
      {
        error: mapped.message,
        code: mapped.code,
      } as ApiErrorResponse,
      { status: mapped.status }
    );
  }

  // 3. Fallback for Unknown Errors
  // In production, we mask the actual error message
  const isDev = process.env.NODE_ENV === "development";
  return NextResponse.json(
    {
      error: isDev ? errorMessage : "Terjadi kesalahan internal pada server. Silakan coba lagi nanti.",
      code: "INTERNAL_SERVER_ERROR",
    } as ApiErrorResponse,
    { status: 500 }
  );
}
