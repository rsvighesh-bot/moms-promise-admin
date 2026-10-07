import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { useChangePassword } from "./useSettings";
import { ADMIN_ME_KEY } from "../auth/useAdminMe";
import { FormField } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

type FormData = z.infer<typeof schema>;

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          // Backend clears the cookie — we clear local state and redirect to login
          queryClient.setQueryData(ADMIN_ME_KEY, null);
          queryClient.clear();
          navigate("/login", { replace: true });
        },
      },
    );
  };

  const backendError = (mutation.error as any)?.response?.data?.message as
    | string
    | undefined;

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <KeyRound size={18} />
        </div>
        <div>
          <h1 className="text-xl font-bold">Change Password</h1>
          <p className="text-sm text-muted">
            You'll be logged out after changing your password.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-surface border border-border rounded-lg p-5 space-y-4"
      >
        <FormField
          label="Current password"
          type="password"
          {...register("currentPassword")}
          error={errors.currentPassword?.message}
        />
        <FormField
          label="New password"
          type="password"
          {...register("newPassword")}
          error={errors.newPassword?.message}
        />
        <FormField
          label="Confirm new password"
          type="password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        {backendError && <p className="text-sm text-red-500">{backendError}</p>}

        <div className="flex justify-end pt-1">
          <Button type="submit" isLoading={mutation.isPending}>
            Change password
          </Button>
        </div>
      </form>
    </div>
  );
}
