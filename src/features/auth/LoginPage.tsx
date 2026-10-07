import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { loginAdmin } from "./authApi";
import { ADMIN_ME_KEY } from "./useAdminMe";
import { FormField } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => loginAdmin(data.email, data.password),
    onSuccess: (admin) => {
      queryClient.setQueryData(ADMIN_ME_KEY, admin); // skip an extra /me round-trip
      navigate("/");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="w-full max-w-sm bg-surface border border-border rounded-lg p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-primary">moms-promise Admin</h1>

        <FormField
          label="Email"
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />

        <div className="relative">
          <FormField
            label="Password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            error={errors.password?.message}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-9.5 text-muted hover:text-primary transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {mutation.isError && (
          <p className="text-sm text-red-500">Invalid email or password.</p>
        )}

        <Button type="submit" isLoading={mutation.isPending} className="w-full">
          Log in
        </Button>
      </form>
    </div>
  );
}
