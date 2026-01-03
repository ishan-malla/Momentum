import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import type { ResetCase } from "./ResetPassword";

type ChangePasswordProps = {
  setResetState: React.Dispatch<React.SetStateAction<ResetCase>>;
};

const ChangePassword = ({ setResetState }: ChangePasswordProps) => {
  return (
    <div className="bg-card border-border rounded-lg p-6 sm:p-8 shadow-sm">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setResetState("EnterOTP")}
            className="text-muted-foreground hover:text-foreground"
          >
            <Link to="/auth/login">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </button>
          <div>
            <h2 className="text-2xl font-serif font-semibold">
              Reset Password
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your new password
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password" className="font-franklin text-[14px]">
              New Password
            </Label>
            <Input
              id="new-password"
              type="password"
              placeholder="••••••••"
              className="font-sans"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirm-password"
              className="font-franklin text-[14px]"
            >
              Confirm Password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              className="font-sans"
            />
          </div>

          <Button className="w-full font-franklin">Reset Password</Button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
