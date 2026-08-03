"use client";

import Link from "next/link";
import { Ban, Eye, Pencil, Trash2 } from "lucide-react";
import { UserProfile } from "../../types/userProfile";
import { calculateAge } from "../../lib/age";
import { formatShortDate } from "../../lib/formatDate";

interface UsersTableProps {
  profiles: UserProfile[];
  onEdit: (profile: UserProfile) => void;
  onDelete: (profile: UserProfile) => void;
  onToggleStatus: (profile: UserProfile) => void;
}

const RELATIONSHIP_LABEL: Record<string, string> = {
  SELF: "ខ្លួនឯង",
  CHILD: "កូន",
  PARENT: "ឪពុកម្តាយ",
  SPOUSE: "ប្តី/ប្រពន្ធ",
  OTHER: "ផ្សេងៗ",
};

const GENDER_LABEL: Record<string, string> = {
  MALE: "ប្រុស",
  FEMALE: "ស្រី",
  OTHER: "ផ្សេងៗ",
};

function healthSummary(p: UserProfile): string {
  const parts: string[] = [];
  if (p.allergies.length) parts.push(`អាឡែហ្ស៊ី ${p.allergies.length}`);
  if (p.dietaryTypes.length) parts.push(`របបអាហារ ${p.dietaryTypes.length}`);
  if (p.medicalConditions.length) parts.push(`ជំងឺ ${p.medicalConditions.length}`);
  return parts.length ? parts.join(", ") : "-";
}

export default function UsersTable({
  profiles,
  onEdit,
  onDelete,
  onToggleStatus,
}: UsersTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
      <table className="w-full text-sm min-w-[1200px]">
        <thead>
          <tr className="text-left text-[#136C34] border-b border-gray-100">
            <th className="py-3 px-4 font-medium text-base">ប្រវត្តិរូប</th>
            <th className="py-3 px-4 font-medium text-base">ទំនាក់ទំនង</th>
            <th className="py-3 px-4 font-medium text-base">ភេទ</th>
            <th className="py-3 px-4 font-medium text-base">ថ្ងៃខែឆ្នាំកំណើត</th>
            <th className="py-3 px-4 font-medium text-base">អាយុ</th>
            <th className="py-3 px-4 font-medium text-base">ក្រុមអាយុ</th>
            <th className="py-3 px-4 font-medium text-base">ភាសា</th>
            <th className="py-3 px-4 font-medium text-base">ចំណូលចិត្តសុខភាព</th>
            <th className="py-3 px-4 font-medium text-base">លំនាំដើម</th>
            <th className="py-3 px-4 font-medium text-base">ស្ថានភាព</th>
            <th className="py-3 px-4 font-medium text-base">កែប្រែចុងក្រោយ</th>
            <th className="py-3 px-4 font-medium text-right text-base">សកម្មភាព</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => (
            <tr key={p.uuid} className="border-b border-gray-50 last:border-0">
              <td className="py-3 px-4">
                <Link
                  href={`/users/${p.uuid}`}
                  className="flex items-center gap-3 hover:text-emerald-600"
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-semibold overflow-hidden shrink-0">
                    {p.avatarMediaUuid ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/media/${p.avatarMediaUuid}`}
                        alt={p.profileName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      p.profileName.charAt(0)
                    )}
                  </div>
                  <span className="font-medium text-gray-700">{p.profileName}</span>
                </Link>
              </td>
              <td className="py-3 px-4 text-gray-500">
                {RELATIONSHIP_LABEL[p.relationship] ?? p.relationship}
              </td>
              <td className="py-3 px-4 text-gray-500">
                {GENDER_LABEL[p.gender] ?? p.gender}
              </td>
              <td className="py-3 px-4 text-gray-500">{p.dateOfBirth}</td>
              <td className="py-3 px-4 text-gray-500">{calculateAge(p.dateOfBirth)}</td>
              <td className="py-3 px-4 text-gray-500">{p.ageGroup.name}</td>
              <td className="py-3 px-4 text-gray-500 uppercase">{p.preferredLanguage}</td>
              <td className="py-3 px-4 text-gray-500">{healthSummary(p)}</td>
              <td className="py-3 px-4">
                {p.isDefault ? (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                    លំនាំដើម
                  </span>
                ) : (
                  <span className="text-gray-300">-</span>
                )}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    p.isActive
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {p.isActive ? "សកម្ម" : "អសកម្ម"}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-500">{formatShortDate(p.updatedAt)}</td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/users/${p.uuid}`}
                    title="មើលព័ត៌មានលម្អិត"
                    className="text-emerald-500 hover:text-emerald-700"
                  >
                    <Eye size={16} />
                  </Link>
                  <button
                    onClick={() => onToggleStatus(p)}
                    title={p.isActive ? "ធ្វើអសកម្ម" : "ធ្វើសកម្ម"}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Ban size={16} />
                  </button>
                  <button
                    onClick={() => onEdit(p)}
                    title="កែសម្រួល"
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(p)}
                    title="លុប"
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {profiles.length === 0 && (
            <tr>
              <td colSpan={12} className="py-10 text-center text-gray-400">
                មិនមានទិន្នន័យ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}