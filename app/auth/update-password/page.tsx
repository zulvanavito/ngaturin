import { UpdatePasswordForm } from "@/components/update-password-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground w-fit transition-all hover:-translate-x-1 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Batal & Kembali
        </Link>
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
