import cors from "cors";
import express from "express";
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
} from "./queries.js";
import { pool } from "./db.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json());

function parseFilters(query: express.Request["query"]): DashboardFilters {
  return {
    year: query.year ? Number(query.year) : undefined,
    country: query.country ? String(query.country) : undefined,
    category: query.category ? String(query.category) : undefined,
  };
}

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", source: "PostgreSQL" });
  } catch {
    res.status(503).json({ status: "error", message: "Database unavailable" });
  }
});

app.get("/api/filters", async (_req, res) => {
  try {
    res.json(await getFilterOptions());
  } catch (error) {
    res.status(500).json({ message: "Failed to load filter options", error: String(error) });
  }
});

app.get("/api/dashboard", async (req, res) => {
  const filters = parseFilters(req.query);

  try {
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

    res.json({
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
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load dashboard data", error: String(error) });
  }
});

app.listen(PORT, () => {
  console.log(`RetailIQ API listening on http://localhost:${PORT}`);
});
