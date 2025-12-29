import { TrendingUp, TrendingDown, DollarSign, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { useSalesStore } from '../../stores/salesStore';
import { StatCard } from './StatCard';
import { formatCurrency } from '../../lib/utils';

export function Dashboard() {
  const getDashboardStats = useSalesStore((state) => state.getDashboardStats);
  const stats = getDashboardStats();

  // Navigation helpers (assume setView is available via window or context)
  function handleAddSale() {
    if (window.setView) window.setView('add-sale');
  }
  function handleCheckAlerts() {
    if (window.setView) window.setView('alerts');
  }
  function handleExportData() {
    // Export sales data as CSV
    const sales = useSalesStore.getState().sales;
    const csvRows = [
      [
        'IMEI', 'Store', 'Category', 'Customer Name', 'Email', 'Activation Date', 'Status', 'Notes',
        'Month', 'Paid', 'Amount', 'Date Paid', 'Payment Type'
      ].join(',')
    ];
    sales.forEach(sale => {
      sale.bountyTracking.forEach(bt => {
        (bt.payments || []).forEach(payment => {
          csvRows.push([
            sale.imei,
            sale.storeLocation,
            sale.category,
            sale.customerName || '',
            sale.email,
            sale.activationDate,
            sale.status,
            sale.notes || '',
            bt.monthNumber,
            bt.paid ? 'Yes' : 'No',
            payment.amount,
            bt.datePaid || bt.dateChecked || '',
            payment.type
          ].map(v => `"${String(v).replace(/"/g, '""')}` ).join(',') );
        });
      });
    });
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commission_tracker_export_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-2">
        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/90 transition"
          onClick={handleAddSale}
        >
          <span className="material-icons">add_circle</span> Add Sale
        </button>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-foreground font-semibold shadow hover:bg-secondary/90 transition"
          onClick={handleCheckAlerts}
        >
          <span className="material-icons">notifications_active</span> Check Alerts
        </button>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-foreground font-semibold shadow hover:bg-accent/90 transition"
          onClick={handleExportData}
        >
          <span className="material-icons">download</span> Export Data
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
        <p className="text-muted-foreground">Track your sales performance and commission payments</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Active Lines"
          value={stats.totalActiveLines}
          icon={TrendingUp}
          variant="success"
          subtitle="Currently generating revenue"
        />
        <StatCard
          title="Deactivated Lines"
          value={stats.totalDeactivatedLines}
          icon={TrendingDown}
          variant="destructive"
          subtitle="No longer active"
        />
        <StatCard
          title="Total Commission"
          value={formatCurrency(stats.totalCommissionEarned)}
          icon={DollarSign}
          variant="default"
          subtitle="Base commission earned"
        />
        <StatCard
          title="Monthly Bounty Total"
          value={formatCurrency(stats.monthlyBountyTotal)}
          icon={Calendar}
          variant="default"
          subtitle="All bounty payments"
        />
        <StatCard
          title="Paid Bounties"
          value={formatCurrency(stats.paidBounties)}
          icon={CheckCircle}
          variant="success"
          subtitle="Received payments"
        />
      </div>

      {/* Soon-to-be-due and Overdue Bounties/Payments Summary */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Soon-to-be-due & Overdue Bounties/Payments</h3>
        <SoonOverdueBountiesSummary />
      </div>

      {/* Sales by Type Breakdown (Pie/Donut Chart) */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Sales by Type Breakdown</h3>
        <SalesByTypeChart />
      </div>

      {/* Monthly Payment Status Overtime Chart */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Monthly Payment Status Overtime</h3>
        <MonthlyPaymentStatusChart />
      </div>
    </div>
  );

// Chart for monthly payment status overtime and sales by type
import { ChartContainer } from '../ui/chart';
import { useMemo } from 'react';

import { SaleCategory } from '../../types';

const categoryLabels: Record<SaleCategory, string> = {
  'new-line': 'New Line',
  'port-in': 'Port-In',
  'upgrade': 'Upgrade',
  'finance-postpaid': 'Finance/Postpaid',
  'add-a-line': 'Add a Line',
  'port-in-add-a-line': 'Port in Add a Line',
  'byod': 'BYOD',
};

function SalesByTypeChart() {
  const sales = useSalesStore((state) => state.sales);
  const data = useMemo(() => {
    const counts: Record<SaleCategory, number> = {
      'new-line': 0,
      'port-in': 0,
      'upgrade': 0,
      'finance-postpaid': 0,
      'add-a-line': 0,
      'port-in-add-a-line': 0,
      'byod': 0,
    };
    sales.forEach((sale) => {
      counts[sale.category] = (counts[sale.category] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      category: categoryLabels[key as SaleCategory],
      value,
      key,
    }));
  }, [sales]);

  const chartConfig = {
    'new-line': { label: 'New Line', color: '#3b82f6' },
    'port-in': { label: 'Port-In', color: '#f59e42' },
    'upgrade': { label: 'Upgrade', color: '#22c55e' },
    'finance-postpaid': { label: 'Finance/Postpaid', color: '#a855f7' },
    'add-a-line': { label: 'Add a Line', color: '#f43f5e' },
    'port-in-add-a-line': { label: 'Port in Add a Line', color: '#eab308' },
    'byod': { label: 'BYOD', color: '#0ea5e9' },
  };

  return (
    <ChartContainer config={chartConfig}>
      {({ ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend }) => (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              label={({ category, value }) => `${category}: ${value}`}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={chartConfig[entry.key].color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
}
  const sales = useSalesStore((state) => state.sales);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find soon-to-be-due (within 14 days) and overdue bounties
  const { soonDue, overdue } = useMemo(() => {
    let soonDueCount = 0, soonDueTotal = 0;
    let overdueCount = 0, overdueTotal = 0;
    sales.forEach((sale) => {
      sale.bountyTracking.forEach((bt) => {
        // Calculate check date: activation + (35 * month) days
        const activationDate = new Date(sale.activationDate);
        const checkDate = new Date(activationDate);
        checkDate.setDate(checkDate.getDate() + (35 * bt.monthNumber));
        checkDate.setHours(0, 0, 0, 0);
        const daysUntilCheck = Math.ceil((checkDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const amount = bt.payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
        if (!bt.paid && amount > 0) {
          if (daysUntilCheck < 0) {
            overdueCount++;
            overdueTotal += amount;
          } else if (daysUntilCheck <= 14) {
            soonDueCount++;
            soonDueTotal += amount;
          }
        }
      });
    });
    return {
      soonDue: { count: soonDueCount, total: soonDueTotal },
      overdue: { count: overdueCount, total: overdueTotal },
    };
  }, [sales]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-lg border p-4 bg-yellow-50 dark:bg-yellow-900/30">
        <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-1">Soon-to-be-due</h4>
        <div className="text-lg font-bold">{soonDue.count} payments</div>
        <div className="text-muted-foreground">Total: {formatCurrency(soonDue.total)}</div>
      </div>
      <div className="rounded-lg border p-4 bg-red-50 dark:bg-red-900/30">
        <h4 className="font-semibold text-red-700 dark:text-red-300 mb-1">Overdue</h4>
        <div className="text-lg font-bold">{overdue.count} payments</div>
        <div className="text-muted-foreground">Total: {formatCurrency(overdue.total)}</div>
      </div>
    </div>
  );
}

function MonthlyPaymentStatusChart() {
  const sales = useSalesStore((state) => state.sales);

  // Aggregate paid/unpaid bounties per month (1-6)
  const data = useMemo(() => {
    const result = [];
    for (let month = 1; month <= 6; month++) {
      let paid = 0;
      let unpaid = 0;
      sales.forEach((sale) => {
        const bt = sale.bountyTracking.find((b) => b.monthNumber === month);
        if (bt) {
          const amount = bt.payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
          if (bt.paid) paid += amount;
          else unpaid += amount;
        }
      });
      result.push({ month: `Month ${month}`, paid, unpaid });
    }
    return result;
  }, [sales]);

  // Chart config for colors/labels
  const chartConfig = {
    paid: { label: 'Paid', color: '#22c55e' },
    unpaid: { label: 'Unpaid', color: '#f59e42' },
  };

  return (
    <ChartContainer config={chartConfig}>
      {({ ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar }) => (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="paid" stackId="a" fill="#22c55e" />
            <Bar dataKey="unpaid" stackId="a" fill="#f59e42" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
}

export default Dashboard;
