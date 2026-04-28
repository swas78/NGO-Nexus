"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileImage, X, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OCRUploadProps {
  onExtracted: (data: {
    title: string;
    category: string;
    address: string;
    peopleAffected: number;
    urgency: string;
    notes: string;
  }) => void;
}

export function OCRUpload({ onExtracted }: OCRUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [extracted, setExtracted] = useState(false);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
    setExtracted(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  }, [handleFile]);

  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const runOCR = async () => {
    setProcessing(true);
    // Simulate AI OCR processing
    await new Promise((r) => setTimeout(r, 2500));
    setProcessing(false);
    setExtracted(true);
    onExtracted({
      title: "Emergency Food Distribution",
      category: "food",
      address: "Block 7, Relief Camp, Eastern District",
      peopleAffected: 350,
      urgency: "critical",
      notes: "Families displaced by recent flooding. Immediate need for dry rations and clean water. Children and elderly are priority.",
    });
  };

  const clear = () => {
    setFile(null);
    setPreview(null);
    setExtracted(false);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-white/50 uppercase tracking-wider">
        Upload Paper Form (AI OCR)
      </label>

      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
              dragOver
                ? "border-ngo-400 bg-ngo-500/5"
                : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
            )}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleSelect}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className={cn("w-8 h-8 mx-auto mb-3 transition-colors", dragOver ? "text-ngo-400" : "text-white/20")} />
            <p className="text-sm text-white/50 mb-1">
              <span className="text-ngo-400 font-medium">Click to upload</span> or drag & drop
            </p>
            <p className="text-xs text-white/25">PNG, JPG, PDF up to 10MB</p>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]"
          >
            <div className="flex items-start gap-4 p-4">
              {preview && (
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Upload" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileImage className="w-4 h-4 text-white/40" />
                  <p className="text-sm text-white/70 truncate">{file.name}</p>
                </div>
                <p className="text-xs text-white/30 mb-3">{(file.size / 1024).toFixed(1)} KB</p>

                {!extracted && !processing && (
                  <button onClick={runOCR} className="btn-primary !py-2 !px-4 text-xs flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" /> Extract with AI
                  </button>
                )}

                {processing && (
                  <div className="flex items-center gap-2 text-ngo-400 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI is analyzing the document...
                  </div>
                )}

                {extracted && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-emerald-400 text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Fields extracted & auto-filled!
                  </motion.div>
                )}
              </div>
              <button onClick={clear} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
