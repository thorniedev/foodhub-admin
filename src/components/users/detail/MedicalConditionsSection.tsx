import { HeartPulse } from "lucide-react";
import { MedicalCondition } from "../../../types/userProfile";

interface MedicalConditionsSectionProps {
  conditions: MedicalCondition[];
}

export default function MedicalConditionsSection({ conditions }: MedicalConditionsSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <HeartPulse size={16} className="text-gray-500" />
        <h3 className="text-base sm:text-lg font-bold text-gray-800">ស្ថានភាពសុខភាព</h3>
      </div>

      {conditions.length === 0 ? (
        <p className="text-sm text-gray-400">គ្មានស្ថានភាពសុខភាពពិសេស</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="py-2 font-medium">ជំងឺ</th>
              <th className="py-2 font-medium">កម្រិត</th>
              <th className="py-2 font-medium">កំណត់ចំណាំ</th>
            </tr>
          </thead>
          <tbody>
            {conditions.map((c) => (
              <tr key={c.uuid} className="border-b border-gray-50 last:border-0">
                <td className="py-2 font-medium text-gray-800">{c.name}</td>
                <td className="py-2 text-gray-500">{c.severity}</td>
                <td className="py-2 text-gray-500">{c.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}