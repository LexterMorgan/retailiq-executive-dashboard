export interface DashboardFilters {
  year?: number;
  country?: string;
  category?: string;
}

export interface Kpis {
  total_revenue_usd: number;
  total_orders: number;
  total_customers: number;
  avg_order_value_usd: number;
}

export interface KpiTrends {
  revenueChangePct: number | null;
  ordersChangePct: number | null;
  customersChangePct: number | null;
  aovChangePct: number | null;
  comparisonLabel: string;
}

export interface MonthlyRevenue {
  year: number;
  month: number;
  month_name: string;
  year_month: string;
  revenue_usd: number;
  total_orders: number;
}

export interface CountryRevenue {
  country: string;
  total_orders: number;
  units_sold: number;
  revenue_usd: number;
  revenue_share_pct: number;
}

export interface ProductRank {
  product_key: number;
  product_name: string;
  brand: string;
  category: string;
  units_sold: number;
  revenue_usd: number;
  profit_usd: number;
}

export interface StoreRank {
  store_key: number;
  store_country: string;
  store_state: string;
  is_online: boolean;
  total_orders: number;
  units_sold: number;
  revenue_usd: number;
  profit_usd: number;
}

export interface CustomerRank {
  customer_key: number;
  customer_name: string;
  customer_country: string;
  continent: string;
  total_orders: number;
  units_purchased: number;
  total_revenue_usd: number;
  total_profit_usd: number;
}

export interface CategoryRank {
  category: string;
  total_orders: number;
  units_sold: number;
  revenue_usd: number;
  profit_usd: number;
  profit_margin_pct: number;
  revenue_share_pct: number;
}

export interface BrandRank {
  brand: string;
  total_orders: number;
  units_sold: number;
  revenue_usd: number;
  profit_usd: number;
  profit_margin_pct: number;
}

export interface FilterOptions {
  years: number[];
  countries: string[];
  categories: string[];
}

export interface DashboardData {
  refreshedAt: string;
  filters: DashboardFilters;
  kpis: Kpis;
  trends: KpiTrends;
  monthlyRevenue: MonthlyRevenue[];
  revenueByCountry: CountryRevenue[];
  topProducts: ProductRank[];
  topStores: StoreRank[];
  topCustomers: CustomerRank[];
  categories: CategoryRank[];
  brands: BrandRank[];
}

export interface ExecutiveInsight {
  title: string;
  summary: string;
}
