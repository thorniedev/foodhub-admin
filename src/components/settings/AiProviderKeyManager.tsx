"use client";

import { useState } from "react";

import { AlertTriangle, Check, KeyRound, Plus, Power, Trash2, X } from "lucide-react";

import {
  useActivateAiProviderKeyMutation,
  useCreateAiProviderKeyMutation,
  useDeleteAiProviderKeyMutation,
  useGetAiProviderKeysQuery,
  useUpdateAiProviderKeyMutation,
} from "@/src/app/store/aiProviderKeyApi";

import { getApiErrorMessage, type ApiMessage } from "@/src/types/safetyResource";

import type { AiProvider, AiProviderKey } from "@/src/types/ai-provider-key";

/* =========================================================
   CONSTANTS
========================================================= */

const PROVIDER_LABELS: Record<AiProvider, string> = {
  GOOGLE_GENAI: "Google Gemini",
  OPENAI: "OpenAI",
};

const PROVIDERS: AiProvider[] = ["GOOGLE_GENAI", "OPENAI"];

/* =========================================================
   HELPERS
========================================================= */

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("km-KH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

/* =========================================================
   ADD KEY FORM
========================================================= */

function AddKeyForm({
  onCreated,
  onError,
}: {
  onCreated: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [provider, setProvider] = useState<AiProvider>("GOOGLE_GENAI");
  const [label, setLabel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [activateNow, setActivateNow] = useState(true);

  const [createKey, { isLoading }] = useCreateAiProviderKeyMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!label.trim() || !apiKey.trim()) {
      onError("សូមបំពេញឈ្មោះ និងកូនសោ API ឱ្យបានគ្រប់គ្រាន់។");
      return;
    }

    try {
      await createKey({
        provider,
        label: label.trim(),
        apiKey: apiKey.trim(),
        activate: activateNow,
      }).unwrap();

      setLabel("");
      setApiKey("");
      onCreated(
        activateNow
          ? "បានបន្ថែម និងបើកប្រើកូនសោ AI ថ្មីដោយជោគជ័យ។"
          : "បានបន្ថែមកូនសោ AI ថ្មីដោយជោគជ័យ។",
      );
    } catch (error) {
      onError(getApiErrorMessage(error));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Plus size={18} className="text-[#136C34]" />
          បន្ថែមកូនសោ API ថ្មី
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          នៅពេលកូនសោបច្ចុប្បន្នអស់សិទ្ធិប្រើប្រាស់ (quota) សូមបន្ថែមកូនសោថ្មីនៅទីនេះ ហើយប្រព័ន្ធនឹងប្តូរទៅប្រើវាភ្លាមៗ
          ដោយមិនចាំបាច់ដាក់ឱ្យដំណើរការឡើងវិញទេ។
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-600">
          ក្រុមហ៊ុន AI
        </label>
        <select
          value={provider}
          onChange={(event) => setProvider(event.target.value as AiProvider)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#136C34] focus:outline-none"
        >
          {PROVIDERS.map((value) => (
            <option key={value} value={value}>
              {PROVIDER_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-600">
          ឈ្មោះកូនសោ
        </label>
        <input
          type="text"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="ឧ. Gemini បម្រុងទុក #2"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#136C34] focus:outline-none"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-gray-600">
          កូនសោ API
        </label>
        <input
          type="password"
          autoComplete="off"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="បិទភ្ជាប់កូនសោ API នៅទីនេះ"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#136C34] focus:outline-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2">
        <input
          type="checkbox"
          checked={activateNow}
          onChange={(event) => setActivateNow(event.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-[#136C34] focus:ring-[#136C34]"
        />
        បើកប្រើកូនសោនេះភ្លាមៗ (ជំនួសកូនសោបច្ចុប្បន្នរបស់ {PROVIDER_LABELS[provider]})
      </label>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 rounded-full bg-[#136C34] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f5828] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <KeyRound size={16} />
          {isLoading ? "កំពុងរក្សាទុក..." : "រក្សាទុកកូនសោ"}
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   KEY ROW
========================================================= */

function KeyRow({
  aiKey,
  onMessage,
}: {
  aiKey: AiProviderKey;
  onMessage: (message: ApiMessage) => void;
}) {
  const [activateKey, { isLoading: isActivating }] =
    useActivateAiProviderKeyMutation();
  const [updateKey, { isLoading: isUpdating }] = useUpdateAiProviderKeyMutation();
  const [deleteKey, { isLoading: isDeleting }] = useDeleteAiProviderKeyMutation();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const busy = isActivating || isUpdating || isDeleting;

  const handleActivate = async () => {
    try {
      await activateKey(aiKey.uuid).unwrap();
      onMessage({ type: "success", text: `បានបើកប្រើកូនសោ "${aiKey.label}"` });
    } catch (error) {
      onMessage({ type: "error", text: getApiErrorMessage(error) });
    }
  };

  const handleToggleEnabled = async () => {
    try {
      await updateKey({
        uuid: aiKey.uuid,
        body: { enabled: !aiKey.enabled },
      }).unwrap();
      onMessage({
        type: "success",
        text: aiKey.enabled
          ? `បានបិទកូនសោ "${aiKey.label}"`
          : `បានបើកកូនសោ "${aiKey.label}"`,
      });
    } catch (error) {
      onMessage({ type: "error", text: getApiErrorMessage(error) });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteKey(aiKey.uuid).unwrap();
      onMessage({ type: "success", text: `បានលុបកូនសោ "${aiKey.label}"` });
    } catch (error) {
      onMessage({ type: "error", text: getApiErrorMessage(error) });
    } finally {
      setConfirmingDelete(false);
    }
  };

  return (
    <tr className="border-b border-gray-50 last:border-0">
      <td className="px-4 py-3">
        <div className="font-medium text-gray-800">{aiKey.label}</div>
        <div className="text-xs text-gray-400">{PROVIDER_LABELS[aiKey.provider]}</div>
      </td>
      <td className="px-4 py-3 font-mono text-sm text-gray-600">
        {aiKey.maskedKey}
      </td>
      <td className="px-4 py-3">
        {aiKey.active ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-[#136C34]">
            <Check size={12} /> កំពុងប្រើ
          </span>
        ) : aiKey.enabled ? (
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
            ត្រៀមរួចរាល់
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-400">
            បានបិទ
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {formatDateTime(aiKey.lastUsedAt)}
      </td>
      <td className="px-4 py-3 text-sm">
        {aiKey.lastErrorAt ? (
          <span
            className="inline-flex items-center gap-1 text-red-600"
            title={aiKey.lastErrorMessage ?? undefined}
          >
            <AlertTriangle size={14} />
            {formatDateTime(aiKey.lastErrorAt)}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          {!aiKey.active && (
            <button
              type="button"
              disabled={busy || !aiKey.enabled}
              onClick={handleActivate}
              title={aiKey.enabled ? "បើកប្រើកូនសោនេះ" : "សូមបើកកូនសោសិន"}
              className="rounded-full bg-[#136C34] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0f5828] disabled:cursor-not-allowed disabled:opacity-50"
            >
              បើកប្រើ
            </button>
          )}

          <button
            type="button"
            disabled={busy}
            onClick={handleToggleEnabled}
            title={aiKey.enabled ? "បិទកូនសោនេះ" : "បើកកូនសោនេះ"}
            className="rounded-full border border-gray-200 p-1.5 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Power size={14} />
          </button>

          {confirmingDelete ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={busy}
                onClick={handleDelete}
                className="rounded-full bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                លុបចោល
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-full border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmingDelete(true)}
              title="លុបកូនសោនេះ"
              className="rounded-full border border-gray-200 p-1.5 text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function AiProviderKeyManager() {
  const { data, isLoading, error } = useGetAiProviderKeysQuery();
  const [message, setMessage] = useState<ApiMessage | null>(null);

  const keys = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          កូនសោ API របស់ AI
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          គ្រប់គ្រងកូនសោ API សម្រាប់ការណែនាំដោយ AI។ កូនសោដែល &quot;កំពុងប្រើ&quot;
          ត្រូវបានប្រើភ្លាមៗ ដោយមិនចាំបាច់ដាក់ម៉ាស៊ីនមេឱ្យដំណើរការឡើងវិញឡើយ។
        </p>
      </div>

      {message && (
        <div
          className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-[#136C34]"
              : "bg-red-50 text-red-600"
          }`}
        >
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <AddKeyForm
        onCreated={(text) => setMessage({ type: "success", text })}
        onError={(text) => setMessage({ type: "error", text })}
      />

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-4 py-3">ឈ្មោះ</th>
                <th className="px-4 py-3">កូនសោ</th>
                <th className="px-4 py-3">ស្ថានភាព</th>
                <th className="px-4 py-3">ប្រើចុងក្រោយ</th>
                <th className="px-4 py-3">កំហុសចុងក្រោយ</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                    កំពុងផ្ទុកទិន្នន័យ...
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-red-500">
                    {getApiErrorMessage(error)}
                  </td>
                </tr>
              )}

              {!isLoading && !error && keys.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                    មិនទាន់មានកូនសោ API ត្រូវបានបន្ថែមនៅឡើយទេ។
                  </td>
                </tr>
              )}

              {keys.map((aiKey) => (
                <KeyRow key={aiKey.uuid} aiKey={aiKey} onMessage={setMessage} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
