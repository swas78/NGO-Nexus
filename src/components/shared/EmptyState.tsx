import { motion } from "framer-motion";
import { PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className={cn("w-full flex flex-col items-center justify-center py-16 px-4 text-center glass-card max-w-md mx-auto my-8", className)}
    >
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-6 shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-ngo-500/20 to-transparent opacity-50 animate-spin" style={{ animationDuration: '4s' }} />
        <div className="relative z-10">
          {icon || <PackageOpen className="w-8 h-8 text-white/20" />}
        </div>
      </div>
      <h3 className="text-lg font-bold text-white/90 mb-2">{title}</h3>
      <p className="text-sm text-white/40 max-w-sm leading-relaxed mb-6">
        {description}
      </p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </motion.div>
  );
}
