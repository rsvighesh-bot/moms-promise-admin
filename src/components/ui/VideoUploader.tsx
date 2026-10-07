import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { api } from "../../lib/api";

interface VideoUploaderProps {
  value?: string;
  onChange: (url: string) => void;
}

export function VideoUploader({ value, onChange }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setError("");
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("video", file);
      const { data } = await api.post("/uploads/video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(data.url);
    } catch {
      setError("Upload failed. Try again — videos are capped at 50MB.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-foreground block mb-1.5">
        Video
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {value ? (
        <div className="relative w-32 h-56 rounded-md overflow-hidden border border-border bg-black">
          <video
            src={value}
            className="w-full h-full object-cover"
            muted
            playsInline
            controls
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 z-10"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-32 h-56 rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted hover:border-primary hover:text-primary transition-colors"
        >
          {isUploading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Upload size={20} />
          )}
          <span className="text-xs">
            {isUploading ? "Uploading..." : "Upload video"}
          </span>
        </button>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
