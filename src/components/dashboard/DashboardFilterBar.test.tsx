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

    fireEvent.change(screen.getByLabelText("ក្រុង"), {
      target: { value: "Phnom Penh" },
    });

    expect(onApply).not.toHaveBeenCalled();
  });

  it("applies the draft filters only when the apply button is pressed", async () => {
    const { onApply } = renderBar();

    fireEvent.change(screen.getByLabelText("ក្រុង"), {
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

    fireEvent.click(screen.getByRole("button", { name: "ជ្រើសឯង" }));

    expect(await screen.findByLabelText("ពីថ្ងៃ")).toBeInTheDocument();
    expect(screen.getByLabelText("ដល់ថ្ងៃ")).toBeInTheDocument();
    expect(onApply).not.toHaveBeenCalled();
  });

  it("blocks a latitude without a longitude and shows the reason", async () => {
    const { onApply } = renderBar();

    fireEvent.change(screen.getByLabelText(/រយៈទទឹង/), {
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

    fireEvent.change(screen.getByLabelText(/រយៈទទឹង/), {
      target: { value: "11.5564" },
    });
    fireEvent.change(screen.getByLabelText(/រយៈបណ្ដោយ/), {
      target: { value: "104.9282" },
    });
    fireEvent.change(screen.getByLabelText(/កាំ/), { target: { value: "80" } });
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

    const city = screen.getByLabelText("ក្រុង") as HTMLInputElement;
    expect(city.value).toBe("Phnom Penh");

    fireEvent.click(screen.getByRole("button", { name: /កំណត់ឡើងវិញ/ }));

    expect(onReset).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(city.value).toBe(""));
  });
});
