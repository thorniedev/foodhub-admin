import fs from "fs/promises";
import path from "path";
import { DashboardData } from "../types/dashboard";

export async function getDashboardData(): Promise<DashboardData> {
  const filePath = path.join(process.cwd(), "public", "data", "dashboardData.json");
  const file = await fs.readFile(filePath, "utf-8");
  return JSON.parse(file) as DashboardData;
}