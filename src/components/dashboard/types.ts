import { LucideIcon } from 'lucide-react';

export interface DashboardMetric {
  title: string;
  value: string | number;
  icon: LucideIcon;
  link?: string;
  color: string;
}

export interface StoreMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
}