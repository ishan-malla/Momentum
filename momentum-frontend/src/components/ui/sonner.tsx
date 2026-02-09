import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-center"
      closeButton
      duration={1500}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-primary" />,
        info: <InfoIcon className="size-4 text-accent-foreground" />,
        warning: <TriangleAlertIcon className="size-4 text-warning-foreground" />,
        error: <OctagonXIcon className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin text-muted-foreground" />,
      }}
      toastOptions={{
        duration: 1500,
        classNames: {
          toast:
            "bg-card text-foreground border border-border shadow-sm rounded-lg px-4 py-3",
          title: "font-franklin font-semibold text-[15px]",
          description: "font-sans text-[13px] text-muted-foreground",
          icon: "text-primary",
          closeButton:
            "bg-background border border-border text-muted-foreground hover:text-foreground",
          success: "bg-success text-success-foreground",
          error: "bg-destructive/10 text-foreground",
          warning: "bg-warning/15 text-foreground",
          info: "bg-accent/15 text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
