"use client";

import {
  Utensils, Car, Zap, Home, Banknote, ShoppingBag, Gamepad2,
  Heart, GraduationCap, Plane, Dumbbell, Coffee, Gift, Briefcase,
  Wrench, PawPrint, Music, Smartphone, Wifi, Droplets,
  Shirt, Baby, Stethoscope, BookOpen, Bus, Fuel,
  Clapperboard, Pizza, IceCreamCone, Bike, Train,
  Landmark, CreditCard, PiggyBank, TrendingUp, HandCoins,
  Receipt, CircleDollarSign, Wallet, Package,
  type LucideIcon
} from "lucide-react";

// Master icon registry — maps stored string names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Utensils, Car, Zap, Home, Banknote, ShoppingBag, Gamepad2,
  Heart, GraduationCap, Plane, Dumbbell, Coffee, Gift, Briefcase,
  Wrench, PawPrint, Music, Smartphone, Wifi, Droplets,
  Shirt, Baby, Stethoscope, BookOpen, Bus, Fuel,
  Clapperboard, Pizza, IceCreamCone, Bike, Train,
  Landmark, CreditCard, PiggyBank, TrendingUp, HandCoins,
  Receipt, CircleDollarSign, Wallet, Package,
};

// Curated list for the icon picker UI, grouped by theme
export const ICON_OPTIONS = [
  // Food & Drink
  { name: "Utensils", label: "Makan" },
  { name: "Coffee", label: "Kopi" },
  { name: "Pizza", label: "Pizza" },
  { name: "IceCreamCone", label: "Jajanan" },
  // Transport
  { name: "Car", label: "Mobil" },
  { name: "Bus", label: "Bus" },
  { name: "Bike", label: "Sepeda" },
  { name: "Train", label: "Kereta" },
  { name: "Fuel", label: "Bensin" },
  { name: "Plane", label: "Pesawat" },
  // Home & Bills
  { name: "Home", label: "Rumah" },
  { name: "Zap", label: "Listrik" },
  { name: "Wifi", label: "Internet" },
  { name: "Droplets", label: "Air" },
  { name: "Smartphone", label: "HP" },
  // Shopping & Lifestyle
  { name: "ShoppingBag", label: "Belanja" },
  { name: "Shirt", label: "Pakaian" },
  { name: "Gift", label: "Hadiah" },
  { name: "Heart", label: "Kesehatan" },
  { name: "Stethoscope", label: "Medis" },
  { name: "Dumbbell", label: "Olahraga" },
  // Entertainment & Education
  { name: "Gamepad2", label: "Game" },
  { name: "Music", label: "Musik" },
  { name: "Clapperboard", label: "Film" },
  { name: "BookOpen", label: "Buku" },
  { name: "GraduationCap", label: "Pendidikan" },
  // Finance
  { name: "Banknote", label: "Gaji" },
  { name: "Wallet", label: "Dompet" },
  { name: "CreditCard", label: "Kartu" },
  { name: "PiggyBank", label: "Tabungan" },
  { name: "TrendingUp", label: "Investasi" },
  { name: "HandCoins", label: "Pinjaman" },
  { name: "CircleDollarSign", label: "Uang" },
  { name: "Receipt", label: "Kwitansi" },
  { name: "Landmark", label: "Bank" },
  // Work & Other
  { name: "Briefcase", label: "Kerja" },
  { name: "Wrench", label: "Servis" },
  { name: "PawPrint", label: "Hewan" },
  { name: "Baby", label: "Anak" },
  { name: "Package", label: "Lainnya" },
];

// Suggested categories for Quick Setup
export const SUGGESTED_CATEGORIES = [
  { name: "Makan & Minum", icon: "Utensils", type: "expense" },
  { name: "Transportasi", icon: "Car", type: "expense" },
  { name: "Belanja", icon: "ShoppingBag", type: "expense" },
  { name: "Tagihan & Utilitas", icon: "Zap", type: "expense" },
  { name: "Hiburan", icon: "Clapperboard", type: "expense" },
  { name: "Kesehatan", icon: "Heart", type: "expense" },
  { name: "Pendidikan", icon: "GraduationCap", type: "expense" },
  { name: "Gaji", icon: "Banknote", type: "income" },
  { name: "Investasi", icon: "TrendingUp", type: "income" },
  { name: "Bonus", icon: "Gift", type: "income" },
];

interface CategoryIconProps {
  iconName: string;
  className?: string;
}

export function CategoryIcon({ iconName, className = "w-5 h-5" }: CategoryIconProps) {
  const IconComponent = ICON_MAP[iconName];

  if (!IconComponent) {
    // Fallback: use Package icon
    const Fallback = ICON_MAP["Package"];
    return <Fallback className={className} />;
  }

  return <IconComponent className={className} />;
}
