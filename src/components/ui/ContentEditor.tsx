import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, type ReactNode } from "react";
import { Save } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { Button } from "./Button";

const schema = z.object({
  short: z.string().min(1, "Short summary is required"),
  detailed: z.string().min(1, "Detailed content is required"),
});
type FormData = z.infer<typeof schema>;

interface ContentEditorProps {
  icon: ReactNode;
  title: string;
  description: string;
  shortLabel?: string;
  detailedLabel?: string;
  initialData?: { short: string; detailed: string; updatedAt: string };
  isLoading: boolean;
  onSave: (data: { short: string; detailed: string }) => void;
  isSaving: boolean;
  saveError?: string;
  saveSuccess?: boolean;
}

export function ContentEditor({
  icon,
  title,
  description,
  shortLabel = "Short summary",
  detailedLabel = "Detailed content",
  initialData,
  isLoading,
  onSave,
  isSaving,
  saveError,
  saveSuccess,
}: ContentEditorProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { short: "", detailed: "" },
  });

  useEffect(() => {
    if (initialData) {
      reset({ short: initialData.short, detailed: initialData.detailed });
    }
  }, [initialData, reset]);

  if (isLoading) {
    return <div className="py-12 text-center text-muted">Loading...</div>;
  }

  return (
    <div className="max-w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          {icon}
        </div>
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-muted">{description}</p>
        </div>
      </div>

      {initialData && (
        <p className="text-xs text-muted mb-4 font-data">
          Last updated:{" "}
          {new Date(initialData.updatedAt).toLocaleString("en-IN")}
        </p>
      )}

      <form
        onSubmit={handleSubmit(onSave)}
        className="bg-surface border border-border rounded-lg p-5 space-y-4"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">{shortLabel}</label>
          <textarea
            {...register("short")}
            rows={3}
            placeholder="Brief summary shown on product pages, cart, and checkout..."
            className="font-data px-3 py-2.5 rounded-md border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          {errors.short && (
            <span className="text-xs text-red-500">{errors.short.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">{detailedLabel}</label>
          <RichTextEditor
            value={watch("detailed")}
            onChange={(html) =>
              setValue("detailed", html, { shouldDirty: true })
            }
            placeholder="Full content shown on the dedicated page..."
            error={errors.detailed?.message}
          />
          {errors.detailed && (
            <span className="text-xs text-red-500">
              {errors.detailed.message}
            </span>
          )}
          <p className="text-xs text-muted">
            Markdown supported — the storefront will render it as formatted
            text.
          </p>
        </div>

        {saveError && <p className="text-sm text-red-500">{saveError}</p>}
        {saveSuccess && (
          <p className="text-sm text-green-600">Saved successfully.</p>
        )}

        <div className="flex justify-end">
          <Button type="submit" isLoading={isSaving} disabled={!isDirty}>
            <span className="flex items-center gap-2">
              <Save size={15} /> Save
            </span>
          </Button>
        </div>
      </form>
    </div>
  );
}
