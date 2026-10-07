import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Save } from "lucide-react";
import { useTopScroll, useUpdateTopScroll } from "./useTopScroll";
import { Button } from "../../components/ui/Button";

interface FormData {
  text: string;
  status: "active" | "inactive";
}

export function TopScrollPage() {
  const { data, isLoading } = useTopScroll();
  const mutation = useUpdateTopScroll();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<FormData>({
    defaultValues: { text: "", status: "inactive" },
  });

  useEffect(() => {
    if (data) reset({ text: data.text, status: data.status });
  }, [data, reset]);

  if (isLoading) {
    return <div className="py-12 text-center text-muted">Loading...</div>;
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold mb-1">Top Scroll Message</h1>
      <p className="text-sm text-muted mb-6">
        A single message strip shown at the very top of the storefront. There's
        only ever one — toggle it on or off here.
      </p>

      <form
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        className="bg-surface border border-border rounded-lg p-5 space-y-4"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Message text</label>
          <input
            {...register("text", { required: true })}
            placeholder="Free shipping on orders above ₹999"
            className="font-data px-3 py-2.5 rounded-md border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register("status")} className="hidden" />
          {/* Controlled toggle, since checkbox + enum string needs manual wiring */}
        </label>

        <ToggleRow register={register} />

        {mutation.isSuccess && <p className="text-sm text-green-600">Saved.</p>}

        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={mutation.isPending}
            disabled={!isDirty}
          >
            <span className="flex items-center gap-2">
              <Save size={15} /> Save
            </span>
          </Button>
        </div>
      </form>
    </div>
  );
}

// Small inline toggle — checkbox bound to "active"/"inactive" instead of boolean
function ToggleRow({ register }: { register: any }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">Show on storefront</span>
      <select
        {...register("status")}
        className="font-data px-3 py-2 rounded-md border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  );
}
