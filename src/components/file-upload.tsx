// src/components/file-upload.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, FileText, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FileUploadProps = {
  folder: string;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  value?: string; // current URL
  onUpload: (url: string, path: string) => void;
  onError?: (msg: string) => void;
  className?: string;
  // Optional preview type hint
  preview?: "image" | "file";
};

export function FileUpload({
  folder,
  label = "Upload File",
  accept = "image/*",
  maxSizeMB = 5,
  value,
  onUpload,
  onError,
  className,
  preview = "image",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setLocalError(null);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Upload failed");
        }
        onUpload(data.url, data.path);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setLocalError(msg);
        onError?.(msg);
      } finally {
        setUploading(false);
      }
    },
    [folder, onUpload, onError]
  );

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  const isImage = preview === "image" && value && (value.startsWith("data:image") || value.match(/\.(jpg|jpeg|png|webp|gif)$/i));

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
      )}

      {value ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
          {isImage ? (
            <img src={value} alt="preview" className="h-14 w-14 rounded-md object-cover border" />
          ) : (
            <div className="h-14 w-14 rounded-md bg-card border flex items-center justify-center">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate">Uploaded successfully</div>
            <div className="text-[11px] text-muted-foreground truncate">
              {value.startsWith("data:") ? "Local storage (dev)" : "Cloud storage"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onUpload("", "")}
            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors text-center"
        >
          {uploading ? (
            <>
              <Loader2 className="h-7 w-7 text-primary animate-spin mb-2" />
              <div className="text-xs font-medium">Uploading...</div>
            </>
          ) : (
            <>
              {preview === "image" ? (
                <ImageIcon className="h-7 w-7 text-muted-foreground mb-2" />
              ) : (
                <Upload className="h-7 w-7 text-muted-foreground mb-2" />
              )}
              <div className="text-xs font-medium">Click or drag to upload</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Max {maxSizeMB}MB · {accept === "image/*" ? "Images only" : "See allowed types"}
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {localError && (
        <div className="text-xs text-destructive">{localError}</div>
      )}
    </div>
  );
}
