"use client";

import { Pencil, Power, Star, Trash2, ArrowLeft } from "lucide-react";
import { UserProfile } from "../../../types/userProfile";

const RELATIONSHIP_LABEL: Record<string, string> = {
  SELF: "ខ្លួនឯង",
  CHILD: "កូន",
  PARENT: "ឪពុកម្តាយ",
  SPOUSE: "ប្តី/ប្រពន្ធ",
  OTHER: "ផ្សេងៗ",
};

interface ProfileHeaderProps {
  profile: UserProfile;
  onBack: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  onSetDefault: () => void;
  onDelete: () => void;
}

export default function ProfileHeader({
  profile,
  onBack,
  onEdit,
  onToggleActive,
  onSetDefault,
  onDelete,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 mt-1" title="ត្រឡប់ក្រោយ">
          <ArrowLeft size={20} />
        </button>

        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold overflow-hidden shrink-0">
          {profile.avatarMediaUuid ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/media/${profile.avatarMediaUuid}`}
              alt={profile.profileName}
              className="w-full h-full object-cover"
            />
          ) : (
            profile.profileName.charAt(0)
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              {profile.profileName}
            </h2>
            {profile.isDefault && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                លំនាំដើម
              </span>
            )}
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                profile.isActive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-500"
              }`}
            >
              {profile.isActive ? "សកម្ម" : "អសកម្ម"}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {RELATIONSHIP_LABEL[profile.relationship] ?? profile.relationship}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start flex-wrap">
        <button
          onClick={onEdit}
          title="កែសម្រួលប្រវត្តិរូប"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          <Pencil size={14} /> កែសម្រួល
        </button>
        <button
          onClick={onToggleActive}
          title="ធ្វើសកម្ម / អសកម្ម"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-600 hover:bg-amber-50 rounded-lg"
        >
          <Power size={14} /> {profile.isActive ? "ធ្វើអសកម្ម" : "ធ្វើសកម្ម"}
        </button>
        {!profile.isDefault && (
          <button
            onClick={onSetDefault}
            title="កំណត់ជាលំនាំដើម"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg"
          >
            <Star size={14} /> កំណត់ជាលំនាំដើម
          </button>
        )}
        <button
          onClick={onDelete}
          title="លុប"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg"
        >
          <Trash2 size={14} /> លុប
        </button>
      </div>
    </div>
  );
}