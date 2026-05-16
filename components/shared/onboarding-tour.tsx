"use client";

import { useEffect, useRef } from "react";
import { driver, Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { usePathname } from "next/navigation";

export function OnboardingTour() {
  const driverRef = useRef<Driver | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Only run tour logic on the main dashboard page
    if (pathname !== "/dashboard") return;

    const checkAndStartTour = async () => {
      try {
        const res = await fetch("/api/user/tour", { cache: "no-store" });
        const data = await res.json();

        if (data.tour_completed) return;

        // Give React a moment to render everything
        setTimeout(() => {
          // Re-calculate isMobile at the time of execution
          const isMobile = window.innerWidth < 768;

          const driverObj = driver({
            popoverClass: "wise-tour-theme",
            showProgress: true,
            animate: true,
            allowClose: true,
            overlayColor: "rgba(0,0,0,0.5)",
            stagePadding: 4,
            steps: [
              {
                popover: {
                  title: "Selamat Datang! 👋",
                  description: "Halo! Kami akan memandu Anda sejenak untuk memahami fitur utama Ngaturin agar keuangan Anda makin rapi.",
                },
              },
              {
                element: "#tour-search-bar",
                popover: {
                  title: "Pencarian Cepat",
                  description: "Gunakan kolom ini untuk mencari transaksi, kategori, atau menu dengan instan.",
                  side: "bottom",
                  align: "end",
                },
              },
              {
                element: "h1",
                popover: {
                  title: "Total Kekayaan",
                  description: "Ini adalah Net Worth Anda—total saldo dompet dan investasi setelah dikurangi utang.",
                  side: "bottom",
                  align: "start",
                },
              },
              {
                element: "#tour-transactions",
                popover: {
                  title: "Kelola Transaksi",
                  description: "Pantau arus kas Anda. Klik di sini untuk melihat semua riwayat pemasukan dan pengeluaran.",
                  side: isMobile ? "bottom" : "right",
                  align: isMobile ? "start" : "center",
                },
                onHighlightStarted: () => {
                  // On mobile, the element might be hidden in the sidebar
                  if (window.innerWidth < 768) {
                    const menuBtn = document.getElementById("tour-mobile-menu");
                    if (menuBtn) {
                      menuBtn.click();
                      // Small delay to let the sidebar animate open
                      return new Promise(resolve => setTimeout(resolve, 400));
                    }
                  }
                }
              },
              {
                element: 'a[href="/dashboard/wallets"]',
                popover: {
                  title: "Manajemen Dompet",
                  description: "Atur berbagai kantong uang Anda di sini—Bank, Tunai, atau E-wallet.",
                  side: isMobile ? "bottom" : "right",
                  align: isMobile ? "start" : "center",
                },
                onHighlightStarted: () => {
                  if (window.innerWidth < 768) {
                    const menuBtn = document.getElementById("tour-mobile-menu");
                    // Check if sidebar is already open
                    const sidebarOpen = document.querySelector('[role="dialog"]');
                    if (menuBtn && !sidebarOpen) {
                      menuBtn.click();
                      return new Promise(resolve => setTimeout(resolve, 400));
                    }
                  }
                }
              },
              {
                popover: {
                  title: "Siap Memulai? 🚀",
                  description: "Itu saja perkenalan singkatnya. Silakan eksplorasi dan wujudkan impian finansial Anda!",
                },
                onHighlightStarted: () => {
                  // Close sidebar on mobile when moving to final step
                  if (window.innerWidth < 768) {
                    const closeBtn = document.querySelector('[data-radix-collection-item]') as HTMLElement;
                    if (closeBtn) closeBtn.click();
                  }
                }
              },
            ],
            onDestroyed: async () => {
              // Mark tour as completed in database
              await fetch("/api/user/tour", { method: "POST" });
            },
          });

          driverRef.current = driverObj;
          driverObj.drive();
        }, 1500);
      } catch (err) {
        console.error("Failed to start onboarding tour:", err);
      }
    };

    checkAndStartTour();
  }, [pathname]);

  return null;
}
