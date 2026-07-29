"use client";

import { useMemo, useState } from "react";
// import { useGetShopsQuery } from "../../../store/shopApi";
import ShopsHeader from "../../../components/shops/ShopsHeader";
import ShopsTabs, { ShopFilter } from "../../../components/shops/ShopsTabs";
import ShopsTable from "../../../components/shops/ShopsTable";
import ShopsPagination from "../../../components/shops/ShopsPagination";
import { useGetShopsQuery } from "../../store/shopApi";

export default function ShopsPage() {
  const { data, isLoading } = useGetShopsQuery();
  const [filter, setFilter] = useState<ShopFilter>("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const base = { all: 0, active: 0, stopped: 0, banned: 0 };
    data?.forEach((shop) => {
      base.all += 1;
      base[shop.status] += 1;
    });
    return base;
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data
      .filter((shop) => filter === "all" || shop.status === filter)
      .filter(
        (shop) => shop.name.includes(search) || shop.phone.includes(search)
      );
  }, [data, filter, search]);

  if (isLoading || !data) return null;

  return (
    <div>
      <ShopsHeader total={counts.all} />
      <ShopsTabs
        counts={counts}
        active={filter}
        onChange={setFilter}
        search={search}
        onSearchChange={setSearch}
      />
      <ShopsTable shops={filtered} />
      <ShopsPagination total={counts.all} shown={filtered.length} />
    </div>
  );
}