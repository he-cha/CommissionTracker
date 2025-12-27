import { TrendingUp, TrendingDown, DollarSign, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { useSalesStore } from '../../stores/salesStore';
import { StatCard } from './StatCard';
import { formatCurrency } from '../../lib/utils';

export function Dashboard() {
  const getDashboardStats = useSalesStore((state) => state.getDashboardStats);
  const stats = getDashboardStats();

  return (
    <div className="space-y-6">
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
        <StatCard
          title="Unpaid Bounties"
          value={formatCurrency(stats.unpaidBounties)}
          icon={XCircle}
          variant="warning"
          subtitle="Pending payments"
        />
      </div>
    </div>
  );
}
