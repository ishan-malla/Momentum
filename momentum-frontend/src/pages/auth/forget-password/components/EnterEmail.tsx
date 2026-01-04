import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import type { ResetCase } from "./ResetPassword";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const emailSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type EmailFormInputs = z.infer<typeof emailSchema>;

type EnterEmailProps = {
  setResetState: React.Dispatch<React.SetStateAction<ResetCase>>;
};

const EnterEmail = ({ setResetState }: EnterEmailProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormInputs>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = (data: EmailFormInputs) => {
    console.log(data);
    // Send verification code here
    setResetState("EnterOTP");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card border-border rounded-lg p-6 sm:p-8 shadow-sm"
    >
      <div className="space-y-4">
        <div className="header flex items-center gap-4 bg-gray">
          <div className="w-full">
            <div className="flex items-center gap-4">
              <Link
                to="/auth/login"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h2 className="text-2xl font-serif font-semibold">
                  Reset Password
                </h2>
                <p className="text-sm text-muted-foreground">
                  We'll send you a verification code
                </p>
              </div>
            </div>
            <div className="space-y-4 w-full mt-5">
              <div className="space-y-2 w-full">
                <Label htmlFor="email" className="font-franklin text-sm">
                  Enter Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  className="w-full"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full font-franklin">
                Send Verification code
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default EnterEmail;
