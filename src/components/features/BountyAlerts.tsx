import { useMemo } from 'react';
import { useSalesStore } from '../../stores/salesStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { formatDate } from '../../lib/utils';
import { Bell, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { BountyAlert } from '../../types';

export function BountyAlerts() {
  const sales = useSalesStore((state) => state.sales);

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
          });
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

  const overdueCount = alerts.filter(a => a.isOverdue && !a.isPaid).length;
  const upcomingCount = alerts.filter(a => !a.isOverdue && !a.isPaid && a.daysUntilCheck <= 7).length;

  return (
    <Card className="border-warning/30 card-glow">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-warning/10 to-destructive/10">
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
      </CardHeader>
      <CardContent className="pt-6">
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">All caught up!</p>
            <p className="text-sm text-muted-foreground mt-2">
              No bounty checks due in the next 14 days
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
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
