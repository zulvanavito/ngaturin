"use client";

import { useActionState, useEffect } from "react";
import { subscribeNewsletter } from "@/app/actions/newsletter";
import { useToast } from "@/lib/toast-context";

export function NewsletterForm() {
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState(subscribeNewsletter, null);

  useEffect(() => {
    if (state?.status === "success") {
      showToast("success", state.message);
    } else if (state?.status === "error") {
      showToast("error", state.message);
    } else if (state?.status === "info") {
      showToast("info", state.message);
    }
  }, [state, showToast]);

  return (
    <form action={formAction} className="max-w-lg mx-auto flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        name="email"
        placeholder="Alamat email Anda"
        className="flex-1 rounded-full px-8 py-5 font-bold outline-none ring-4 ring-transparent focus:ring-white/50 text-[#0e0f0c] shadow-xl text-lg placeholder:text-gray-400"
        required
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-10 py-5 bg-[#163300] text-[#9fe870] rounded-full font-black hover:scale-105 active:scale-95 transition-transform shadow-xl text-lg uppercase tracking-wider disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
      >
        {isPending ? "Memproses..." : "Langganan"}
      </button>
    </form>
  );
}
