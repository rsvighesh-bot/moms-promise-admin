import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Modal } from "../../components/ui/Modal";
import { FormField } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { useCreateAdmin } from "./useSettings";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "superadmin"]),
});
type FormData = z.infer<typeof schema>;

const emptyDefaults: FormData = {
  name: "",
  email: "",
  password: "",
  role: "admin",
};

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAdminModal({ isOpen, onClose }: CreateAdminModalProps) {
  const mutation = useCreateAdmin();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (isOpen) reset(emptyDefaults);
  }, [isOpen, reset]);

  const onSubmit = (data: FormData) => {
    mutation.mutate(data, { onSuccess: onClose });
  };

  const backendError = (mutation.error as any)?.response?.data?.message as
    | string
    | undefined;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Admin Account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Full name"
          {...register("name")}
          error={errors.name?.message}
        />
        <FormField
          label="Email"
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />
        <FormField
          label="Password"
          type="password"
          {...register("password")}
          error={errors.password?.message}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Role</label>
          <select
            {...register("role")}
            className="font-data px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="admin">Admin — day-to-day operations</option>
            <option value="superadmin">
              Superadmin — full access including refunds
            </option>
          </select>
        </div>

        {backendError && <p className="text-sm text-red-500">{backendError}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Create account
          </Button>
        </div>
      </form>
    </Modal>
  );
}
