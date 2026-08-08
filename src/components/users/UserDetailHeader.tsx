"use client";

import { Ban, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { UserProfile } from "../../types/userProfile";

interface UserDetailHeaderProps {
  user: UserProfile;
  activeProfile: UserProfile | null;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

export default function UserDetailHeader({
  user,
  activeProfile,
  onBack,
  onEdit,
  onDelete,
  onToggleStatus,
}: UserDetailHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-600 mt-1"
          title="ត្រឡប់ក្រោយ"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold shrink-0">
          {user.profileName.charAt(0)}
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">{user.profileName}</h2>
          <p className="text-sm text-gray-400">User ID: {user.uuid}</p>
          <p className="text-sm text-gray-500 mt-1">
            ថ្ងៃចូលរួម: {user.createdAt}
            {activeProfile && ` • ភេទ: ${activeProfile.gender === "MALE" ? "ប្រុស" : "ស្រី"}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-start">
        <button onClick={onToggleStatus} className="text-red-400 hover:text-red-600" title="ផ្អាក">
          <Ban size={18} />
        </button>
        <button onClick={onEdit} className="text-blue-400 hover:text-blue-600" title="កែសម្រួល">
          <Pencil size={18} />
        </button>
        <button onClick={onDelete} className="text-red-400 hover:text-red-600" title="លុប">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
