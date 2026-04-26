import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Suspense } from "react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params?.error || "Terjadi kesalahan yang tidak terduga.";

  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
        <AlertCircle className="w-10 h-10 text-destructive" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-foreground">Ups! Terjadi Kesalahan</h1>
        <p className="text-muted-foreground font-medium px-4">
          Kami mengalami kendala saat memproses permintaan autentikasi Anda.
        </p>
      </div>

      <div className="w-full bg-destructive/5 border border-destructive/10 p-4 rounded-2xl">
        <p className="text-xs font-mono text-destructive/80 break-all">
          Error: {errorMessage}
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <Button asChild className="w-full h-12 rounded-full font-bold gradient-primary text-white shadow-lg">
          <Link href="/auth/login">Kembali ke Login</Link>
        </Button>
        <Button variant="ghost" asChild className="w-full h-12 rounded-full font-bold text-muted-foreground">
          <Link href="/pricing">Hubungi Bantuan</Link>
        </Button>
      </div>
    </div>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-destructive/5 blur-[100px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] -z-10" />

      <div className="w-full max-w-md bg-card rounded-[40px] shadow-2xl p-10 border border-border/40 relative">
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Memuat...</div>}>
          <ErrorContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
