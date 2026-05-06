"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function ConfirmEmailPage() {
  useEffect(() => {
    // Update the timestamp to enforce the monthly limit
    fetch("/api/user/profile/update-email-timestamp", { method: "POST" })
      .catch(err => console.error("Failed to update email timestamp:", err));
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfcf9] flex flex-col items-center justify-center p-6 text-[#0e0f0c]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        {/* Success Icon Animation */}
        <div className="flex justify-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2 
            }}
            className="w-24 h-24 bg-[#9fe870] rounded-full flex items-center justify-center shadow-lg shadow-[#9fe870]/20"
          >
            <CheckCircle2 className="w-12 h-12 text-[#163300]" strokeWidth={2.5} />
          </motion.div>
        </div>

        {/* Wise-style Headline */}
        <div className="space-y-4">
          <h1 className="text-[64px] md:text-[96px] font-[900] leading-[0.85] tracking-tight font-sans uppercase">
            Email <br />
            <span className="text-[#9fe870] bg-[#0e0f0c] px-4 py-1 inline-block mt-2">Aktif.</span>
          </h1>
          
          <p className="text-xl md:text-2xl font-semibold text-[#454745] max-w-lg mx-auto leading-tight pt-4">
            Identitas baru Anda telah terverifikasi. Sekarang Anda bisa masuk menggunakan email terbaru.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-8">
          <Link href="/dashboard">
            <Button 
              className="h-16 px-10 rounded-full bg-[#9fe870] text-[#163300] hover:bg-[#9fe870] hover:scale(1.05) active:scale(0.95) transition-all duration-200 text-xl font-bold group"
            >
              Ke Dashboard
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Subtle Footer */}
        <p className="text-sm font-medium text-[#868685] pt-12">
          Terima kasih telah menjaga keamanan akun Ngaturin Anda.
        </p>
      </motion.div>
    </div>
  );
}
