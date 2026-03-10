"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Save, KeyRound, Loader2, Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";
import { useToast } from "@/lib/toast-context";

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const supabase = createClient();
  const { showToast } = useToast();

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
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memperbarui profil' });
      showToast('error', err.message || 'Gagal memperbarui profil');
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
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memperbarui kata sandi' });
      showToast('error', err.message || 'Gagal memperbarui kata sandi');
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
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengunggah foto profil.' });
      showToast('error', err.message || 'Gagal mengunggah foto profil.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl border text-sm flex items-center gap-2 ${
          message.type === 'success' ? 'bg-success/10 border-success/20 text-success' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

     
      <Card className="border border-border/40 bg-white dark:bg-card shadow-sm rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-xl">Informasi Dasar</CardTitle>
          <CardDescription>Ubah foto profil dan nama tampilan Anda.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            
           
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border/50 flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-muted-foreground uppercase">
                      {fullName ? fullName.charAt(0) : user.email?.charAt(0)}
                    </span>
                  )}
                </div>
               
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                  {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                  <input type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} disabled={isUploading} />
                </label>
              </div>
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <p className="font-medium text-sm">Foto Profil</p>
                <p className="text-xs text-muted-foreground">Format JPG, PNG, atau GIF. Maksimal 2MB.</p>
                <Button type="button" variant="outline" size="sm" className="mt-2 relative">
                  {isUploading ? 'Mengunggah...' : 'Ganti Foto'}
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUploadAvatar} disabled={isUploading} />
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email} disabled className="h-11 bg-muted/50" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input 
                  id="fullName" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="h-11"
                />
              </div>
            </div>

            <Button type="submit" className="w-full sm:w-auto bg-brand-naval hover:bg-blue-900 text-white shadow-md h-11 rounded-xl" disabled={isUpdatingProfile}>
              {isUpdatingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isUpdatingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </form>
        </CardContent>
      </Card>

      
      <Card className="border border-border/40 bg-white dark:bg-card shadow-sm rounded-[2rem] overflow-hidden mt-6">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-success" /> Keamanan
          </CardTitle>
          <CardDescription>Pastikan akun Anda menggunakan kata sandi yang kuat.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="newPassword">Kata Sandi Baru</Label>
              <div className="relative">
                <Input 
                  id="newPassword" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Buat kata sandi baru"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  <span className="sr-only">Toggle password visibility</span>
                </button>
              </div>
              {/* Password Complexity Checklist */}
              <div className="mt-1 space-y-2 bg-muted/30 p-3 rounded-lg border border-border/50">
                <p className="text-xs font-semibold text-muted-foreground">Kriteria Password:</p>
                <ul className="text-xs space-y-1.5">
                  <li className={cn("flex items-center gap-2", hasMinLength ? "text-success" : "text-muted-foreground")}>
                    {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                    Minimal 8 karakter
                  </li>
                  <li className={cn("flex items-center gap-2", hasUppercase ? "text-success" : "text-muted-foreground")}>
                    {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                    Minimal 1 huruf besar
                  </li>
                  <li className={cn("flex items-center gap-2", hasLowercase ? "text-success" : "text-muted-foreground")}>
                    {hasLowercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                    Minimal 1 huruf kecil
                  </li>
                  <li className={cn("flex items-center gap-2", hasNumber ? "text-success" : "text-muted-foreground")}>
                    {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                    Minimal 1 angka
                  </li>
                  <li className={cn("flex items-center gap-2", hasSpecial ? "text-success" : "text-muted-foreground")}>
                    {hasSpecial ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                    Minimal 1 karakter spesial (@, !, #)
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang kata sandi baru"
                  className={cn(
                    "h-11 pr-10",
                    confirmPassword && password !== confirmPassword && "border-red-500/50 focus-visible:ring-red-500/30"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  <span className="sr-only">Toggle confirm password visibility</span>
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500">Password tidak cocok</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full sm:w-auto bg-brand-naval hover:bg-blue-900 text-white shadow-md h-11 rounded-xl" 
              disabled={isUpdatingPassword || !password || !confirmPassword}
            >
              {isUpdatingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isUpdatingPassword ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
