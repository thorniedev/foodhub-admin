import { AlertTriangle } from "lucide-react";

import { getAdminApiErrorMessage } from "@/src/lib/adminApiError";

export default function SafetySectionError({ error }: { error: unknown }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <p>
        មិនអាចផ្ទុកទិន្នន័យនេះបាន។ {getAdminApiErrorMessage(error)}
      </p>
    </div>
  );
}
