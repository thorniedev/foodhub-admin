"use client";

import { useMemo, useState } from "react";
import { useGetDrinksQuery } from "../../../store/drinkApi";
import { Drink, DrinkCategory } from "../../../../types/drink";
import DrinksHeader from "../../../../components/drinks/DrinksHeader";
import DrinksTabs from "../../../../components/drinks/DrinksTabs";
import DrinksTable from "../../../../components/drinks/DrinksTable";
import DrinksPagination from "../../../../components/drinks/DrinksPagination";

const PAGE_SIZE = 10;

export default function DrinksPage() {
  const { data, isLoading, isError } = useGetDrinksQuery();

  const [activeTab, setActiveTab] = useState<DrinkCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const allData: Drink[] = data ?? [];

  const filtered = useMemo(() => {
    return allData.filter((item) => {
      const matchesTab = activeTab === "all" || item.category === activeTab;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        item.name.toLowerCase().includes(query) ||
        item.shopName.toLowerCase().includes(query);
      return matchesTab && matchesSearch;
    });
  }, [allData, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleEdit = (item: Drink) => {
    console.log("edit", item.id);
  };

  const handleDelete = (item: Drink) => {
    console.log("delete", item.id);
  };

  const handleToggleStatus = (item: Drink) => {
    console.log("toggle status", item.id);
  };

  const handleAddNew = () => {
    console.log("add new drink type");
  };

  if (isLoading) {
    return <div className="p-6 text-gray-500">កំពុងផ្ទុកទិន្នន័យ...</div>;
  }

  if (isError) {
    return (
      <div className="p-6 text-red-500">
        មានបញ្ហាក្នុងការទាញយកទិន្នន័យ សូមព្យាយាមម្តងទៀត
      </div>
    );
  }

  return (
    <div className="p-6">
      <DrinksHeader
        total={allData.length}
        filteredCount={filtered.length}
        onAddNew={handleAddNew}
      />

      <DrinksTabs
        data={allData}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setPage(1);
        }}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />

      <DrinksTable
        data={paginated}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <DrinksPagination
        total={filtered.length}
        shown={paginated.length}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
