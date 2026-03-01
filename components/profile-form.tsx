"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Save, KeyRound, Loader2 } from "lucide-react";

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || "");
  const [password, setPassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const supabase = createClient();

  // Handle Profile Update (Name)
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
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memperbarui profil' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password minimal 8 karakter!' });
      return;
    }

    setIsUpdatingPassword(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Kata sandi berhasil diperbarui!' });
      setPassword("");
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memperbarui kata sandi' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle Avatar Upload
  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      setIsUploading(true);
      setMessage(null);

      // Upload to Supabase Storage 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Update User Metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setMessage({ type: 'success', text: 'Foto profil berhasil diunggah!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengunggah foto profil. Pastikan bucket "avatars" sudah ada dan public.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl border text-sm flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profil Pribadi */}
      <Card className="bg-card/60 backdrop-blur-xl border border-border/40 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-xl">Informasi Dasar</CardTitle>
          <CardDescription>Ubah foto profil dan nama tampilan Anda.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            
            {/* Foto Profil Area */}
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
                {/* Upload Button overlaying avatar */}
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

            <Button type="submit" className="h-11 w-full sm:w-auto gradient-primary text-white" disabled={isUpdatingProfile}>
              {isUpdatingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isUpdatingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Keamanan & Password */}
      <Card className="bg-card/60 backdrop-blur-xl border border-border/40 shadow-sm rounded-2xl overflow-hidden mt-6">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald-500" /> Keamanan
          </CardTitle>
          <CardDescription>Pastikan akun Anda menggunakan kata sandi yang kuat.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="newPassword">Kata Sandi Baru</Label>
              <Input 
                id="newPassword" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="h-11"
              />
            </div>
            
            <Button type="submit" variant="outline" className="h-11 w-full sm:w-auto border-emerald-500/30 text-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20" disabled={isUpdatingPassword || !password}>
              {isUpdatingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isUpdatingPassword ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
