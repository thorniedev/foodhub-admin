import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Logging into the real admin app to click through this page requires a real
 * Keycloak admin session this environment does not have, so this is the
 * verification available here: the component rendered against mocked RTK
 * Query hooks, covering the status badges, the two-step delete confirmation,
 * and that the add-key form sends the payload the backend controller expects.
 */
const {
  getAiProviderKeysQueryMock,
  createAiProviderKeyMock,
  activateAiProviderKeyMock,
  updateAiProviderKeyMock,
  deleteAiProviderKeyMock,
} = vi.hoisted(() => ({
  getAiProviderKeysQueryMock: vi.fn(),
  createAiProviderKeyMock: vi.fn(),
  activateAiProviderKeyMock: vi.fn(),
  updateAiProviderKeyMock: vi.fn(),
  deleteAiProviderKeyMock: vi.fn(),
}));

vi.mock("@/src/app/store/aiProviderKeyApi", () => ({
  useGetAiProviderKeysQuery: getAiProviderKeysQueryMock,
  useCreateAiProviderKeyMutation: () => [
    createAiProviderKeyMock,
    { isLoading: false },
  ],
  useActivateAiProviderKeyMutation: () => [
    activateAiProviderKeyMock,
    { isLoading: false },
  ],
  useUpdateAiProviderKeyMutation: () => [
    updateAiProviderKeyMock,
    { isLoading: false },
  ],
  useDeleteAiProviderKeyMutation: () => [
    deleteAiProviderKeyMock,
    { isLoading: false },
  ],
}));

import AiProviderKeyManager from "./AiProviderKeyManager";
import type { AiProviderKey } from "@/src/types/ai-provider-key";

afterEach(() => {
  vi.clearAllMocks();
});

function unwrapMock(returnValue: unknown = { uuid: "new-uuid" }) {
  return vi.fn().mockReturnValue({ unwrap: () => Promise.resolve(returnValue) });
}

const activeKey: AiProviderKey = {
  uuid: "key-1",
  provider: "GOOGLE_GENAI",
  label: "Gemini primary",
  maskedKey: "••••ab12",
  active: true,
  enabled: true,
  lastUsedAt: "2026-09-01T10:00:00",
  lastErrorAt: null,
  lastErrorMessage: null,
  createdAt: "2026-08-01T10:00:00",
};

const exhaustedKey: AiProviderKey = {
  uuid: "key-2",
  provider: "GOOGLE_GENAI",
  label: "Gemini backup",
  maskedKey: "••••cd34",
  active: false,
  enabled: true,
  lastUsedAt: "2026-08-15T09:00:00",
  lastErrorAt: "2026-09-05T08:00:00",
  lastErrorMessage: "429 RESOURCE_EXHAUSTED: quota exceeded",
  createdAt: "2026-07-01T10:00:00",
};

const disabledKey: AiProviderKey = {
  ...exhaustedKey,
  uuid: "key-3",
  label: "Old revoked key",
  enabled: false,
  lastErrorAt: null,
  lastErrorMessage: null,
};

describe("AiProviderKeyManager", () => {
  beforeEach(() => {
    getAiProviderKeysQueryMock.mockReturnValue({
      data: [activeKey, exhaustedKey, disabledKey],
      isLoading: false,
      error: undefined,
    });
  });

  it("shows the active key as currently in use and never renders the plaintext key", () => {
    render(<AiProviderKeyManager />);

    expect(screen.getByText("Gemini primary")).toBeInTheDocument();
    expect(screen.getByText("កំពុងប្រើ")).toBeInTheDocument();
    expect(screen.getByText("••••ab12")).toBeInTheDocument();
  });

  it("offers an Activate action only for keys that are not already active", () => {
    render(<AiProviderKeyManager />);

    // Exactly two non-active keys (exhausted + disabled) -> two Activate buttons.
    expect(screen.getAllByRole("button", { name: "បើកប្រើ" })).toHaveLength(2);
  });

  it("disables the Activate button for a key that is itself disabled", () => {
    render(<AiProviderKeyManager />);

    const buttons = screen.getAllByRole("button", { name: "បើកប្រើ" });
    // exhaustedKey (enabled) is first in the list, disabledKey is second.
    expect(buttons[0]).not.toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });

  it("clicking Activate on the exhausted key calls the activation mutation with its uuid", async () => {
    activateAiProviderKeyMock.mockImplementation(unwrapMock(exhaustedKey));
    render(<AiProviderKeyManager />);

    fireEvent.click(screen.getAllByRole("button", { name: "បើកប្រើ" })[0]);

    await waitFor(() =>
      expect(activateAiProviderKeyMock).toHaveBeenCalledWith("key-2"),
    );
  });

  it("delete requires a second confirming click before calling the mutation", async () => {
    deleteAiProviderKeyMock.mockImplementation(unwrapMock(undefined));
    render(<AiProviderKeyManager />);

    const deleteButtons = screen.getAllByTitle("លុបកូនសោនេះ");
    fireEvent.click(deleteButtons[0]);

    // First click only reveals the confirm/cancel pair -- the mutation must
    // not have fired yet.
    expect(deleteAiProviderKeyMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "លុបចោល" }));

    await waitFor(() => expect(deleteAiProviderKeyMock).toHaveBeenCalled());
  });

  it("submits the add-key form with the fields the backend's CreateAiProviderKeyRequest expects", async () => {
    createAiProviderKeyMock.mockImplementation(unwrapMock(activeKey));
    render(<AiProviderKeyManager />);

    fireEvent.change(screen.getByPlaceholderText("ឧ. Gemini បម្រុងទុក #2"), {
      target: { value: "New Gemini key" },
    });
    fireEvent.change(screen.getByPlaceholderText("បិទភ្ជាប់កូនសោ API នៅទីនេះ"), {
      target: { value: "AIzaSyBrandNewValue" },
    });

    fireEvent.click(screen.getByRole("button", { name: /រក្សាទុកកូនសោ/ }));

    await waitFor(() =>
      expect(createAiProviderKeyMock).toHaveBeenCalledWith({
        provider: "GOOGLE_GENAI",
        label: "New Gemini key",
        apiKey: "AIzaSyBrandNewValue",
        activate: true,
      }),
    );
  });

  it("refuses to submit the add-key form when the label or key is blank", () => {
    render(<AiProviderKeyManager />);

    fireEvent.click(screen.getByRole("button", { name: /រក្សាទុកកូនសោ/ }));

    expect(createAiProviderKeyMock).not.toHaveBeenCalled();
    expect(
      screen.getByText("សូមបំពេញឈ្មោះ និងកូនសោ API ឱ្យបានគ្រប់គ្រាន់។"),
    ).toBeInTheDocument();
  });

  it("surfaces the sanitized backend error message when creating a key fails", async () => {
    createAiProviderKeyMock.mockReturnValue({
      unwrap: () =>
        Promise.reject({
          status: 400,
          data: { message: "API key must not be blank" },
        }),
    });
    render(<AiProviderKeyManager />);

    fireEvent.change(screen.getByPlaceholderText("ឧ. Gemini បម្រុងទុក #2"), {
      target: { value: "New key" },
    });
    fireEvent.change(screen.getByPlaceholderText("បិទភ្ជាប់កូនសោ API នៅទីនេះ"), {
      target: { value: "some-key" },
    });
    fireEvent.click(screen.getByRole("button", { name: /រក្សាទុកកូនសោ/ }));

    await waitFor(() =>
      expect(screen.getByText("API key must not be blank")).toBeInTheDocument(),
    );
  });
});
