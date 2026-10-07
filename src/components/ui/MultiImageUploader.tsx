import { useRef, useState } from "react";
import { X, Loader2, Plus } from "lucide-react";
import { api } from "../../lib/api";

interface MultiImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export function MultiImageUploader({
  value,
  onChange,
}: MultiImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setError("");
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await api.post("/uploads/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange([...value, data.url]);
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="text-sm font-medium text-foreground block mb-1.5">
        Images
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div
            key={url + i}
            className="relative w-24 h-24 rounded-md overflow-hidden border border-border"
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-24 h-24 rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted hover:border-primary hover:text-primary transition-colors"
        >
          {isUploading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Plus size={18} />
          )}
          <span className="text-xs">{isUploading ? "..." : "Add"}</span>
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
