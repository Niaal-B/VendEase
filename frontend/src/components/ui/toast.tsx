import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "success", onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: "bg-emerald-600 text-white border-emerald-700",
    error: "bg-destructive text-destructive-foreground border-destructive/50",
    info: "bg-blue-600 text-white border-blue-700",
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 shadow-lg text-sm border flex items-center gap-3 min-w-[300px] max-w-md animate-in slide-in-from-bottom-5",
        styles[type]
      )}
    >
      <div className="flex-1">{message}</div>
      <button
        onClick={onClose}
        className="opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

