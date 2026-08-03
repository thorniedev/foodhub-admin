"use client";

import { Ban, Pencil, Trash2 } from "lucide-react";
import { User } from "../../types/user";

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

const STATUS_BADGE: Record<User["status"], string> = {
  active: "bg-emerald-50 text-emerald-600",
  pending: "bg-amber-50 text-amber-600",
  banned: "bg-red-50 text-red-500",
};

const STATUS_LABEL: Record<User["status"], string> = {
  active: "កំពុងដំណើរការ",
  pending: "កំពុងរង់ចាំ",
  banned: "បានផ្អាក",
};

export default function UsersTable({
  users,
  onEdit,
  onDelete,
  onToggleStatus,
}: UsersTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
      <table className="w-full text-sm min-w-[800px]">
        <thead>
          <tr className="text-left text-[#136C34] border-b border-gray-100">
            <th className="py-3 px-5 font-medium text-base lg:text-lg">ឈ្មោះ</th>
            <th className="py-3 px-5 font-medium text-base lg:text-lg">ឈ្មោះហាង</th>
            <th className="py-3 px-5 font-medium text-base lg:text-lg">លេខទូរស័ព្ទ</th>
            <th className="py-3 px-5 font-medium text-base lg:text-lg">អ៊ីម៉ែល</th>
            <th className="py-3 px-5 font-medium text-base lg:text-lg">ថ្ងៃចូលរួម</th>
            <th className="py-3 px-5 font-medium text-base lg:text-lg">ស្ថានភាព</th>
            <th className="py-3 px-5 font-medium text-right text-base lg:text-lg">
              សកម្មភាព
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-50 last:border-0">
              <td className="py-3 px-5 text-gray-700 font-medium">{user.name}</td>
              <td className="py-3 px-5 text-gray-500">{user.shopName || "-"}</td>
              <td className="py-3 px-5 text-gray-500">{user.phone}</td>
              <td className="py-3 px-5 text-gray-500">{user.email}</td>
              <td className="py-3 px-5 text-gray-500">{user.joinedDate}</td>
              <td className="py-3 px-5">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    STATUS_BADGE[user.status]
                  }`}
                >
                  {STATUS_LABEL[user.status]}
                </span>
              </td>
              <td className="py-3 px-5">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => onToggleStatus(user)}
                    title={user.status === "banned" ? "ដកការផ្អាក" : "ផ្អាក"}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Ban size={16} />
                  </button>
                  <button
                    onClick={() => onEdit(user)}
                    title="កែសម្រួល"
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(user)}
                    title="លុប"
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td colSpan={7} className="py-10 text-center text-gray-400">
                មិនមានទិន្នន័យ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}