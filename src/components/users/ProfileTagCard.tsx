import { ReactNode } from "react";

interface ProfileTagCardProps {
  icon: ReactNode;
  title: string;
  tags: string[];
  emptyLabel: string;
  tagClassName?: string;
}

export default function ProfileTagCard({
  icon,
  title,
  tags,
  emptyLabel,
  tagClassName = "bg-emerald-50 text-emerald-700",
}: ProfileTagCardProps) {
  return (
    <div>
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
        {icon}
        <span>{title}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <span className="text-sm text-gray-400">{emptyLabel}</span>
        ) : (
          tags.map((tag) => (
            <span
              key={tag}
              className={`text-xs sm:text-sm font-medium px-3 py-1 rounded-full ${tagClassName}`}
            >
              {tag}
            </span>
          ))
        )}
      </div>
    </div>
  );
}