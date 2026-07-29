import { AppUser } from "../../types/user";

const statusLabel: Record<AppUser["status"], string> = {
  active: "កំពុងដំណើរការ",
  pending: "កំពុងរង់ចាំ",
  suspended: "បានផ្អាក",
};

const statusColor: Record<AppUser["status"], string> = {
  active: "bg-emerald-50 text-emerald-700",
  pending: "bg-yellow-50 text-yellow-700",
  suspended: "bg-red-50 text-red-700",
};

export default function UsersTable({
  users,
  showShop = false,
}: {
  users: AppUser[];
  showShop?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-100">
            <th className="py-3 px-5 font-medium">ឈ្មោះ</th>
            {showShop && <th className="py-3 px-5 font-medium">ឈ្មោះហាង</th>}
            <th className="py-3 px-5 font-medium">លេខទូរស័ព្ទ</th>
            <th className="py-3 px-5 font-medium">អ៊ីមែល</th>
            <th className="py-3 px-5 font-medium">ថ្ងៃចូលរួម</th>
            <th className="py-3 px-5 font-medium">ស្ថានភាព</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-50 last:border-0">
              <td className="py-3 px-5 text-gray-700">{user.name}</td>
              {showShop && (
                <td className="py-3 px-5 text-gray-500">{user.shopName}</td>
              )}
              <td className="py-3 px-5 text-gray-500">{user.phone}</td>
              <td className="py-3 px-5 text-gray-500">{user.email}</td>
              <td className="py-3 px-5 text-gray-500">{user.joinDate}</td>
              <td className="py-3 px-5">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full ${statusColor[user.status]}`}
                >
                  {statusLabel[user.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}