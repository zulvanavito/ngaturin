"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  CreditCard,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  amount: number;
  interval: string;
  current_period_end: string | null;
  midtrans_order_id: string;
}

export function BillingDetails({ 
  currentSubscription,
  onUpgrade 
}: { 
  currentSubscription: Subscription | null,
  onUpgrade: (planId: string, interval: string) => void
}) {
  const isPremium = currentSubscription?.status === 'settlement' && 
                   currentSubscription.current_period_end && 
                   new Date(currentSubscription.current_period_end) > new Date();

  const planName = currentSubscription?.plan_id === 'pro' ? 'Pro' : 
                  currentSubscription?.plan_id === 'plus' ? 'Plus' : 'Free';

  return (
    <div className="space-y-8">
      {/* Current Plan Status */}
      <section>
        <h2 className="text-2xl font-black mb-6">Status Langganan</h2>
        <Card className="p-8 wise-card overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Crown className="w-32 h-32 rotate-12" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Badge className={`px-3 py-1 rounded-full font-bold ${isPremium ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                Paket {planName}
              </Badge>
              {isPremium && (
                <span className="flex items-center gap-1.5 text-success font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Aktif
                </span>
              )}
            </div>

            <h3 className="wise-display-hero text-4xl md:text-5xl mb-4">
              {isPremium ? 'Nikmati Akses Penuh.' : 'Kelola Tanpa Batas.'}
            </h3>

            {isPremium ? (
              <p className="text-muted-foreground font-medium text-lg mb-8 max-w-xl">
                Terima kasih telah berlangganan paket <strong>{planName}</strong>. 
                Akses Anda berlaku hingga <strong>{format(new Date(currentSubscription!.current_period_end!), "d MMMM yyyy", { locale: id })}</strong>.
              </p>
            ) : (
              <p className="text-muted-foreground font-medium text-lg mb-8 max-w-xl">
                Anda saat ini menggunakan paket Free. Upgrade ke Plus atau Pro untuk membuka fitur eksklusif dan kuota tak terbatas.
              </p>
            )}

            {!isPremium && (
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => onUpgrade('plus', 'monthly')}
                  className="wise-button-pill bg-primary text-primary-foreground font-bold h-12 px-6"
                >
                  Upgrade ke Plus
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => onUpgrade('pro', 'monthly')}
                  className="wise-button-pill font-bold h-12 px-6"
                >
                  Lihat Paket Pro
                </Button>
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Pricing Options (Only if not premium or to change plan) */}
      <section className="grid md:grid-cols-2 gap-6">
        <PricingSimpleCard 
          title="Paket Plus"
          price="Rp 15.000"
          description="Pencatatan tanpa batas untuk kontrol maksimal."
          features={["Unlimited Dompet", "Unlimited Goals", "Export PDF/Excel"]}
          onSelect={() => onUpgrade('plus', 'monthly')}
          isActive={!!(currentSubscription?.plan_id === 'plus' && isPremium)}
        />
        <PricingSimpleCard 
          title="Paket Pro"
          price="Rp 29.000"
          description="Asisten AI cerdas untuk masa depan finansialmu."
          features={["Semua fitur Plus", "AI Financial Advisor", "AI Receipt Scanner"]}
          onSelect={() => onUpgrade('pro', 'monthly')}
          highlight
          isActive={!!(currentSubscription?.plan_id === 'pro' && isPremium)}
        />
      </section>
    </div>
  );
}

function PricingSimpleCard({ 
  title, 
  price, 
  description, 
  features, 
  onSelect, 
  highlight = false,
  isActive = false
}: { 
  title: string, 
  price: string, 
  description: string, 
  features: string[], 
  onSelect: () => void,
  highlight?: boolean,
  isActive?: boolean
}) {
  return (
    <Card className={`p-8 wise-card flex flex-col ${highlight ? 'border-primary shadow-ring' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-xl font-black">{title}</h4>
        {isActive && <Badge className="bg-success text-white">Aktif</Badge>}
      </div>
      <div className="mb-4">
        <span className="text-3xl font-black">{price}</span>
        <span className="text-muted-foreground font-bold ml-1">/ bulan</span>
      </div>
      <p className="text-muted-foreground text-sm font-medium mb-6">
        {description}
      </p>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Button 
        onClick={onSelect}
        disabled={isActive}
        className={`wise-button-pill w-full font-bold h-12 ${highlight ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
      >
        {isActive ? 'Paket Aktif' : `Pilih ${title}`}
      </Button>
    </Card>
  );
}
