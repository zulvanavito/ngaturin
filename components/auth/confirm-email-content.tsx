"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";

export function ConfirmEmailContent() {
  useEffect(() => {
    // Update the timestamp to enforce the monthly limit (relevant for email updates)
    fetch("/api/user/profile/update-email-timestamp", { method: "POST" })
      .catch(err => console.error("Failed to update email timestamp:", err));
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 max-w-xl mx-auto lg:mx-0"
    >
      {/* Success Icon Animation */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2 
        }}
        className="w-20 h-20 bg-[#9fe870] rounded-full flex items-center justify-center shadow-lg shadow-[#9fe870]/20"
      >
        <CheckCircle2 className="w-10 h-10 text-[#163300]" strokeWidth={2.5} />
      </motion.div>

      {/* Wise-style Headline */}
      <div className="space-y-4">
        <h1 className="text-[64px] md:text-[86px] font-[900] leading-[0.85] tracking-tight font-sans uppercase">
          Email <br />
          <span className="text-[#9fe870] bg-[#0e0f0c] px-4 py-1 inline-block mt-2">Aktif.</span>
        </h1>
        
        <p className="text-xl font-semibold text-[#454745] max-w-md leading-tight pt-4">
          Akun Anda telah berhasil terverifikasi. Sekarang Anda bisa menikmati akses penuh ke seluruh fitur Ngaturin.
        </p>
      </div>

      {/* Action Button */}
      <div className="pt-4 w-full">
        <Link href="/dashboard">
          <Button 
            className="w-full lg:w-auto h-16 px-10 rounded-full bg-[#9fe870] text-[#163300] hover:bg-[#9fe870] hover:scale-[1.05] active:scale-[0.95] transition-all duration-200 text-xl font-bold group border-none shadow-xl shadow-[#9fe870]/10"
          >
            Masuk ke Dashboard
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      {/* Subtle Footer */}
      <p className="text-sm font-medium text-[#868685] pt-8">
        Selamat datang kembali di perjalanan finansial Anda.
      </p>
    </motion.div>
  );
}
