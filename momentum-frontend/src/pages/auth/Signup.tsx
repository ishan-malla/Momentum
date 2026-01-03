import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

const Signup = () => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            to="/auth/login"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-[24px] font-serif font-semibold">
              Create account
            </h2>
            <p className="text-[13px] text-muted-foreground">
              Start your productivity journey
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-franklin text-[14px]">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Alex Johnson"
              className="font-sans"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email" className="font-franklin text-[14px]">
              Email
            </Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              className="font-sans"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="signup-password"
              className="font-franklin text-[14px]"
            >
              Password
            </Label>
            <Input
              id="signup-password"
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

          <Button className="w-full font-franklin">Create account</Button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
