import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Logging into the real admin app to click through this page requires a real
 * Keycloak admin session this environment does not have, so this is the
 * verification available here: the component rendered against mocked RTK
 * Query hooks, covering category grouping, the overridden badge/reset
 * affordance, the save/reset payloads sent to the backend, and error surfacing.
 *
 * AiProviderKeyManager now renders inline as part of this page (see
 * AiProviderKeyManager.test.tsx for its own dedicated coverage), so its API
 * hooks are mocked here too -- otherwise the real RTK Query hooks would run
 * with no Redux Provider in this test tree.
 */
const {
  getSystemSettingsQueryMock,
  updateSystemSettingMock,
  resetSystemSettingMock,
  getAiProviderKeysQueryMock,
} = vi.hoisted(() => ({
  getSystemSettingsQueryMock: vi.fn(),
  updateSystemSettingMock: vi.fn(),
  resetSystemSettingMock: vi.fn(),
  getAiProviderKeysQueryMock: vi.fn(),
}));

vi.mock("@/src/app/store/systemSettingApi", () => ({
  useGetSystemSettingsQuery: getSystemSettingsQueryMock,
  useUpdateSystemSettingMutation: () => [
    updateSystemSettingMock,
    { isLoading: false },
  ],
  useResetSystemSettingMutation: () => [
    resetSystemSettingMock,
    { isLoading: false },
  ],
}));

vi.mock("@/src/app/store/aiProviderKeyApi", () => ({
  useGetAiProviderKeysQuery: getAiProviderKeysQueryMock,
  useCreateAiProviderKeyMutation: () => [vi.fn(), { isLoading: false }],
  useActivateAiProviderKeyMutation: () => [vi.fn(), { isLoading: false }],
  useUpdateAiProviderKeyMutation: () => [vi.fn(), { isLoading: false }],
  useDeleteAiProviderKeyMutation: () => [vi.fn(), { isLoading: false }],
}));

import SystemSettingsManager from "./SystemSettingsManager";
import type { SystemSetting } from "@/src/types/system-setting";

afterEach(() => {
  vi.clearAllMocks();
});

function unwrapMock(returnValue: unknown) {
  return vi.fn().mockReturnValue({ unwrap: () => Promise.resolve(returnValue) });
}

const radiusSetting: SystemSetting = {
  key: "NEARBY_ALERT_MAX_RADIUS_METERS",
  category: "NEARBY_ALERTS",
  valueType: "INTEGER",
  value: "50000",
  defaultValue: "50000",
  minValue: "1000",
  maxValue: "50000",
  overridden: false,
  description: "Hard ceiling on the nearby-store search radius, in meters.",
  updatedAt: null,
};

const dailyLimitSetting: SystemSetting = {
  key: "NEARBY_ALERT_DAILY_LIMIT",
  category: "NEARBY_ALERTS",
  valueType: "INTEGER",
  value: "5",
  defaultValue: "2",
  minValue: "1",
  maxValue: "20",
  overridden: true,
  description: "Maximum nearby-store alerts sent to one user per calendar day.",
  updatedAt: "2026-09-01T10:00:00",
};

const webPushSetting: SystemSetting = {
  key: "NOTIFICATIONS_WEB_PUSH_ENABLED",
  category: "NOTIFICATIONS",
  valueType: "BOOLEAN",
  value: "true",
  defaultValue: "true",
  minValue: null,
  maxValue: null,
  overridden: false,
  description: "System-wide switch for Web Push delivery.",
  updatedAt: null,
};

const regionCodeSetting: SystemSetting = {
  key: "STORE_IMPORT_REGION_CODE",
  category: "STORE_IMPORT",
  valueType: "STRING",
  value: "KH",
  defaultValue: "KH",
  minValue: null,
  maxValue: null,
  overridden: false,
  description: "ISO 3166-1 alpha-2 region code sent to Google Places search.",
  updatedAt: null,
};

describe("SystemSettingsManager", () => {
  beforeEach(() => {
    getSystemSettingsQueryMock.mockReturnValue({
      data: [radiusSetting, dailyLimitSetting, webPushSetting, regionCodeSetting],
      isLoading: false,
      error: undefined,
    });
    getAiProviderKeysQueryMock.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    });
  });

  it("groups settings under their category headers", () => {
    render(<SystemSettingsManager />);

    expect(screen.getByText("ការជូនដំណឹងហាងនៅជិត")).toBeInTheDocument();
    expect(screen.getByText("ការជូនដំណឹង")).toBeInTheDocument();
    expect(screen.getByText("Max Alert Radius (meters)")).toBeInTheDocument();
    expect(screen.getByText("Daily Alert Limit (per user)")).toBeInTheDocument();
    expect(screen.getByText("Web Push Enabled")).toBeInTheDocument();
  });

  it("includes the AI provider key manager as a section of this page", () => {
    render(<SystemSettingsManager />);

    expect(screen.getByText("កូនសោ API របស់ AI")).toBeInTheDocument();
    expect(getAiProviderKeysQueryMock).toHaveBeenCalled();
  });

  it("shows the overridden badge and reset action only for a changed setting", () => {
    render(<SystemSettingsManager />);

    expect(screen.getAllByText("កំពុងប្តូរពីលំនាំដើម")).toHaveLength(1);
    // Only dailyLimitSetting is overridden, so exactly one reset button.
    expect(screen.getAllByTitle("ត្រឡប់ទៅលំនាំដើម")).toHaveLength(1);
  });

  it("keeps Save disabled until the value actually changes", () => {
    render(<SystemSettingsManager />);

    const saveButtons = screen.getAllByRole("button", { name: /^រក្សាទុក$/ });
    saveButtons.forEach((button) => expect(button).toBeDisabled());
  });

  it("editing a numeric field and saving sends the key and new value", async () => {
    updateSystemSettingMock.mockImplementation(unwrapMock(radiusSetting));
    render(<SystemSettingsManager />);

    const radiusInput = screen.getByDisplayValue("50000");
    fireEvent.change(radiusInput, { target: { value: "40000" } });

    const saveButtons = screen.getAllByRole("button", { name: /^រក្សាទុក$/ });
    fireEvent.click(saveButtons[0]);

    await waitFor(() =>
      expect(updateSystemSettingMock).toHaveBeenCalledWith({
        key: "NEARBY_ALERT_MAX_RADIUS_METERS",
        body: { value: "40000" },
      }),
    );
  });

  it("toggling the boolean control saves the string \"false\"", async () => {
    updateSystemSettingMock.mockImplementation(unwrapMock(webPushSetting));
    render(<SystemSettingsManager />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Web Push Enabled" }));

    const saveButtons = screen.getAllByRole("button", { name: /^រក្សាទុក$/ });
    fireEvent.click(saveButtons[saveButtons.length - 1]);

    await waitFor(() =>
      expect(updateSystemSettingMock).toHaveBeenCalledWith({
        key: "NOTIFICATIONS_WEB_PUSH_ENABLED",
        body: { value: "false" },
      }),
    );
  });

  it("renders a STRING setting as a text input and saves the typed value", async () => {
    updateSystemSettingMock.mockImplementation(unwrapMock(regionCodeSetting));
    render(<SystemSettingsManager />);

    const regionInput = screen.getByDisplayValue("KH") as HTMLInputElement;
    expect(regionInput.type).toBe("text");

    fireEvent.change(regionInput, { target: { value: "TH" } });
    fireEvent.click(
      screen.getAllByRole("button", { name: /^រក្សាទុក$/ })[2],
    );

    await waitFor(() =>
      expect(updateSystemSettingMock).toHaveBeenCalledWith({
        key: "STORE_IMPORT_REGION_CODE",
        body: { value: "TH" },
      }),
    );
  });

  it("clicking reset calls the reset mutation with the setting's key", async () => {
    resetSystemSettingMock.mockImplementation(unwrapMock(radiusSetting));
    render(<SystemSettingsManager />);

    fireEvent.click(screen.getByTitle("ត្រឡប់ទៅលំនាំដើម"));

    await waitFor(() =>
      expect(resetSystemSettingMock).toHaveBeenCalledWith("NEARBY_ALERT_DAILY_LIMIT"),
    );
  });

  it("surfaces the backend error message when saving fails", async () => {
    updateSystemSettingMock.mockReturnValue({
      unwrap: () =>
        Promise.reject({
          status: 400,
          data: { message: "Value must be at least 1000" },
        }),
    });
    render(<SystemSettingsManager />);

    const radiusInput = screen.getByDisplayValue("50000");
    fireEvent.change(radiusInput, { target: { value: "1" } });
    fireEvent.click(screen.getAllByRole("button", { name: /^រក្សាទុក$/ })[0]);

    await waitFor(() =>
      expect(screen.getByText("Value must be at least 1000")).toBeInTheDocument(),
    );
  });
});
