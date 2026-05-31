"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Save, KeyRound, Loader2, Eye, EyeOff, CheckCircle2, AlertTriangle, Trash2, RefreshCw, ShieldCheck, CalendarDays, Wallet, Bot, HelpCircle } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CategoryIcon } from "@/components/categories/category-icon";
import { useToast } from "@/lib/toast-context";
import { useUserPreferences, ACCENT_COLORS } from "@/components/providers/user-preferences-provider";
import { Subscription } from "./profile-subscription-tab";

interface UserProfile {
  id: string;
  payday_day?: number | null;
  primary_wallet_id?: string | null;
  last_email_change_at?: string | null;
  show_decimals?: boolean;
  accent_color?: string;
}

interface ProfileFormProps {
  user: User;
  initialProfile: UserProfile | null;
  initialWallets: {id: string, name: string, icon: string, color: string}[];
  subscription: Subscription | null;
}

export function ProfileForm({ user, initialProfile, initialWallets, subscription }: ProfileFormProps) {
  const { showDecimals, accentColor, updatePreferences } = useUserPreferences();
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || "");
  const [newEmail, setNewEmail] = useState(user.email || "");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  // Auto-save settings state
  const [paydayDay, setPaydayDay] = useState<string>(initialProfile?.payday_day ? String(initialProfile.payday_day) : "");
  const [primaryWalletId, setPrimaryWalletId] = useState<string>(initialProfile?.primary_wallet_id || "");
  const [isSavingAutoSave, setIsSavingAutoSave] = useState(false);
  const [lastEmailChangeAt, setLastEmailChangeAt] = useState<string | null>(initialProfile?.last_email_change_at || null);
  
  const supabase = createClient();
  const { showToast } = useToast();
  const router = useRouter();

  const handleSaveAutoSaveSettings = async () => {
    setIsSavingAutoSave(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payday_day: paydayDay ? Number(paydayDay) : null,
          primary_wallet_id: primaryWalletId || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Gagal menyimpan");
      }
      showToast("success", "Pengaturan auto-save berhasil disimpan!");
    } catch (err: unknown) {
      const error = err as Error;
      showToast("error", error.message || "Gagal menyimpan pengaturan auto-save");
    } finally {
      setIsSavingAutoSave(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      showToast('success', 'Profil berhasil diperbarui!');
    } catch (err: unknown) {
      const error = err as Error;
      setMessage({ type: 'error', text: error.message || 'Gagal memperbarui profil' });
      showToast('error', error.message || 'Gagal memperbarui profil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  // Calculate email change restriction
  const canChangeEmail = !lastEmailChangeAt || (
    new Date().getTime() - new Date(lastEmailChangeAt).getTime() > 30 * 24 * 60 * 60 * 1000
  );

  const nextEmailChangeDate = lastEmailChangeAt ? new Date(new Date(lastEmailChangeAt).getTime() + 30 * 24 * 60 * 60 * 1000) : null;

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canChangeEmail) {
      showToast("error", "Anda hanya dapat mengganti email sekali dalam 30 hari.");
      setIsEditingEmail(false);
      return;
    }
    if (newEmail === user.email) {
      setIsEditingEmail(false);
      return;
    }

    setIsUpdatingEmail(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser(
        { email: newEmail },
        { emailRedirectTo: `${window.location.origin}/auth/confirm-email` }
      );
      if (error) throw error;
      
      // Update timestamp segera agar limitasi 30 hari langsung berlaku
      try {
        await fetch("/api/user/profile/update-email-timestamp", { method: "POST" });
        setLastEmailChangeAt(new Date().toISOString());
      } catch (e) {
        console.error("Gagal update timestamp ganti email:", e);
      }

      setMessage({ 
        type: 'info', 
        text: 'Permintaan ganti email terkirim! Silakan cek kotak masuk email BARU untuk melakukan konfirmasi.' 
      });
      showToast('info', 'Silakan cek email untuk konfirmasi.');
      setIsEditingEmail(false);
    } catch (err: unknown) {
      const error = err as Error;
      setMessage({ type: 'error', text: error.message || 'Gagal memperbarui email' });
      showToast('error', error.message || 'Gagal memperbarui email');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      setMessage({ type: 'error', text: 'Silakan penuhi semua kriteria password yang diminta.' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok!' });
      return;
    }

    setIsUpdatingPassword(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Kata sandi berhasil diperbarui!' });
      showToast('success', 'Kata sandi berhasil diperbarui!');
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const error = err as Error;
      setMessage({ type: 'error', text: error.message || 'Gagal memperbarui kata sandi' });
      showToast('error', error.message || 'Gagal memperbarui kata sandi');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      setIsUploading(true);
      setMessage(null);

     
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

     
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setMessage({ type: 'success', text: 'Foto profil berhasil diunggah!' });
      showToast('success', 'Foto profil berhasil diunggah!');
    } catch (err: unknown) {
      const error = err as Error;
      setMessage({ type: 'error', text: error.message || 'Gagal mengunggah foto profil.' });
      showToast('error', error.message || 'Gagal mengunggah foto profil.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetAccount = async () => {
    if (resetConfirmText !== "RESET") return;
    setIsResetting(true);
    try {
      const res = await fetch("/api/user/reset", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mereset akun");
      showToast("success", "Akun berhasil direset! Semua data Anda telah dihapus.");
      setIsResetDialogOpen(false);
      setResetConfirmText("");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: unknown) {
      const error = err as Error;
      showToast("error", error.message || "Gagal mereset data");
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "HAPUS") return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/delete", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus akun");
      setIsDeleteDialogOpen(false);
      router.push("/auth/account-deleted"); // Redirect ke halaman informasi hapus akun berhasil
    } catch (err: unknown) {
      const error = err as Error;
      showToast("error", error.message || "Gagal menghapus akun");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-10">
      {message && (
        <div className={`p-5 rounded-[2rem] border text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          message.type === 'success' 
            ? 'bg-primary/10 border-primary/20 text-primary' 
            : message.type === 'info'
              ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
              : 'bg-red-500/10 border-red-500/20 text-red-600'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : message.type === 'info' ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Informasi Dasar Section */}
      <section>
        <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-3">
          Informasi <span className="text-primary">Dasar.</span>
        </h2>
        <Card className="border border-border/40 bg-white dark:bg-card shadow-sm rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-muted border-4 border-border/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    {avatarUrl ? (
                      <Image 
                        src={avatarUrl} 
                        alt="Avatar" 
                        width={128} 
                        height={128} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="text-4xl font-black text-muted-foreground uppercase">
                        {fullName ? fullName.charAt(0) : user.email?.charAt(0)}
                      </span>
                    )}
                  </div>
                 
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                    {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8" />}
                    <input type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} disabled={isUploading} />
                  </label>
                </div>
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                    <h4 className="font-black text-xl">Foto Profil</h4>
                    {subscription ? (
                      <span className={cn(
                        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm",
                        subscription.plan_id === "pro" 
                          ? "bg-foreground text-background dark:bg-white dark:text-brand-dark" 
                          : "bg-primary text-primary-foreground"
                      )}>
                        <CheckCircle2 className="w-3 h-3" /> {subscription.plan_id.toUpperCase()} Member
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted/20 text-muted-foreground text-[10px] font-black uppercase tracking-wider">
                        Free Account
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Bantu kami mengenal Anda lebih baik.</p>
                  <Button type="button" variant="outline" size="sm" className="mt-2 rounded-full font-bold px-6 border-border/40 dark:border-border/10 hover:bg-muted/50 dark:hover:bg-muted/10 transition-all relative">
                    {isUploading ? 'Mengunggah...' : 'Unggah Foto Baru'}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUploadAvatar} disabled={isUploading} />
                  </Button>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="email" className="font-bold text-sm ml-1">Alamat Email</Label>
                      <div className="group relative">
                        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help transition-colors group-hover:text-primary" />
                        <div className="absolute bottom-full left-0 mb-3 w-64 p-4 bg-card border border-border/20 rounded-[1.5rem] shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-50 animate-in fade-in zoom-in-95">
                          <p className="text-xs font-black text-foreground mb-1" style={{ fontFeatureSettings: '"calt"' }}>Aturan Pergantian Email</p>
                          <p className="text-[10px] font-semibold text-muted-foreground leading-relaxed" style={{ fontFeatureSettings: '"calt"' }}>
                            Demi keamanan akun, pergantian email hanya dapat dilakukan satu kali setiap 30 hari. Link verifikasi akan berlaku selama 1 jam.
                          </p>
                        </div>
                      </div>
                    </div>
                    {user.new_email && (
                      <Badge variant="warning" className="text-[9px] px-2 py-0 border-none uppercase">
                        Menunggu Verifikasi
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      id="email" 
                      type="email" 
                      value={isEditingEmail ? newEmail : user.email} 
                      disabled={!isEditingEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className={cn(
                        "h-14 rounded-2xl border-border/30 font-semibold px-5 flex-1",
                        !isEditingEmail && "bg-muted/30"
                      )} 
                    />
                    {!isEditingEmail ? (
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="h-14 px-5 rounded-2xl font-bold border-border/30 disabled:opacity-50"
                        disabled={!canChangeEmail}
                        onClick={() => {
                          setNewEmail(user.email || "");
                          setIsEditingEmail(true);
                        }}
                      >
                        Ubah
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                         <Button 
                          type="button" 
                          variant="ghost" 
                          className="h-14 px-5 rounded-2xl font-bold"
                          onClick={() => setIsEditingEmail(false)}
                          disabled={isUpdatingEmail}
                        >
                          Batal
                        </Button>
                        <Button 
                          type="button" 
                          className="h-14 px-5 rounded-2xl font-bold bg-primary text-primary-foreground disabled:opacity-50"
                          onClick={handleUpdateEmail}
                          disabled={isUpdatingEmail || newEmail === user.email || !canChangeEmail}
                        >
                          {isUpdatingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
                        </Button>
                      </div>
                    )}
                  </div>
                  {user.new_email ? (
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold ml-1 animate-pulse">
                      Konfirmasi perubahan ke {user.new_email} sedang diproses. Silakan cek inbox Anda.
                    </p>
                  ) : !canChangeEmail ? (
                    <p className="text-[10px] text-red-500 font-bold ml-1">
                      Anda baru saja mengganti email. Kesempatan berikutnya pada {nextEmailChangeDate?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}. Jika anda tidak merasa mengganti silahkan hubungi tim kami.
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground ml-1">
                      Mengubah email akan memerlukan konfirmasi ulang melalui kotak masuk Anda.
                    </p>
                  )}
                </div>
                <div className="grid gap-2.5">
                  <Label htmlFor="fullName" className="font-bold text-sm ml-1 text-foreground">Nama Lengkap</Label>
                  <Input 
                    id="fullName" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    className="h-14 rounded-2xl border-border/40 dark:border-border/10 dark:bg-muted/5 focus:border-primary focus:ring-primary/20 font-semibold px-5"
                  />
                </div>
              </div>

              <Button type="submit" className="wise-button-pill w-full sm:w-auto bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] h-14 px-10 text-base font-black shadow-lg shadow-primary/20" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                {isUpdatingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Preferensi Tampilan Section */}
      <section>
        <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-3">
          Preferensi <span className="text-primary">Tampilan.</span>
        </h2>
        <Card className="border border-border/40 bg-white dark:bg-card shadow-sm rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 md:p-10 space-y-10">
            {/* Decimal Toggle */}
            <div className="flex items-center justify-between gap-4 p-6 rounded-[2rem] bg-muted/5 border border-border/10">
              <div className="space-y-1">
                <h4 className="font-black text-lg">Tampilkan Desimal</h4>
                <p className="text-sm text-muted-foreground font-medium">Tampilkan dua angka di belakang koma (Rp 0,00).</p>
              </div>
              <Switch 
                checked={showDecimals} 
                onCheckedChange={(checked) => updatePreferences({ showDecimals: checked })} 
              />
            </div>

            {/* Color Accent Picker */}
            <div className="space-y-6">
              <div className="space-y-1">
                <h4 className="font-black text-lg ml-1">Aksen Warna Premium</h4>
                <p className="text-sm text-muted-foreground font-medium ml-1">Personalisasi aplikasi dengan warna favorit Anda.</p>
              </div>
              <div className="flex flex-wrap gap-4 ml-1">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => updatePreferences({ accentColor: color.id })}
                    className={cn(
                      "group relative w-12 h-12 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center",
                      accentColor === color.id ? "ring-4 ring-offset-4 ring-primary" : "ring-1 ring-border/20"
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {accentColor === color.id && (
                      <CheckCircle2 className={cn(
                        "w-6 h-6",
                        color.id === "soft-charcoal" ? "text-white" : "text-brand-dark"
                      )} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Auto-Save Settings Section */}
      <section>
        <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-3">
          Nabung <span className="text-primary">Otomatis.</span>
        </h2>
        <Card className="border border-border/40 bg-white dark:bg-card shadow-sm rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <div className="space-y-8">
              <div className="flex items-start gap-4 p-5 rounded-[2rem] bg-primary/5 border border-primary/10">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">Otomatis sisihkan dana setiap gajian</p>
                  <p className="text-xs text-muted-foreground font-medium">Tentukan tanggal gajian dan dompet utama Anda. Setiap tanggal yang ditentukan, dana akan otomatis dipindahkan ke target tabungan yang mengaktifkan fitur auto-save.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2.5">
                  <Label htmlFor="paydayDay" className="font-bold text-sm ml-1 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-muted-foreground" /> Tanggal Gajian
                  </Label>
                  <Select value={paydayDay} onValueChange={setPaydayDay}>
                    <SelectTrigger className="h-14 rounded-2xl border-border/40 dark:border-border/10 dark:bg-muted/5 font-semibold px-5">
                      <SelectValue placeholder="Pilih tanggal..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/40 max-h-64">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <SelectItem key={day} value={String(day)} className="rounded-xl cursor-pointer">
                          Tanggal {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground ml-1">Sistem akan memproses auto-save pada pukul 00:00 WIB.</p>
                </div>

                <div className="grid gap-2.5">
                  <Label htmlFor="primaryWallet" className="font-bold text-sm ml-1 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-muted-foreground" /> Dompet Utama
                  </Label>
                  {initialWallets.length > 0 ? (
                    <Select value={primaryWalletId} onValueChange={setPrimaryWalletId}>
                      <SelectTrigger className="h-14 rounded-2xl border-border/40 dark:border-border/10 dark:bg-muted/5 font-semibold px-5">
                        <SelectValue placeholder="Pilih dompet utama..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/40">
                        {initialWallets.map(w => (
                          <SelectItem key={w.id} value={w.id} className="rounded-xl cursor-pointer">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${w.color}15`, color: w.color }}>
                                <CategoryIcon iconName={w.icon} className="w-3.5 h-3.5" />
                              </div>
                              <span>{w.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="h-14 rounded-2xl border border-dashed border-border/60 flex items-center justify-between px-5 bg-muted/20">
                      <span className="text-xs text-muted-foreground">Belum ada dompet</span>
                      <a href="/dashboard/wallets" className="text-xs font-bold text-primary hover:underline">Tambah →</a>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground ml-1">Saldo akan diambil dari dompet ini saat auto-save berjalan.</p>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleSaveAutoSaveSettings}
                className="wise-button-pill w-full sm:w-auto bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] h-14 px-10 text-base font-black shadow-lg shadow-primary/20"
                disabled={isSavingAutoSave}
              >
                {isSavingAutoSave ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Bot className="w-5 h-5 mr-2" />}
                {isSavingAutoSave ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Keamanan Section */}
      <section>
        <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-3">
          Keamanan <span className="text-primary">Akun.</span>
        </h2>
        <Card className="border border-border/40 bg-white dark:bg-card shadow-sm rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <form onSubmit={handleUpdatePassword} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="grid gap-2.5">
                    <Label htmlFor="newPassword" className="font-bold text-sm ml-1">Kata Sandi Baru</Label>
                    <div className="relative">
                      <Input 
                        id="newPassword" 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 8 karakter"
                        className="h-14 rounded-2xl border-border/40 dark:border-border/10 dark:bg-muted/5 font-semibold px-5 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2.5">
                    <Label htmlFor="confirmPassword" className="font-bold text-sm ml-1">Konfirmasi Kata Sandi</Label>
                    <div className="relative">
                      <Input 
                        id="confirmPassword" 
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi"
                        className={cn(
                          "h-14 rounded-2xl border-border/40 dark:border-border/10 dark:bg-muted/5 font-semibold px-5 pr-12",
                          confirmPassword && password !== confirmPassword && "border-red-500/50 focus-visible:ring-red-500/30"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500 font-bold ml-1">Kata sandi tidak cocok</p>
                    )}
                  </div>
                </div>

                <div className="bg-muted/20 dark:bg-muted/5 p-6 rounded-[2rem] border border-border/30 dark:border-border/10 h-fit shadow-inner">
                  <h5 className="text-sm font-black mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" /> Kriteria Keamanan
                  </h5>
                  <ul className="space-y-2.5">
                    {[
                      { check: hasMinLength, label: "Minimal 8 karakter" },
                      { check: hasUppercase, label: "Huruf besar (A-Z)" },
                      { check: hasLowercase, label: "Huruf kecil (a-z)" },
                      { check: hasNumber, label: "Angka (0-9)" },
                      { check: hasSpecial, label: "Karakter khusus (@,!,#)" },
                    ].map((item, idx) => (
                      <li key={idx} className={cn(
                        "flex items-center gap-3 text-xs font-bold transition-all duration-300",
                        item.check ? "text-primary scale-105" : "text-muted-foreground/50 scale-100"
                      )}>
                        <div className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center transition-colors",
                          item.check ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" : "bg-muted text-muted-foreground"
                        )}>
                          {item.check ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />}
                        </div>
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="wise-button-pill bg-foreground text-background hover:scale-[1.02] active:scale-[0.98] h-14 px-10 text-base font-black shadow-lg" 
                disabled={isUpdatingPassword || !isPasswordValid || password !== confirmPassword}
              >
                {isUpdatingPassword ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <KeyRound className="w-5 h-5 mr-2" />}
                {isUpdatingPassword ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Danger Zone Section */}
      <section>
        <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-3 text-red-600">
          Zona <span className="text-red-500">Berbahaya.</span>
        </h2>
        <Card className="border border-red-500/20 bg-red-500/5 dark:bg-red-500/5 rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 md:p-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-[2rem] bg-white dark:bg-card border border-red-500/10 dark:border-red-500/20 shadow-sm">
              <div className="space-y-1">
                <h4 className="font-black text-lg">Hapus Semua Data</h4>
                <p className="text-sm text-muted-foreground font-medium">Hapus transaksi dan dompet tanpa menghapus akun.</p>
              </div>
              <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-full font-bold border-red-200 hover:bg-red-50 hover:text-red-600">
                    <RefreshCw className="w-4 h-4 mr-2" /> Reset Akun
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2.5rem]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-red-600 flex items-center gap-3">
                      <AlertTriangle className="w-8 h-8" /> Konfirmasi Reset
                    </DialogTitle>
                    <DialogDescription className="text-base font-medium pt-2">
                      Semua data transaksi dan keuangan Anda akan <strong>dihapus permanen</strong>. Tindakan ini tidak dapat dibatalkan.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-6 space-y-3">
                    <Label htmlFor="reset-confirm" className="font-bold">Ketik <span className="text-red-600">RESET</span> untuk melanjutkan:</Label>
                    <Input 
                      id="reset-confirm" 
                      value={resetConfirmText} 
                      onChange={(e) => setResetConfirmText(e.target.value)} 
                      placeholder="RESET"
                      className="h-14 rounded-2xl border-red-500/20 font-black px-5"
                      autoComplete="off"
                    />
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="ghost" onClick={() => setIsResetDialogOpen(false)} className="rounded-full font-bold">Batal</Button>
                    <Button 
                      variant="destructive" 
                      className="rounded-full font-black px-8 h-12"
                      disabled={resetConfirmText !== "RESET" || isResetting} 
                      onClick={handleResetAccount}
                    >
                      {isResetting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Ya, Reset Semua Data"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-[2rem] bg-white dark:bg-card border border-red-500/10 dark:border-red-500/20 shadow-sm">
              <div className="space-y-1">
                <h4 className="font-black text-lg text-red-600 dark:text-red-500">Hapus Akun Permanen</h4>
                <p className="text-sm text-muted-foreground font-medium">Hapus identitas dan seluruh data Anda selamanya.</p>
              </div>
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="rounded-full font-black px-8">
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus Akun
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2.5rem]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-red-600 flex items-center gap-3">
                      <AlertTriangle className="w-8 h-8" /> Selamat Tinggal?
                    </DialogTitle>
                    <DialogDescription className="text-base font-medium pt-2">
                      Seluruh akun dan data Anda akan dihapus total dari server kami.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-6 space-y-3">
                    <Label htmlFor="delete-confirm" className="font-bold">Ketik <span className="text-red-600">HAPUS</span> untuk mengonfirmasi:</Label>
                    <Input 
                      id="delete-confirm" 
                      value={deleteConfirmText} 
                      onChange={(e) => setDeleteConfirmText(e.target.value)} 
                      placeholder="HAPUS"
                      className="h-14 rounded-2xl border-red-500/20 font-black px-5"
                      autoComplete="off"
                    />
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-full font-bold">Batal</Button>
                    <Button 
                      variant="destructive" 
                      className="rounded-full font-black px-8 h-12"
                      disabled={deleteConfirmText !== "HAPUS" || isDeleting} 
                      onClick={handleDeleteAccount}
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Hapus Akun Sekarang"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
