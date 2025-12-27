import { useMemo, useState } from 'react';
import { useSalesStore } from '../../stores/salesStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { formatDate } from '../../lib/utils';
import { Bell, AlertCircle, CheckCircle, Mail, Search, Filter } from 'lucide-react';
import { BountyAlert, StoreLocation } from '../../types';

interface BountyAlertsProps {
  onCheckNow?: (saleId: string, monthNumber: number) => void;
}

type AlertStatusFilter = 'all' | 'overdue' | 'due-soon' | 'upcoming';
type PaymentFilter = 'all' | 'paid' | 'unpaid';

const storeLabels: Record<StoreLocation, string> = {
  'store-1': 'Store 1',
  'store-2': 'Store 2',
  'store-3': 'Store 3',
  'store-4': 'Store 4',
};

export function BountyAlerts({ onCheckNow }: BountyAlertsProps) {
  const sales = useSalesStore((state) => state.sales);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AlertStatusFilter>('all');
  const [monthFilter, setMonthFilter] = useState<'all' | number>('all');
  const [storeFilter, setStoreFilter] = useState<'all' | StoreLocation>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');

  const alerts = useMemo(() => {
    const allAlerts: BountyAlert[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    sales.forEach((sale) => {
      if (sale.status === 'deactivated') return;

      const activationDate = new Date(sale.activationDate);
      
      // Check each month (1-6)
      for (let month = 1; month <= 6; month++) {
        const bountyMonth = sale.bountyTracking.find(bt => bt.monthNumber === month);
        
        // Calculate check date: activation + (35 * month) days
        const checkDate = new Date(activationDate);
        checkDate.setDate(checkDate.getDate() + (35 * month));
        checkDate.setHours(0, 0, 0, 0);

        // Calculate days until check
        const daysUntilCheck = Math.ceil((checkDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Only show if within next 14 days or overdue
        if (daysUntilCheck <= 14) {
          allAlerts.push({
            saleId: sale.id,
            imei: sale.imei,
            email: sale.email,
            monthNumber: month,
            checkDate: checkDate.toISOString().split('T')[0],
            daysUntilCheck,
            isOverdue: daysUntilCheck < 0,
            isPaid: bountyMonth?.paid || false,
            storeLocation: sale.storeLocation,
          } as BountyAlert & { storeLocation: StoreLocation });
        }
      }
    });

    // Sort by days until check (most urgent first)
    return allAlerts.sort((a, b) => {
      // Unpaid overdue first
      if (a.isOverdue && !a.isPaid && (!b.isOverdue || b.isPaid)) return -1;
      if (b.isOverdue && !b.isPaid && (!a.isOverdue || a.isPaid)) return 1;
      // Then by days until check
      return a.daysUntilCheck - b.daysUntilCheck;
    });
  }, [sales]);

  const filteredAlerts = useMemo(() => {
    let filtered = alerts;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (alert) =>
          alert.imei.toLowerCase().includes(term) ||
          alert.email.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((alert) => {
        if (statusFilter === 'overdue') {
          return alert.isOverdue && !alert.isPaid;
        } else if (statusFilter === 'due-soon') {
          return !alert.isOverdue && alert.daysUntilCheck <= 7;
        } else if (statusFilter === 'upcoming') {
          return !alert.isOverdue && alert.daysUntilCheck > 7;
        }
        return true;
      });
    }

    // Month filter
    if (monthFilter !== 'all') {
      filtered = filtered.filter((alert) => alert.monthNumber === monthFilter);
    }

    // Store filter
    if (storeFilter !== 'all') {
      filtered = filtered.filter((alert) => {
        const sale = sales.find(s => s.id === alert.saleId);
        return sale?.storeLocation === storeFilter;
      });
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter((alert) => {
        if (paymentFilter === 'paid') {
          return alert.isPaid;
        } else if (paymentFilter === 'unpaid') {
          return !alert.isPaid;
        }
        return true;
      });
    }

    return filtered;
  }, [alerts, searchTerm, statusFilter, monthFilter, storeFilter, paymentFilter, sales]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setMonthFilter('all');
    setStoreFilter('all');
    setPaymentFilter('all');
  };

  const activeFiltersCount = 
    (searchTerm ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (monthFilter !== 'all' ? 1 : 0) +
    (storeFilter !== 'all' ? 1 : 0) +
    (paymentFilter !== 'all' ? 1 : 0);

  const overdueCount = alerts.filter(a => a.isOverdue && !a.isPaid).length;
  const upcomingCount = alerts.filter(a => !a.isOverdue && !a.isPaid && a.daysUntilCheck <= 7).length;

  return (
    <Card className="border-warning/30 card-glow">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-warning/10 to-destructive/10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-warning to-destructive">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">Bounty Check Alerts</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                35-day interval reminders for each month
              </p>
            </div>
            <div className="flex gap-2">
              {overdueCount > 0 && (
                <Badge variant="destructive" className="h-6">
                  {overdueCount} Overdue
                </Badge>
              )}
              {upcomingCount > 0 && (
                <Badge variant="default" className="h-6 bg-warning text-warning-foreground">
                  {upcomingCount} Due Soon
                </Badge>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by IMEI or Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Row */}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AlertStatusFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="Alert Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alerts</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="due-soon">Due in 7 Days</SelectItem>
                  <SelectItem value="upcoming">Due in 8-14 Days</SelectItem>
                </SelectContent>
              </Select>

              {/* Month Filter */}
              <Select value={monthFilter.toString()} onValueChange={(value) => setMonthFilter(value === 'all' ? 'all' : parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value="1">Month 1</SelectItem>
                  <SelectItem value="2">Month 2</SelectItem>
                  <SelectItem value="3">Month 3</SelectItem>
                  <SelectItem value="4">Month 4</SelectItem>
                  <SelectItem value="5">Month 5</SelectItem>
                  <SelectItem value="6">Month 6</SelectItem>
                </SelectContent>
              </Select>

              {/* Store Filter */}
              <Select value={storeFilter} onValueChange={(value) => setStoreFilter(value as typeof storeFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="Store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  <SelectItem value="store-1">Store 1</SelectItem>
                  <SelectItem value="store-2">Store 2</SelectItem>
                  <SelectItem value="store-3">Store 3</SelectItem>
                  <SelectItem value="store-4">Store 4</SelectItem>
                </SelectContent>
              </Select>

              {/* Payment Filter */}
              <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as PaymentFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Badge and Reset */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="border-primary/50">
                  <Filter className="h-3 w-3 mr-1" />
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                </Badge>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Clear all
                </Button>
              </div>
            )}

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredAlerts.length} of {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            {alerts.length === 0 ? (
              <>
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground">All caught up!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  No bounty checks due in the next 14 days
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-foreground">No alerts match your filters</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search criteria
                </p>
                <Button variant="outline" onClick={resetFilters} className="mt-4">
                  Clear all filters
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const sale = sales.find(s => s.id === alert.saleId);
              const variant = alert.isPaid
                ? 'paid'
                : alert.isOverdue
                ? 'overdue'
                : alert.daysUntilCheck <= 3
                ? 'urgent'
                : 'upcoming';

              const variantStyles = {
                paid: 'border-success/30 bg-success/5',
                overdue: 'border-destructive/50 bg-destructive/10',
                urgent: 'border-warning/50 bg-warning/10',
                upcoming: 'border-border bg-card/50',
              };

              const statusBadge = alert.isPaid ? (
                <Badge variant="outline" className="border-success/50 text-success">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Paid
                </Badge>
              ) : alert.isOverdue ? (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {Math.abs(alert.daysUntilCheck)} days overdue
                </Badge>
              ) : (
                <Badge variant="outline" className="border-warning/50 text-warning">
                  Due in {alert.daysUntilCheck} {alert.daysUntilCheck === 1 ? 'day' : 'days'}
                </Badge>
              );

              return (
                <div
                  key={`${alert.saleId}-${alert.monthNumber}`}
                  className={`rounded-lg border p-4 transition-all hover:shadow-md ${variantStyles[variant]}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="font-mono text-sm font-bold">{alert.imei}</div>
                        <Badge variant="outline" className="border-primary/50">
                          Month {alert.monthNumber}
                        </Badge>
                        {sale && (
                          <Badge variant="outline" className="border-secondary/50">
                            {storeLabels[sale.storeLocation]}
                          </Badge>
                        )}
                        {statusBadge}
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span>{alert.email}</span>
                        </div>
                        <div>
                          Check date: <span className="font-medium text-foreground">{formatDate(alert.checkDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant={alert.isPaid ? 'outline' : 'default'}
                        className="whitespace-nowrap"
                        onClick={() => onCheckNow?.(alert.saleId, alert.monthNumber)}
                      >
                        {alert.isPaid ? 'View Details' : 'Check Now'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
