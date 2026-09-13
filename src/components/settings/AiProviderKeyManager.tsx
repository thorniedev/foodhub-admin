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

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";

import { getApiErrorMessage, type ApiMessage } from "@/src/types/safetyResource";

import SettingsMessageBanner from "./SettingsMessageBanner";

import type { AiProvider, AiProviderKey } from "@/src/types/ai-provider-key";

/* =========================================================
   CONSTANTS
========================================================= */

const PROVIDER_LABELS: Record<AiProvider, string> = {
  GOOGLE_GENAI: "Google Gemini",
  OPENAI: "OpenAI",
};

const PROVIDERS: AiProvider[] = ["GOOGLE_GENAI", "OPENAI"];

const selectClassName =
  "h-9 w-full cursor-pointer rounded-lg border bg-background px-3 text-xs text-foreground outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-ring/25";

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
    <form onSubmit={handleSubmit} className="grid gap-4 border-b p-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <h3 className="flex items-center gap-2 text-[0.8125rem] font-semibold text-foreground">
          <Plus size={15} aria-hidden="true" className="text-primary" />
          បន្ថែមកូនសោ API ថ្មី
        </h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          នៅពេលកូនសោបច្ចុប្បន្នអស់សិទ្ធិប្រើប្រាស់ (quota) សូមបន្ថែមកូនសោថ្មីនៅទីនេះ ហើយប្រព័ន្ធនឹងប្តូរទៅប្រើវាភ្លាមៗ
          ដោយមិនចាំបាច់ដាក់ឱ្យដំណើរការឡើងវិញទេ។
        </p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-[0.6875rem] font-medium text-muted-foreground">ក្រុមហ៊ុន AI</span>
        <select
          value={provider}
          onChange={(event) => setProvider(event.target.value as AiProvider)}
          className={selectClassName}
        >
          {PROVIDERS.map((value) => (
            <option key={value} value={value}>
              {PROVIDER_LABELS[value]}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1.5">
        <span className="text-[0.6875rem] font-medium text-muted-foreground">ឈ្មោះកូនសោ</span>
        <Input
          type="text"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="ឧ. Gemini បម្រុងទុក #2"
        />
      </label>

      <label className="block space-y-1.5 sm:col-span-2">
        <span className="text-[0.6875rem] font-medium text-muted-foreground">កូនសោ API</span>
        <Input
          type="password"
          autoComplete="off"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="បិទភ្ជាប់កូនសោ API នៅទីនេះ"
          className="font-mono"
        />
      </label>

      <label className="flex items-center gap-2 text-xs text-muted-foreground sm:col-span-2">
        <input
          type="checkbox"
          checked={activateNow}
          onChange={(event) => setActivateNow(event.target.checked)}
          className="size-3.5 rounded border-input accent-primary"
        />
        បើកប្រើកូនសោនេះភ្លាមៗ (ជំនួសកូនសោបច្ចុប្បន្នរបស់ {PROVIDER_LABELS[provider]})
      </label>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={isLoading}>
          <KeyRound size={14} aria-hidden="true" />
          {isLoading ? "កំពុងរក្សាទុក..." : "រក្សាទុកកូនសោ"}
        </Button>
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
  const [activateKey, { isLoading: isActivating }] = useActivateAiProviderKeyMutation();
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
      await updateKey({ uuid: aiKey.uuid, body: { enabled: !aiKey.enabled } }).unwrap();
      onMessage({
        type: "success",
        text: aiKey.enabled ? `បានបិទកូនសោ "${aiKey.label}"` : `បានបើកកូនសោ "${aiKey.label}"`,
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
    <tr className="border-b last:border-0 hover:bg-muted/40">
      <td className="px-4 py-3">
        <div className="font-medium text-foreground">{aiKey.label}</div>
        <div className="text-[0.6875rem] text-muted-foreground">
          {PROVIDER_LABELS[aiKey.provider]}
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{aiKey.maskedKey}</td>
      <td className="px-4 py-3">
        {aiKey.active ? (
          <Badge tone="green">
            <Check size={11} aria-hidden="true" /> កំពុងប្រើ
          </Badge>
        ) : aiKey.enabled ? (
          <Badge tone="neutral">ត្រៀមរួចរាល់</Badge>
        ) : (
          <Badge tone="neutral" className="opacity-70">
            បានបិទ
          </Badge>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
        {formatDateTime(aiKey.lastUsedAt)}
      </td>
      <td className="px-4 py-3 text-xs">
        {aiKey.lastErrorAt ? (
          <span
            className="inline-flex items-center gap-1 text-red-600 dark:text-red-400"
            title={aiKey.lastErrorMessage ?? undefined}
          >
            <AlertTriangle size={13} aria-hidden="true" />
            <span className="tabular-nums">{formatDateTime(aiKey.lastErrorAt)}</span>
          </span>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1.5">
          {!aiKey.active && (
            <Button
              type="button"
              variant="subtle"
              size="sm"
              disabled={busy || !aiKey.enabled}
              onClick={handleActivate}
              title={aiKey.enabled ? "បើកប្រើកូនសោនេះ" : "សូមបើកកូនសោសិន"}
            >
              បើកប្រើ
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={busy}
            onClick={handleToggleEnabled}
            title={aiKey.enabled ? "បិទកូនសោនេះ" : "បើកកូនសោនេះ"}
            aria-label={aiKey.enabled ? `បិទកូនសោ ${aiKey.label}` : `បើកកូនសោ ${aiKey.label}`}
          >
            <Power size={13} aria-hidden="true" />
          </Button>

          {confirmingDelete ? (
            <div className="flex items-center gap-1">
              <Button type="button" variant="destructive" size="sm" disabled={busy} onClick={handleDelete}>
                លុបចោល
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setConfirmingDelete(false)}
                aria-label="បោះបង់ការលុប"
              >
                <X size={13} aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={busy}
              onClick={() => setConfirmingDelete(true)}
              title="លុបកូនសោនេះ"
              aria-label={`លុបកូនសោ ${aiKey.label}`}
              className="hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-900 dark:hover:bg-red-950/40"
            >
              <Trash2 size={13} aria-hidden="true" />
            </Button>
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
    <Card className="gap-0 overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-400"
          >
            <KeyRound size={17} />
          </span>
          <div>
            <CardTitle>កូនសោ API របស់ AI</CardTitle>
            <CardDescription className="mt-0.5">
              គ្រប់គ្រងកូនសោ API សម្រាប់ការណែនាំដោយ AI។ កូនសោដែល &quot;កំពុងប្រើ&quot; ត្រូវបានប្រើភ្លាមៗ
              ដោយមិនចាំបាច់ដាក់ម៉ាស៊ីនមេឱ្យដំណើរការឡើងវិញឡើយ។
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {message && (
        <div className="border-b p-4">
          <SettingsMessageBanner message={message} onDismiss={() => setMessage(null)} />
        </div>
      )}

      <AddKeyForm
        onCreated={(text) => setMessage({ type: "success", text })}
        onError={(text) => setMessage({ type: "error", text })}
      />

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="border-b bg-muted/60">
              <tr>
                <th className="px-4 py-2.5 text-[0.6875rem] font-semibold tracking-wide text-muted-foreground">
                  ឈ្មោះ
                </th>
                <th className="px-4 py-2.5 text-[0.6875rem] font-semibold tracking-wide text-muted-foreground">
                  កូនសោ
                </th>
                <th className="px-4 py-2.5 text-[0.6875rem] font-semibold tracking-wide text-muted-foreground">
                  ស្ថានភាព
                </th>
                <th className="px-4 py-2.5 text-[0.6875rem] font-semibold tracking-wide text-muted-foreground">
                  ប្រើចុងក្រោយ
                </th>
                <th className="px-4 py-2.5 text-[0.6875rem] font-semibold tracking-wide text-muted-foreground">
                  កំហុសចុងក្រោយ
                </th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    កំពុងផ្ទុកទិន្នន័យ...
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-red-600 dark:text-red-400">
                    {getApiErrorMessage(error)}
                  </td>
                </tr>
              )}

              {!isLoading && !error && keys.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">
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
      </CardContent>
    </Card>
  );
}
