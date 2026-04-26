"use client";

import { useState } from "react";
import { X, Zap, CheckCircle2, CircleDot, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ParaCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  areas?: { id: string; name: string; color: string }[];
}

type CaptureStep = "actionable" | "deadline" | "create-project" | "create-resource";

export function ParaCaptureModal({ open, onClose, onSuccess, areas = [] }: ParaCaptureModalProps) {
  const [step, setStep] = useState<CaptureStep>("actionable");
  const [title, setTitle] = useState("");
  const [outcome, setOutcome] = useState("");
  const [deadline, setDeadline] = useState("");
  const [areaId, setAreaId] = useState("");
  const [resType, setResType] = useState<"Article" | "Idea" | "Note">("Note");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const reset = () => {
    setStep("actionable");
    setTitle(""); setOutcome(""); setDeadline(""); setAreaId("");
    setResType("Note"); setContent(""); setTags(""); setError("");
  };

  const handleClose = () => { reset(); onClose(); };

  const handleCreateProject = async () => {
    if (!title.trim() || !outcome.trim()) { setError("Judul dan outcome wajib diisi."); return; }
    setIsLoading(true); setError("");
    const res = await fetch("/api/para/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, outcome, deadline: deadline || null, area_id: areaId || null }),
    });
    const data = await res.json();
    setIsLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onSuccess?.(); handleClose();
  };

  const handleCreateResource = async () => {
    if (!title.trim()) { setError("Judul wajib diisi."); return; }
    setIsLoading(true); setError("");
    const tagArr = tags.split(",").map(t => t.trim()).filter(Boolean);
    const res = await fetch("/api/para/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, type: resType, content, tags: tagArr, area_id: areaId || null }),
    });
    const data = await res.json();
    setIsLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onSuccess?.(); handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-card rounded-3xl border border-border/50 shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={handleClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Step: Is this actionable? */}
        {step === "actionable" && (
          <div className="space-y-5">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Capture Cepat</h2>
                <p className="text-xs text-muted-foreground">Apa yang ingin kamu simpan?</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground/80 mb-1.5 block">Judul / Ide</label>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && title.trim() && setStep("actionable")}
                placeholder="Contoh: Buat konten untuk Instagram..."
                className="w-full text-sm bg-muted/40 rounded-xl px-4 py-3 outline-none border border-border/40 focus:border-primary/50 transition-colors"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground/80 mb-3">Apakah ini bisa dikerjakan?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={!title.trim()}
                  onClick={() => setStep("deadline")}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-primary/10 border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                  <div className="text-center">
                    <p className="font-bold text-sm text-foreground">Ya, bisa dikerjakan</p>
                    <p className="text-[11px] text-muted-foreground">Project / Task</p>
                  </div>
                </button>
                <button
                  disabled={!title.trim()}
                  onClick={() => setStep("create-resource")}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted/50 border-2 border-border/40 hover:border-border/70 hover:bg-muted/70 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FileText className="w-6 h-6 text-muted-foreground" />
                  <div className="text-center">
                    <p className="font-bold text-sm text-foreground">Tidak / Referensi</p>
                    <p className="text-[11px] text-muted-foreground">Resource / Catatan</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Does it have a deadline? */}
        {step === "deadline" && (
          <div className="space-y-5">
            <button onClick={() => setStep("actionable")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">← Kembali</button>
            <div>
              <h2 className="font-bold text-foreground mb-1">Apakah ada deadline?</h2>
              <p className="text-xs text-muted-foreground">Ini menentukan apakah ini Project atau hanya referensi area.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStep("create-project")}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-primary/10 border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/15 transition-all"
              >
                <Calendar className="w-6 h-6 text-primary" />
                <div className="text-center">
                  <p className="font-bold text-sm text-foreground">Ada deadline</p>
                  <p className="text-[11px] text-muted-foreground">→ Buat Project</p>
                </div>
              </button>
              <button
                onClick={() => setStep("create-project")}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted/50 border-2 border-border/40 hover:border-border/70 hover:bg-muted/70 transition-all"
              >
                <CircleDot className="w-6 h-6 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-bold text-sm text-foreground">Tidak ada</p>
                  <p className="text-[11px] text-muted-foreground">→ Tetap buat Project</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step: Create Project */}
        {step === "create-project" && (
          <div className="space-y-4">
            <button onClick={() => setStep("deadline")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">← Kembali</button>
            <h2 className="font-bold text-foreground">Buat Project Baru</h2>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Outcome (hasil yang diharapkan) *</label>
              <textarea
                autoFocus
                rows={2}
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="Saya ingin berhasil..."
                className="w-full text-sm bg-muted/40 rounded-xl px-4 py-3 outline-none border border-border/40 focus:border-primary/50 resize-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-sm bg-muted/40 rounded-xl px-4 py-3 outline-none border border-border/40 focus:border-primary/50 transition-colors"
              />
            </div>

            {areas.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Area (opsional)</label>
                <select
                  value={areaId}
                  onChange={(e) => setAreaId(e.target.value)}
                  className="w-full text-sm bg-muted/40 rounded-xl px-4 py-3 outline-none border border-border/40 focus:border-primary/50 transition-colors"
                >
                  <option value="">Tidak terkait area</option>
                  {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            )}

            {error && <p className="text-xs text-expense font-semibold">{error}</p>}

            <Button
              onClick={handleCreateProject}
              disabled={isLoading || !outcome.trim()}
              className="w-full h-11 rounded-xl font-semibold gradient-primary text-white hover:opacity-90"
            >
              {isLoading ? "Menyimpan..." : "Buat Project"}
            </Button>
          </div>
        )}

        {/* Step: Create Resource */}
        {step === "create-resource" && (
          <div className="space-y-4">
            <button onClick={() => setStep("actionable")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">← Kembali</button>
            <h2 className="font-bold text-foreground">Simpan sebagai Resource</h2>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Tipe</label>
              <div className="flex gap-2">
                {(["Note", "Article", "Idea"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setResType(t)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${resType === t ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:border-border/70"}`}
                  >
                    {t === "Note" ? "Catatan" : t === "Article" ? "Artikel" : "Ide"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Konten (opsional)</label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Detail, link, catatan..."
                className="w-full text-sm bg-muted/40 rounded-xl px-4 py-3 outline-none border border-border/40 focus:border-primary/50 resize-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Tags (pisahkan dengan koma)</label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="marketing, referensi, ide..."
                className="w-full text-sm bg-muted/40 rounded-xl px-4 py-3 outline-none border border-border/40 focus:border-primary/50 transition-colors"
              />
            </div>

            {areas.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Area (opsional)</label>
                <select
                  value={areaId}
                  onChange={(e) => setAreaId(e.target.value)}
                  className="w-full text-sm bg-muted/40 rounded-xl px-4 py-3 outline-none border border-border/40 focus:border-primary/50 transition-colors"
                >
                  <option value="">Tidak terkait area</option>
                  {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            )}

            {error && <p className="text-xs text-expense font-semibold">{error}</p>}

            <Button
              onClick={handleCreateResource}
              disabled={isLoading || !title.trim()}
              className="w-full h-11 rounded-xl font-semibold gradient-primary text-white hover:opacity-90"
            >
              {isLoading ? "Menyimpan..." : "Simpan Resource"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
