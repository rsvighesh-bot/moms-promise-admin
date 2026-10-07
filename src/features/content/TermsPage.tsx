import { FileText } from "lucide-react";
import { useTerms, useUpdateTerms } from "./useContent";
import { ContentEditor } from "../../components/ui/ContentEditor";

export function TermsPage() {
  const { data, isLoading } = useTerms();
  const mutation = useUpdateTerms();

  return (
    <ContentEditor
      icon={<FileText size={18} />}
      title="Terms of Service"
      description="Short version shown at checkout consent. Full version on the Terms page."
      shortLabel="Short summary (shown at checkout — keep it concise)"
      detailedLabel="Full terms (shown on the Terms of Service page)"
      initialData={data}
      isLoading={isLoading}
      onSave={(d) => mutation.mutate(d)}
      isSaving={mutation.isPending}
      saveError={(mutation.error as any)?.response?.data?.message}
      saveSuccess={mutation.isSuccess}
    />
  );
}
