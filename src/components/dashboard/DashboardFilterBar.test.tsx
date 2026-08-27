import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DashboardFilterBar from "./DashboardFilterBar";
import { DEFAULT_DASHBOARD_FILTERS } from "@/src/lib/dashboardFilters";

function renderBar(
  overrides: Partial<React.ComponentProps<typeof DashboardFilterBar>> = {},
) {
  const onApply = vi.fn();
  const onReset = vi.fn();

  render(
    <DashboardFilterBar
      filters={DEFAULT_DASHBOARD_FILTERS}
      onApply={onApply}
      onReset={onReset}
      categoryOptions={[{ value: "SOUP", label: "ស៊ុប" }]}
      {...overrides}
    />,
  );

  return { onApply, onReset };
}

describe("DashboardFilterBar", () => {
  it("does not fire a request while the draft is being edited", () => {
    const { onApply } = renderBar();

    fireEvent.change(screen.getByPlaceholderText(/Daun Penh/), {
      target: { value: "Phnom Penh" },
    });

    expect(onApply).not.toHaveBeenCalled();
  });

  it("applies the draft filters only when the apply button is pressed", async () => {
    const { onApply } = renderBar();

    fireEvent.change(screen.getByPlaceholderText(/Daun Penh/), {
      target: { value: "Phnom Penh" },
    });
    fireEvent.click(screen.getByRole("button", { name: /អនុវត្តតម្រង/ }));

    await waitFor(() => expect(onApply).toHaveBeenCalledTimes(1));
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ preset: "30d", city: "Phnom Penh" }),
    );
  });

  it("applies a date preset immediately when it is clicked", async () => {
    const { onApply } = renderBar();

    fireEvent.click(screen.getByRole("button", { name: "៧ ថ្ងៃ" }));

    await waitFor(() => expect(onApply).toHaveBeenCalledTimes(1));
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ preset: "7d" }),
    );
  });

  it("reveals the date inputs for the custom preset without applying", async () => {
    const { onApply } = renderBar();

    fireEvent.click(screen.getByRole("button", { name: "ជ្រើសកាលបរិច្ឆេទ" }));

    expect(await screen.findByLabelText(/កាលបរិច្ឆេទចាប់ផ្ដើម/)).toBeInTheDocument();
    expect(screen.getByLabelText(/កាលបរិច្ឆេទបញ្ចប់/)).toBeInTheDocument();
    expect(onApply).not.toHaveBeenCalled();
  });

  it("blocks a latitude without a longitude and shows the reason", async () => {
    const { onApply } = renderBar();

    // Expand advanced geo panel
    fireEvent.click(screen.getByRole("button", { name: /បង្ហាញតម្រងកាំភូមិសាស្ត្រ/ }));

    fireEvent.change(screen.getByPlaceholderText("11.5564"), {
      target: { value: "11.5564" },
    });
    fireEvent.click(screen.getByRole("button", { name: /អនុវត្តតម្រង/ }));

    expect(
      await screen.findByText("ត្រូវបំពេញរយៈទទឹង និងរយៈបណ្ដោយជាមួយគ្នា"),
    ).toBeInTheDocument();
    expect(onApply).not.toHaveBeenCalled();
  });

  it("rejects a radius above the 50 km cap before any request is made", async () => {
    const { onApply } = renderBar();

    // Expand advanced geo panel
    fireEvent.click(screen.getByRole("button", { name: /បង្ហាញតម្រងកាំភូមិសាស្ត្រ/ }));

    fireEvent.change(screen.getByPlaceholderText("11.5564"), {
      target: { value: "11.5564" },
    });
    fireEvent.change(screen.getByPlaceholderText("104.9282"), {
      target: { value: "104.9282" },
    });
    const radiusInput = screen.getByPlaceholderText("5");
    fireEvent.change(radiusInput, { target: { value: "80" } });
    fireEvent.click(screen.getByRole("button", { name: /អនុវត្តតម្រង/ }));

    expect(
      await screen.findByText(/កាំត្រូវធំជាង 0 និងមិនលើស 50/),
    ).toBeInTheDocument();
    expect(onApply).not.toHaveBeenCalled();
  });

  it("clears the draft and notifies the parent on reset", async () => {
    const { onReset } = renderBar({
      filters: { preset: "90d", city: "Phnom Penh", categoryCode: "SOUP" },
    });

    const city = screen.getByPlaceholderText(/Daun Penh/) as HTMLInputElement;
    expect(city.value).toBe("Phnom Penh");

    fireEvent.click(screen.getByRole("button", { name: /កំណត់ឡើងវិញ/ }));

    expect(onReset).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(city.value).toBe(""));
  });

  it("allows selecting a popular geo hub preset", async () => {
    renderBar();

    // Expand advanced geo panel
    fireEvent.click(screen.getByRole("button", { name: /បង្ហាញតម្រងកាំភូមិសាស្ត្រ/ }));

    const bkkBtn = screen.getByRole("button", { name: /បឹងកេងកង ១/ });
    expect(bkkBtn).toBeInTheDocument();
    fireEvent.click(bkkBtn);

    const latInput = screen.getByPlaceholderText("11.5564") as HTMLInputElement;
    const lngInput = screen.getByPlaceholderText("104.9282") as HTMLInputElement;

    expect(latInput.value).toBe("11.5529");
    expect(lngInput.value).toBe("104.9256");
  });
});
