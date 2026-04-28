import { GlassCard } from "@/components/shared/GlassCard";
import { cn } from "@/lib/utils";

export function CardSkeleton() {
  return (
    <GlassCard className="p-5 h-full flex flex-col pointer-events-none">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl skeleton" />
        <div className="flex gap-2">
          <div className="w-16 h-5 rounded-md skeleton" />
        </div>
      </div>
      <div className="w-3/4 h-5 mb-2 rounded skeleton" />
      <div className="w-full h-3 mb-2 rounded skeleton" />
      <div className="w-2/3 h-3 mb-4 rounded skeleton" />
      
      <div className="mt-auto pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
        <div className="h-8 rounded skeleton" />
        <div className="h-8 rounded skeleton" />
        <div className="h-8 rounded skeleton" />
      </div>
    </GlassCard>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-white/[0.03]">
      <td className="px-4 py-4"><div className="w-3 h-3 rounded-full skeleton" /></td>
      <td className="px-4 py-4">
        <div className="w-32 h-4 mb-1 rounded skeleton" />
        <div className="w-20 h-3 rounded skeleton" />
      </td>
      <td className="px-4 py-4"><div className="w-20 h-5 rounded-md skeleton" /></td>
      <td className="px-4 py-4"><div className="w-8 h-4 rounded skeleton" /></td>
      <td className="px-4 py-4"><div className="w-24 h-2 rounded-full skeleton" /></td>
      <td className="px-4 py-4"><div className="w-20 h-5 rounded-md skeleton" /></td>
      <td className="px-4 py-4"><div className="w-24 h-3 rounded skeleton" /></td>
      <td className="px-4 py-4"><div className="w-16 h-6 rounded skeleton" /></td>
    </tr>
  );
}

export function KPIChartSkeleton({ className }: { className?: string }) {
  return (
    <GlassCard className={cn("p-6 flex flex-col pointer-events-none", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="w-32 h-4 rounded skeleton" />
        <div className="w-16 h-3 rounded skeleton" />
      </div>
      <div className="w-full flex-1 min-h-[200px] rounded-lg skeleton opacity-50" />
    </GlassCard>
  );
}
