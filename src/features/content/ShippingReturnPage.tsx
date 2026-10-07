import { Truck } from "lucide-react";
import { useShippingReturn, useUpdateShippingReturn } from "./useContent";
import { ContentEditor } from "../../components/ui/ContentEditor";

export function ShippingReturnPage() {
  const { data, isLoading } = useShippingReturn();
  const mutation = useUpdateShippingReturn();

  return (
    <ContentEditor
      icon={<Truck size={18} />}
      title="Shipping & Return Policy"
      description="Shown on product pages (short) and the full policy page (detailed)."
      shortLabel="Short summary"
      detailedLabel="Full policy"
      initialData={data}
      isLoading={isLoading}
      onSave={(d) => mutation.mutate(d)}
      isSaving={mutation.isPending}
      saveError={(mutation.error as any)?.response?.data?.message}
      saveSuccess={mutation.isSuccess}
    />
  );
}
