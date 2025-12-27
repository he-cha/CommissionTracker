import { useState, useEffect } from 'react';
import { useSalesStore } from '../../stores/salesStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { ArrowLeft, CheckCircle, Mail, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { formatDate } from '../../lib/utils';

interface BountyUpdateProps {
  saleId: string;
  monthNumber: number;
  onBack: () => void;
}

export function BountyUpdate({ saleId, monthNumber, onBack }: BountyUpdateProps) {
  const sales = useSalesStore((state) => state.sales);
  const updateSale = useSalesStore((state) => state.updateSale);
  const { toast } = useToast();

  const sale = sales.find((s) => s.id === saleId);
  const bountyMonth = sale?.bountyTracking.find((bt) => bt.monthNumber === monthNumber);

  const [paid, setPaid] = useState(bountyMonth?.paid || false);
  const [amountPaid, setAmountPaid] = useState<string>(bountyMonth?.amountPaid?.toString() || '');
  const [dateChecked, setDateChecked] = useState(bountyMonth?.dateChecked || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(bountyMonth?.notes || '');

  useEffect(() => {
    if (bountyMonth) {
      setPaid(bountyMonth.paid);
      setAmountPaid(bountyMonth.amountPaid?.toString() || '');
      setDateChecked(bountyMonth.dateChecked || new Date().toISOString().split('T')[0]);
      setNotes(bountyMonth.notes || '');
    }
  }, [bountyMonth]);

  if (!sale || !bountyMonth) {
    return (
      <Card className="card-glow">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Sale or bounty month not found.</p>
            <Button onClick={onBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Alerts
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedBountyTracking = sale.bountyTracking.map((bt) =>
      bt.monthNumber === monthNumber
        ? {
            ...bt,
            paid,
            amountPaid: amountPaid ? parseFloat(amountPaid) : undefined,
            dateChecked,
            notes,
          }
        : bt
    );

    updateSale(saleId, { bountyTracking: updatedBountyTracking });

    toast({
      title: 'Bounty updated successfully',
      description: `Month ${monthNumber} for IMEI ${sale.imei} has been updated`,
    });

    onBack();
  };

  // Calculate check date based on activation date
  const activationDate = new Date(sale.activationDate);
  const checkDate = new Date(activationDate);
  checkDate.setDate(checkDate.getDate() + (35 * monthNumber));

  return (
    <Card className="border-primary/20 card-glow">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-2xl">Update Bounty Payment</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Month {monthNumber} check
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-primary/50">
            Month {monthNumber} of 6
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Sale Information */}
        <div className="mb-6 p-4 rounded-lg bg-muted/30 space-y-2">
          <h3 className="font-semibold text-foreground mb-3">Sale Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">IMEI:</span>
              <span className="ml-2 font-mono font-medium">{sale.imei}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <span className="ml-2">{sale.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Activation Date:</span>
              <span className="ml-2">{formatDate(sale.activationDate)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Expected Check Date:</span>
              <span className="ml-2 font-medium text-warning">{formatDate(checkDate.toISOString().split('T')[0])}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Category:</span>
              <span className="ml-2 capitalize">{sale.category.replace('-', ' ')}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={sale.status === 'active' ? 'default' : 'destructive'} className="ml-2">
                {sale.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Payment Details
            </h3>

            {/* Payment Status */}
            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border bg-card/50">
              <Checkbox
                id="paid"
                checked={paid}
                onCheckedChange={(checked) => setPaid(checked as boolean)}
              />
              <div className="flex-1">
                <Label
                  htmlFor="paid"
                  className="text-base font-medium cursor-pointer text-foreground"
                >
                  Payment Received
                </Label>
                <p className="text-sm text-muted-foreground">
                  Check this if the bounty for month {monthNumber} has been paid
                </p>
              </div>
            </div>

            {/* Amount Paid */}
            <div className="space-y-2">
              <Label htmlFor="amountPaid" className="text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Amount Paid
              </Label>
              <Input
                id="amountPaid"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="text-lg font-semibold"
              />
              <p className="text-xs text-muted-foreground">
                Enter the bounty amount received for this month
              </p>
            </div>

            {/* Date Checked */}
            <div className="space-y-2">
              <Label htmlFor="dateChecked" className="text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Checked
              </Label>
              <Input
                id="dateChecked"
                type="date"
                value={dateChecked}
                onChange={(e) => setDateChecked(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                When did you verify this bounty payment?
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-foreground">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this payment check..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Any additional information or follow-up needed
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Update
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
