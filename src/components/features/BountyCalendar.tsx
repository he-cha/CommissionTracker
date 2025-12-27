import { useSalesStore } from '../../stores/salesStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { formatCurrency, formatDate } from '../../lib/utils';
import { CheckCircle, Circle, Calendar as CalendarIcon } from 'lucide-react';

export function BountyCalendar() {
  const sales = useSalesStore((state) => state.sales);
  const toggleBountyPaid = useSalesStore((state) => state.toggleBountyPaid);

  // Group sales by month number (1-6)
  const monthGroups = new Map<number, { saleId: string; imei: string; amount: number; paid: boolean; dateChecked?: string }[]>();

  sales.forEach((sale) => {
    sale.bountyTracking.forEach((bounty) => {
      if (!monthGroups.has(bounty.monthNumber)) {
        monthGroups.set(bounty.monthNumber, []);
      }
      monthGroups.get(bounty.monthNumber)!.push({
        saleId: sale.id,
        imei: sale.imei,
        amount: bounty.amountPaid || 0,
        paid: bounty.paid,
        dateChecked: bounty.dateChecked,
      });
    });
  });

  // Sort by month number
  const sortedMonths = Array.from(monthGroups.keys()).sort((a, b) => a - b);

  return (
    <Card className="border-primary/20 card-glow">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
            <CalendarIcon className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-2xl">Bounty Payment Tracker</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {sortedMonths.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No bounty tracking data yet. Add sales to start tracking monthly bounty payments.
          </div>
        ) : (
          <div className="space-y-6">
            {sortedMonths.map((monthNum) => {
              const bounties = monthGroups.get(monthNum)!;
              const totalAmount = bounties.reduce((sum, b) => sum + b.amount, 0);
              const paidAmount = bounties.filter((b) => b.paid).reduce((sum, b) => sum + b.amount, 0);
              const paidCount = bounties.filter((b) => b.paid).length;

              return (
                <div key={monthNum} className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Month {monthNum}</h3>
                      <p className="text-sm text-muted-foreground">
                        {paidCount} of {bounties.length} lines paid
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {formatCurrency(totalAmount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(paidAmount)} paid
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {bounties.map((bounty, index) => (
                      <div
                        key={`${bounty.saleId}-${index}`}
                        className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBountyPaid(bounty.saleId, monthNum.toString())}
                            className="h-8 w-8 p-0"
                          >
                            {bounty.paid ? (
                              <CheckCircle className="h-5 w-5 text-success" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </Button>
                          <div>
                            <div className="font-mono text-sm font-medium">{bounty.imei}</div>
                            <div className="text-xs text-muted-foreground">
                              {bounty.paid && bounty.dateChecked ? formatDate(bounty.dateChecked) : 'Unpaid'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">{formatCurrency(bounty.amount)}</div>
                        </div>
                      </div>
                    ))}
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
