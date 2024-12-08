import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart2, Download } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { utils, writeFile } from 'xlsx';
import { useGetSalesQuery } from '../store/services/saleService';
import DateRangePicker from '../components/reports/DateRangePicker';
import SalesChart from '../components/reports/SalesChart';
import SalesMetricsCards from '../components/reports/SalesMetricCards';
import TopProductsTable from '../components/reports/TopProductTable';
import PaymentMethodChart from '../components/reports/PaymentMethodChart';
import { 
  calculateSalesMetrics, 
  generateDailySalesData,
  generateHourlyData 
} from '../utils/report';

const Reports = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { data: sales } = useGetSalesQuery(storeId!);
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 30), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const {
    currentPeriodSales,
    previousPeriodSales,
    currentMetrics,
    previousMetrics,
    dailyData,
    hourlyData,
    paymentMethodData
  } = useMemo(() => {
    if (!sales) return {
      currentPeriodSales: [],
      previousPeriodSales: [],
      currentMetrics: null,
      previousMetrics: null,
      dailyData: [],
      hourlyData: [],
      paymentMethodData: []
    };

    const currentStart = parseISO(startDate);
    const currentEnd = parseISO(endDate);
    const previousStart = subDays(currentStart, 30);
    const previousEnd = subDays(currentEnd, 30);

    const currentPeriodSales = sales.filter(sale => {
      const date = new Date(sale.createdAt);
      return date >= currentStart && date <= currentEnd;
    });

    const previousPeriodSales = sales.filter(sale => {
      const date = new Date(sale.createdAt);
      return date >= previousStart && date <= previousEnd;
    });

    const currentMetrics = calculateSalesMetrics(currentPeriodSales);
    const previousMetrics = calculateSalesMetrics(previousPeriodSales);
    const dailyData = generateDailySalesData(currentPeriodSales, currentStart, currentEnd);
    const hourlyData = generateHourlyData(currentPeriodSales);

    const paymentMethodData = Object.entries(currentMetrics.paymentMethodBreakdown)
      .map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: data.total
      }));

    return {
      currentPeriodSales,
      previousPeriodSales,
      currentMetrics,
      previousMetrics,
      dailyData,
      hourlyData,
      paymentMethodData
    };
  }, [sales, startDate, endDate]);

  const exportToExcel = () => {
    if (!currentPeriodSales) return;

    const data = currentPeriodSales.map(sale => ({
      'Date': format(new Date(sale.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      'Order ID': sale._id,
      'Total': sale.total,
      'Payment Method': sale.paymentMethod,
      'Items': sale.items
        .map(item => `${item.product?.name || 'Unknown'} (x${item.quantity})`)
        .join(', '),
      'Status': sale.status
    }));

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Sales Report');
    writeFile(wb, `sales-report-${startDate}-to-${endDate}.xlsx`);
  };

  if (!currentMetrics || !previousMetrics) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <BarChart2 className="h-6 w-6" />
          Advanced Reports
        </h1>
        <button
          onClick={exportToExcel}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover"
        >
          <Download className="h-4 w-4 mr-2" />
          Export to Excel
        </button>
      </div>

      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <SalesMetricsCards
        currentMetrics={currentMetrics}
        previousMetrics={previousMetrics}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Daily Sales Trend</h2>
          <SalesChart data={dailyData} />
        </div>

        <PaymentMethodChart data={paymentMethodData} />
      </div>

      <TopProductsTable products={currentMetrics.topProducts} />
    </div>
  );
};

export default Reports;