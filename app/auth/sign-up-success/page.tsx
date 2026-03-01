import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 relative">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground w-fit transition-all hover:-translate-x-1 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm text-center py-6">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
              <MailCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Cek Email Anda
            </CardTitle>
            <CardDescription className="text-base">
              Hampir selesai!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kami telah mengirimkan tautan konfirmasi ke alamat email Anda.
              Silakan periksa kotak masuk (atau folder spam) dan klik tautan
              tersebut untuk mengaktifkan akun Ngaturin Anda.
            </p>
            <Button asChild className="w-full gradient-primary text-white font-medium hover:opacity-90 transition-opacity h-11">
              <Link href="/auth/login">Kembali ke Halaman Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
