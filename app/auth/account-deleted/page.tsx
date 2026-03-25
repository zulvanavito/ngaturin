import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountDeletedPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md flex flex-col gap-6">
        <Card className="border-border/40 shadow-sm rounded-[2rem] overflow-hidden text-center">
          <CardHeader className="pb-4 pt-10">
            <div className="mx-auto w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Akun Berhasil Dihapus</CardTitle>
            <CardDescription className="text-base mt-2">
              Sayang sekali Anda harus pergi. Seluruh data dan informasi akun Anda telah dihapus secara permanen dari sistem kami.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-10 px-6">
            <Link href="/" className="w-full block">
              <Button className="w-full bg-brand-naval hover:bg-blue-900 text-white shadow-md h-12 rounded-xl text-base font-medium">
                Kembali ke Beranda
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
