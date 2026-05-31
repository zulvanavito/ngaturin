"use client";

import { useState, useRef, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  User as UserIcon,  
  Crown, 
  Database,
  ChevronRight,
  ShieldCheck,
  Settings2,
  Clock
} from "lucide-react";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileSubscriptionTab, type Subscription } from "@/components/profile/profile-subscription-tab";
import { ProfilePurchaseHistoryTab } from "@/components/profile/profile-purchase-history-tab";
import { DataManagementCard } from "@/components/profile/data-management-card";
import type { Transaction } from "@/types/finance";

interface ProfilePageClientProps {
  user: User;
  userProfile: any;
  wallets: any[];
  transactions: Transaction[];
  subscription: Subscription | null;
  subscriptionHistory: Subscription[];
}

const PROFILE_SECTIONS = [
  { id: "account", title: "Profil & Keamanan", icon: UserIcon },
  { id: "subscription", title: "Paket Langganan", icon: Crown },
  { id: "history", title: "Riwayat Pembelian", icon: Clock },
  { id: "data", title: "Manajemen Data", icon: Database },
];

export function ProfilePageClient({
  user,
  userProfile,
  wallets,
  transactions,
  subscription,
  subscriptionHistory,
}: ProfilePageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  
  const [activeSection, setActiveSection] = useState(tabParam || "account");
  const contentRef = useRef<HTMLDivElement>(null);

  // Update section when tab parameter changes
  useEffect(() => {
    if (tabParam && PROFILE_SECTIONS.some(s => s.id === tabParam)) {
      setActiveSection(tabParam);
    }
  }, [tabParam]);

  const handleSectionSelect = (id: string) => {
    setActiveSection(id);
    // Update URL without reloading
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.push(`?${params.toString()}`, { scroll: false });

    if (window.innerWidth < 1024 && contentRef.current) {
      window.scrollTo({
        top: contentRef.current.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return (
          <ProfileForm 
            user={user} 
            initialProfile={userProfile} 
            initialWallets={wallets} 
            subscription={subscription} 
          />
        );
      case "subscription":
        return (
          <ProfileSubscriptionTab
            currentSubscription={subscription}
          />
        );
      case "history":
        return (
          <ProfilePurchaseHistoryTab
            subscriptionHistory={subscriptionHistory}
          />
        );
      case "data":
        return <DataManagementCard transactions={transactions} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header Facelift - Wise Style */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold mb-4 bg-primary/10 dark:bg-primary/20 text-primary">
          <Settings2 className="w-4 h-4" /> Pengaturan
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[0.85] mb-4 text-foreground">
          Pusat <span className="text-primary">Kendali.</span>
        </h1>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl">
          Kelola profil, keamanan, dan paket langganan premium Anda dalam satu tempat yang terorganisir.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 relative">
        {/* Left Sidebar Navigation */}
        <aside className="lg:w-72 shrink-0">
          <div className="sticky top-24">
            {/* Mobile Horizontal Scroll */}
            <div className="flex lg:hidden overflow-x-auto gap-2 pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {PROFILE_SECTIONS.map((section) => {
                const isSelected = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionSelect(section.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-300 ${
                      isSelected 
                        ? "bg-primary text-primary-foreground shadow-lg scale-100" 
                        : "bg-muted/30 dark:bg-muted/10 text-muted-foreground hover:bg-muted/70 dark:hover:bg-muted/20 hover:text-foreground scale-95"
                    }`}
                  >
                    <section.icon className={`w-4 h-4 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    {section.title}
                  </button>
                );
              })}
            </div>

            {/* Desktop Vertical List */}
            <div className="hidden lg:flex flex-col gap-2">
              {PROFILE_SECTIONS.map((section) => {
                const isSelected = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionSelect(section.id)}
                    className={`w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] font-bold text-base transition-all duration-300 group ${
                      isSelected 
                        ? "bg-primary text-primary-foreground shadow-md translate-x-2" 
                        : "bg-transparent text-muted-foreground hover:bg-muted/40 dark:hover:bg-muted/10 hover:text-foreground hover:translate-x-1"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <section.icon className={`w-5 h-5 transition-transform duration-300 ${isSelected ? "text-primary-foreground scale-110" : "text-muted-foreground group-hover:scale-110"}`} />
                      {section.title}
                    </div>
                    {isSelected && <ChevronRight className="w-4 h-4" />}
                  </button>
                );
              })}
              
              {/* Security Badge Placeholder */}
              <div className="mt-8 p-6 rounded-[2rem] border border-border/40 dark:border-primary/10 bg-muted/5 dark:bg-primary/5">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-primary font-bold text-xs uppercase tracking-wider mb-2">
                   <ShieldCheck className="w-4 h-4" /> Terenkripsi
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                   Data Anda diamankan dengan enkripsi tingkat militer dan protokol keamanan Supabase.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <main ref={contentRef} className="flex-1 min-w-0">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" key={activeSection}>
             {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
