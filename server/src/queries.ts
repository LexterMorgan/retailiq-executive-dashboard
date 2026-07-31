import { pool } from "./db.js";

export interface DashboardFilters {
  year?: number;
  country?: string;
  category?: string;
}

function buildFilterClause(filters: DashboardFilters, alias: {
  sales?: string;
  product?: string;
  store?: string;
  date?: string;
}) {
  const s = alias.sales ?? "s";
  const p = alias.product ?? "p";
  const st = alias.store ?? "st";
  const d = alias.date ?? "d";

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.year) {
    params.push(filters.year);
    conditions.push(`${d}.year = $${params.length}`);
  }
  if (filters.country) {
    params.push(filters.country);
    conditions.push(`${st}.country = $${params.length}`);
  }
  if (filters.category) {
    params.push(filters.category);
    conditions.push(`${p}.category = $${params.length}`);
  }

  return {
    whereSql: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

const baseJoins = `
  FROM fact_sales s
  JOIN dim_product p ON s.product_key = p.product_key
  JOIN dim_date d ON s.order_date = d.date_key
  JOIN dim_store st ON s.store_key = st.store_key
`;

export async function getFilterOptions() {
  const [years, countries, categories] = await Promise.all([
    pool.query(`
      SELECT DISTINCT d.year
      FROM fact_sales s
      JOIN dim_date d ON s.order_date = d.date_key
      ORDER BY d.year
    `),
    pool.query(`
      SELECT DISTINCT st.country
      FROM fact_sales s
      JOIN dim_store st ON s.store_key = st.store_key
      ORDER BY st.country
    `),
    pool.query(`
      SELECT DISTINCT p.category
      FROM fact_sales s
      JOIN dim_product p ON s.product_key = p.product_key
      ORDER BY p.category
    `),
  ]);

  return {
    years: years.rows.map((r) => Number(r.year)),
    countries: countries.rows.map((r) => r.country as string),
    categories: categories.rows.map((r) => r.category as string),
  };
}

export async function getKpis(filters: DashboardFilters) {
  const { whereSql, params } = buildFilterClause(filters, {});
  const result = await pool.query(
    `
    SELECT
      ROUND(SUM(s.quantity * p.unit_price_usd), 2)::float AS total_revenue_usd,
      COUNT(DISTINCT s.order_number)::int AS total_orders,
      COUNT(DISTINCT s.customer_key)::int AS total_customers,
      ROUND(
        SUM(s.quantity * p.unit_price_usd) / NULLIF(COUNT(DISTINCT s.order_number), 0),
        2
      )::float AS avg_order_value_usd
    ${baseJoins}
    ${whereSql}
    `,
    params,
  );
  return result.rows[0];
}

export async function getKpiTrends(filters: DashboardFilters) {
  const current = await getKpis(filters);

  const priorFilters = { ...filters };
  if (filters.year) {
    priorFilters.year = filters.year - 1;
  }

  const prior = await getKpis(priorFilters);

  function pctChange(currentVal: number, priorVal: number) {
    if (!priorVal || priorVal === 0) return null;
    return Number((((currentVal - priorVal) / priorVal) * 100).toFixed(1));
  }

  return {
    revenueChangePct: pctChange(
      Number(current.total_revenue_usd),
      Number(prior?.total_revenue_usd ?? 0),
    ),
    ordersChangePct: pctChange(
      Number(current.total_orders),
      Number(prior?.total_orders ?? 0),
    ),
    customersChangePct: pctChange(
      Number(current.total_customers),
      Number(prior?.total_customers ?? 0),
    ),
    aovChangePct: pctChange(
      Number(current.avg_order_value_usd),
      Number(prior?.avg_order_value_usd ?? 0),
    ),
    comparisonLabel: filters.year
      ? `vs ${filters.year - 1}`
      : "vs prior year",
  };
}

export async function getMonthlyRevenue(filters: DashboardFilters) {
  const { whereSql, params } = buildFilterClause(filters, {});
  const result = await pool.query(
    `
    SELECT
      d.year::int AS year,
      d.month::int AS month,
      d.month_name,
      TO_CHAR(MAKE_DATE(d.year, d.month, 1), 'YYYY-MM') AS year_month,
      ROUND(SUM(s.quantity * p.unit_price_usd), 2)::float AS revenue_usd,
      COUNT(DISTINCT s.order_number)::int AS total_orders
    ${baseJoins}
    ${whereSql}
    GROUP BY d.year, d.month, d.month_name
    ORDER BY d.year, d.month
    `,
    params,
  );
  return result.rows;
}

export async function getRevenueByCountry(filters: DashboardFilters) {
  const { whereSql, params } = buildFilterClause(filters, {});
  const result = await pool.query(
    `
    SELECT
      st.country,
      COUNT(DISTINCT s.order_number)::int AS total_orders,
      SUM(s.quantity)::int AS units_sold,
      ROUND(SUM(s.quantity * p.unit_price_usd), 2)::float AS revenue_usd,
      ROUND(
        100.0 * SUM(s.quantity * p.unit_price_usd)
          / SUM(SUM(s.quantity * p.unit_price_usd)) OVER (),
        2
      )::float AS revenue_share_pct
    ${baseJoins}
    ${whereSql}
    GROUP BY st.country
    ORDER BY revenue_usd DESC
    `,
    params,
  );
  return result.rows;
}

export async function getTopProducts(filters: DashboardFilters) {
  const { whereSql, params } = buildFilterClause(filters, {});
  const result = await pool.query(
    `
    SELECT
      p.product_key::int,
      p.product_name,
      p.brand,
      p.category,
      SUM(s.quantity)::int AS units_sold,
      ROUND(SUM(s.quantity * p.unit_price_usd), 2)::float AS revenue_usd,
      ROUND(SUM(s.quantity * (p.unit_price_usd - p.unit_cost_usd)), 2)::float AS profit_usd
    ${baseJoins}
    ${whereSql}
    GROUP BY p.product_key, p.product_name, p.brand, p.category
    ORDER BY revenue_usd DESC
    LIMIT 10
    `,
    params,
  );
  return result.rows;
}

export async function getTopStores(filters: DashboardFilters) {
  const { whereSql, params } = buildFilterClause(filters, {});
  const result = await pool.query(
    `
    SELECT
      st.store_key::int,
      st.country AS store_country,
      st.state AS store_state,
      st.is_online,
      COUNT(DISTINCT s.order_number)::int AS total_orders,
      SUM(s.quantity)::int AS units_sold,
      ROUND(SUM(s.quantity * p.unit_price_usd), 2)::float AS revenue_usd,
      ROUND(SUM(s.quantity * (p.unit_price_usd - p.unit_cost_usd)), 2)::float AS profit_usd
    ${baseJoins}
    ${whereSql}
    GROUP BY st.store_key, st.country, st.state, st.is_online
    ORDER BY revenue_usd DESC
    LIMIT 10
    `,
    params,
  );
  return result.rows;
}

export async function getTopCustomers(filters: DashboardFilters) {
  const { whereSql, params } = buildFilterClause(filters, {});
  const result = await pool.query(
    `
    SELECT
      c.customer_key::int,
      c.name AS customer_name,
      c.country AS customer_country,
      c.continent,
      COUNT(DISTINCT s.order_number)::int AS total_orders,
      SUM(s.quantity)::int AS units_purchased,
      ROUND(SUM(s.quantity * p.unit_price_usd), 2)::float AS total_revenue_usd,
      ROUND(SUM(s.quantity * (p.unit_price_usd - p.unit_cost_usd)), 2)::float AS total_profit_usd
    FROM dim_customer c
    JOIN fact_sales s ON c.customer_key = s.customer_key
    JOIN dim_product p ON s.product_key = p.product_key
    JOIN dim_date d ON s.order_date = d.date_key
    JOIN dim_store st ON s.store_key = st.store_key
    ${whereSql}
    GROUP BY c.customer_key, c.name, c.country, c.continent
    ORDER BY total_revenue_usd DESC
    LIMIT 10
    `,
    params,
  );
  return result.rows;
}

export async function getCategoryPerformance(filters: DashboardFilters) {
  const { whereSql, params } = buildFilterClause(filters, {});
  const result = await pool.query(
    `
    SELECT
      p.category,
      COUNT(DISTINCT s.order_number)::int AS total_orders,
      SUM(s.quantity)::int AS units_sold,
      ROUND(SUM(s.quantity * p.unit_price_usd), 2)::float AS revenue_usd,
      ROUND(SUM(s.quantity * (p.unit_price_usd - p.unit_cost_usd)), 2)::float AS profit_usd,
      ROUND(
        100.0 * SUM(s.quantity * (p.unit_price_usd - p.unit_cost_usd))
          / NULLIF(SUM(s.quantity * p.unit_price_usd), 0),
        2
      )::float AS profit_margin_pct,
      ROUND(
        100.0 * SUM(s.quantity * p.unit_price_usd)
          / SUM(SUM(s.quantity * p.unit_price_usd)) OVER (),
        2
      )::float AS revenue_share_pct
    ${baseJoins}
    ${whereSql}
    GROUP BY p.category
    ORDER BY revenue_usd DESC
    `,
    params,
  );
  return result.rows;
}

export async function getBrandPerformance(filters: DashboardFilters) {
  const { whereSql, params } = buildFilterClause(filters, {});
  const result = await pool.query(
    `
    SELECT
      p.brand,
      COUNT(DISTINCT s.order_number)::int AS total_orders,
      SUM(s.quantity)::int AS units_sold,
      ROUND(SUM(s.quantity * p.unit_price_usd), 2)::float AS revenue_usd,
      ROUND(SUM(s.quantity * (p.unit_price_usd - p.unit_cost_usd)), 2)::float AS profit_usd,
      ROUND(
        100.0 * SUM(s.quantity * (p.unit_price_usd - p.unit_cost_usd))
          / NULLIF(SUM(s.quantity * p.unit_price_usd), 0),
        2
      )::float AS profit_margin_pct
    ${baseJoins}
    ${whereSql}
    GROUP BY p.brand
    ORDER BY revenue_usd DESC
    `,
    params,
  );
  return result.rows;
}
