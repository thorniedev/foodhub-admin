import {
  Users,
  TrendingUp,
  ShoppingBag,
  Layers,
  LucideIcon,
} from "lucide-react";
import { StatCardData } from "../../types/dashboard";

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  "trending-up": TrendingUp,
  "shopping-bag": ShoppingBag,
  layers: Layers,
};

export default function StatCard({ data }: { data: StatCardData }) {
  const Icon = iconMap[data.icon] ?? Users;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
      <div
        className={`w-11 h-11 rounded-xl ${data.iconBg} flex items-center justify-center text-white shrink-0`}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xl text-[#136C34]">{data.label}</p>
        <p className="text-2xl font-bold text-[#0E5327] mt-1">{data.value}</p>
        {data.subLabel && (
          <p className="text-lg text-[#0E5327] mt-1">{data.subLabel}</p>
        )}
      </div>
    </div>
  );
}
