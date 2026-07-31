/**
 * Export dashboard analytics snapshots from PostgreSQL to static JSON files.
 * Uses the same query layer as the Express API — no manual data duplication.
 *
 * Usage (from server/):
 *   npm run export:static
 *
 * Output:
 *   ../frontend/public/data/filters.json
 *   ../frontend/public/data/dashboard.json
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import {
  getBrandPerformance,
  getCategoryPerformance,
  getFilterOptions,
  getKpiTrends,
  getKpis,
  getMonthlyRevenue,
  getRevenueByCountry,
  getTopCustomers,
  getTopProducts,
  getTopStores,
  type DashboardFilters,
} from "../src/queries.js";
import { pool } from "../src/db.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../../frontend/public/data");

/** Build a cache key matching frontend URLSearchParams order (year, country, category). */
function filtersToKey(filters: DashboardFilters): string {
  const params = new URLSearchParams();
  if (filters.year) params.set("year", String(filters.year));
  if (filters.country) params.set("country", filters.country);
  if (filters.category) params.set("category", filters.category);
  return params.toString();
}

/** Generate every filter combination supported by the dashboard UI. */
function allFilterCombinations(options: {
  years: number[];
  countries: string[];
  categories: string[];
}): DashboardFilters[] {
  const years: (number | undefined)[] = [undefined, ...options.years];
  const countries: (string | undefined)[] = [undefined, ...options.countries];
  const categories: (string | undefined)[] = [undefined, ...options.categories];

  const combinations: DashboardFilters[] = [];

  for (const year of years) {
    for (const country of countries) {
      for (const category of categories) {
        combinations.push({
          ...(year !== undefined ? { year } : {}),
          ...(country !== undefined ? { country } : {}),
          ...(category !== undefined ? { category } : {}),
        });
      }
    }
  }

  return combinations;
}

/** Assemble a dashboard payload — mirrors GET /api/dashboard in index.ts. */
async function buildDashboardPayload(filters: DashboardFilters) {
  const [
    kpis,
    trends,
    monthlyRevenue,
    revenueByCountry,
    topProducts,
    topStores,
    topCustomers,
    categories,
    brands,
  ] = await Promise.all([
    getKpis(filters),
    getKpiTrends(filters),
    getMonthlyRevenue(filters),
    getRevenueByCountry(filters),
    getTopProducts(filters),
    getTopStores(filters),
    getTopCustomers(filters),
    getCategoryPerformance(filters),
    getBrandPerformance(filters),
  ]);

  return {
    refreshedAt: new Date().toISOString(),
    filters,
    kpis,
    trends,
    monthlyRevenue,
    revenueByCountry,
    topProducts,
    topStores,
    topCustomers,
    categories,
    brands,
  };
}

async function main() {
  console.log("Connecting to PostgreSQL...");
  await pool.query("SELECT 1");

  const filterOptions = await getFilterOptions();
  const combinations = allFilterCombinations(filterOptions);

  console.log(`Exporting ${combinations.length} filter snapshots...`);

  const snapshots: Record<string, Awaited<ReturnType<typeof buildDashboardPayload>>> = {};
  const exportedAt = new Date().toISOString();

  for (let i = 0; i < combinations.length; i++) {
    const filters = combinations[i];
    const key = filtersToKey(filters);
    snapshots[key] = await buildDashboardPayload(filters);

    if ((i + 1) % 50 === 0 || i === combinations.length - 1) {
      console.log(`  ${i + 1}/${combinations.length} snapshots exported`);
    }
  }

  await mkdir(OUTPUT_DIR, { recursive: true });

  const filtersPath = path.join(OUTPUT_DIR, "filters.json");
  const dashboardPath = path.join(OUTPUT_DIR, "dashboard.json");

  await writeFile(filtersPath, JSON.stringify(filterOptions, null, 2));
  await writeFile(
    dashboardPath,
    JSON.stringify({ exportedAt, snapshots }, null, 2),
  );

  console.log(`\nWrote ${filtersPath}`);
  console.log(`Wrote ${dashboardPath}`);
  console.log(`Exported at: ${exportedAt}`);

  await pool.end();
}

main().catch(async (error) => {
  console.error("Export failed:", error);
  await pool.end();
  process.exit(1);
});
