import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ColumnDef } from "@tanstack/react-table";

import DataTable from "./DataTable";

interface Row {
  id: string;
  name: string;
  views: number;
}

const columns: ColumnDef<Row, unknown>[] = [
  { id: "name", header: "ហាង", cell: ({ row }) => row.original.name },
  {
    id: "views",
    header: "ការមើល",
    meta: { align: "right" },
    cell: ({ row }) => row.original.views,
  },
];

const rows: Row[] = [
  { id: "a", name: "Hok Masterchef", views: 180 },
  { id: "b", name: "TUBE Coffee", views: 96 },
];

function renderTable(
  overrides: Partial<React.ComponentProps<typeof DataTable<Row>>> = {},
) {
  const onPageChange = vi.fn();
  const onSizeChange = vi.fn();

  render(
    <DataTable<Row>
      caption="តារាងសាកល្បង"
      columns={columns}
      data={rows}
      page={0}
      size={10}
      totalElements={rows.length}
      totalPages={1}
      onPageChange={onPageChange}
      onSizeChange={onSizeChange}
      getRowId={(row) => row.id}
      {...overrides}
    />,
  );

  return { onPageChange, onSizeChange };
}

describe("DataTable", () => {
  it("renders semantic table markup with the supplied rows", () => {
    renderTable();

    expect(screen.getByRole("table", { name: "តារាងសាកល្បង" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "ហាង" })).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(rows.length + 1);
    expect(screen.getByText("Hok Masterchef")).toBeInTheDocument();
  });

  it("shows the loading skeleton instead of the table", () => {
    renderTable({ isLoading: true });

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows an empty state when the server returns no rows", () => {
    renderTable({
      data: [],
      totalElements: 0,
      totalPages: 0,
      emptyTitle: "គ្មានហាងត្រូវនឹងតម្រងនេះ",
    });

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText("គ្មានហាងត្រូវនឹងតម្រងនេះ")).toBeInTheDocument();
  });

  it("shows an error state with a retry action and no fabricated rows", () => {
    const onRetry = vi.fn();
    renderTable({ error: { status: 403, data: {} }, onRetry });

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "ព្យាយាមម្ដងទៀត" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("drives server-side pagination through the callbacks", () => {
    const { onPageChange, onSizeChange } = renderTable({
      page: 1,
      totalElements: 34,
      totalPages: 4,
    });

    fireEvent.click(screen.getByRole("button", { name: "ទំព័របន្ទាប់" }));
    expect(onPageChange).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByRole("button", { name: "ទំព័រដំបូង" }));
    expect(onPageChange).toHaveBeenCalledWith(0);

    fireEvent.click(screen.getByRole("button", { name: "ទំព័រចុងក្រោយ" }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    fireEvent.change(screen.getByRole("combobox", { name: /ជួរក្នុងមួយទំព័រ/ }), {
      target: { value: "20" },
    });
    expect(onSizeChange).toHaveBeenCalledWith(20);
  });

  it("reports the server-side row window rather than the local row count", () => {
    renderTable({ page: 1, size: 10, totalElements: 34, totalPages: 4 });

    expect(screen.getByText(/11–12 ក្នុងចំណោម 34/)).toBeInTheDocument();
    expect(screen.getByText("2 / 4")).toBeInTheDocument();
  });

  it("disables the pagers at the edges of the result set", () => {
    renderTable({ page: 0, totalPages: 1 });

    expect(screen.getByRole("button", { name: "ទំព័រមុន" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "ទំព័របន្ទាប់" })).toBeDisabled();
  });

  it("reports a 404 as a missing report rather than a failed request", () => {
    renderTable({
      error: { status: 404, data: { message: "Resource has not been found" } },
      reportName: "សមិទ្ធកម្មហាង",
    });

    // The admin must be able to tell "this build has no such report" apart
    // from "the request broke", so it is a status, not an alert.
    const state = screen.getByRole("status");
    expect(state).toBeInTheDocument();
    expect(state).toHaveTextContent("សមិទ្ធកម្មហាង");
    expect(state).toHaveTextContent("404");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("still shows a real error state for non-404 failures", () => {
    renderTable({ error: { status: 500, data: { message: "boom" } } });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
