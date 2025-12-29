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
import { BountyMonthTracking } from '../../types';

interface BountyUpdateProps {
  saleId: string;
  monthNumber: number;
  onBack: () => void;
}

export function BountyUpdate({ saleId, monthNumber, onBack }: BountyUpdateProps) {
  const sales = useSalesStore((state) => state.sales);
  const updateSale = useSalesStore((state) => state.updateSale);
  const { toast } = useToast();

  const sale = sales.find((s) => (s._id || s.id) === saleId);
  const bountyMonth = sale?.bountyTracking.find((bt) => bt.monthNumber === monthNumber);

  const [paid, setPaid] = useState(bountyMonth?.paid || false);
  const [payments, setPayments] = useState(bountyMonth?.payments || []);
  const [datePaid, setDatePaid] = useState(bountyMonth?.datePaid || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(bountyMonth?.notes || '');

  useEffect(() => {
    if (bountyMonth) {
      setPaid(bountyMonth.paid);
      
      // Handle backward compatibility for payments
      let paymentsData = bountyMonth.payments || [];
      if (!paymentsData.length && bountyMonth.amountPaid) {
        // Convert legacy amountPaid to payments array
        paymentsData = [{ type: 'Legacy Payment', amount: bountyMonth.amountPaid }];
      }
      
      setPayments(paymentsData);
      setDatePaid(bountyMonth.datePaid || bountyMonth.dateChecked || new Date().toISOString().split('T')[0]);
      setNotes(bountyMonth.notes || '');
    }
  }, [bountyMonth]);

  const addPayment = () => {
    setPayments([...payments, { type: '', amount: 0 }]);
  };

  const updatePayment = (index: number, field: 'type' | 'amount', value: string | number) => {
    setPayments(payments.map((payment, i) => 
      i === index ? { ...payment, [field]: value } : payment
    ));
  };

  const removePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const getTotalAmount = () => {
    return payments.reduce((total, payment) => total + (payment.amount || 0), 0);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty payments before saving
    const cleanedPayments = payments.filter(payment => 
      payment.type.trim() !== '' && payment.amount > 0
    );

    const updatedBountyTracking = sale.bountyTracking.map((bt) =>
      bt.monthNumber === monthNumber
        ? {
            ...bt,
            paid,
            payments: cleanedPayments,
            datePaid,
            notes,
          }
        : bt
    );

    const success = await updateSale(saleId, { bountyTracking: updatedBountyTracking });

    if (success) {
      toast({
        title: 'Bounty updated successfully',
        description: `Month ${monthNumber} for IMEI ${sale.imei} has been updated`,
      });

      onBack();
    }
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

            {/* Bounty Payments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Bounty Payments
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPayment}
                  className="h-8 px-3 text-xs"
                >
                  Add Payment
                </Button>
              </div>
              <div className="space-y-2">
                {payments.map((payment, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Select
                      value={payment.type}
                      onValueChange={(value) => updatePayment(index, 'type', value)}
                    >
                      <SelectTrigger className="h-8 text-sm flex-1">
                        <SelectValue placeholder="Payment type" />
                      </SelectTrigger>
                      <SelectContent>
                                                <SelectItem value="Boost Ready Bounty">Boost Ready Bounty</SelectItem>
                                                <SelectItem value="BR BYOD SPIFF">BR BYOD SPIFF</SelectItem>
                                                <SelectItem value="Commision Withholding">Commision Withholding</SelectItem>
                                                <SelectItem value="Device Financing Bounty">Device Financing Bounty</SelectItem>
                                                <SelectItem value="Device Upgrade Bounty">Device Upgrade Bounty</SelectItem>
                                                <SelectItem value="epay RTR Invoice Reimbursement">epay RTR Invoice Reimbursement</SelectItem>
                                                <SelectItem value="February Tax Refund Rush Bonus">February Tax Refund Rush Bonus</SelectItem>
                                                <SelectItem value="In-Store Device Financing Bounty">In-Store Device Financing Bounty</SelectItem>
                                                <SelectItem value="likewize Coupon Redemption">likewize Coupon Redemption</SelectItem>
                                                <SelectItem value="New Activation Bounty">New Activation Bounty</SelectItem>
                                                <SelectItem value="New iPhone Bounty">New iPhone Bounty</SelectItem>
                                                <SelectItem value="Other Commision">Other Commision</SelectItem>
                                                <SelectItem value="Other Equipment Reimbursement">Other Equipment Reimbursement</SelectItem>
                                                <SelectItem value="Other Service Reimbursement">Other Service Reimbursement</SelectItem>
                                                <SelectItem value="Pay Later SPIFF">Pay Later SPIFF</SelectItem>
                                                <SelectItem value="Platinum Sale SPIFF">Platinum Sale SPIFF</SelectItem>
                                                <SelectItem value="Tablet SPIFF">Tablet SPIFF</SelectItem>
                                                <SelectItem value="Simplified SIM Loading Bounty">Simplified SIM Loading Bounty</SelectItem>
                                                <SelectItem value="S25 Device Spiff">S25 Device Spiff</SelectItem>
                                                <SelectItem value="Postpaid Dropship Launch SPIFF">Postpaid Dropship Launch SPIFF</SelectItem>
                                                <SelectItem value="Q1 AAL Device Discount">Q1 AAL Device Discount</SelectItem>
                                                <SelectItem value="Q2 AAL Device Discount">Q2 AAL Device Discount</SelectItem>
                                                <SelectItem value="Q3 AAL Device Discount">Q3 AAL Device Discount</SelectItem>
                                                <SelectItem value="Q4 AAL Device Discount">Q4 AAL Device Discount</SelectItem>
                        <SelectItem value="Network change SPIFF">Network change SPIFF</SelectItem>
                        <SelectItem value="Q1 Promo New Activation Offer">Q1 Promo New Activation Offer</SelectItem>
                        <SelectItem value="Q2 Promo New Activation Offer">Q2 Promo New Activation Offer</SelectItem>
                        <SelectItem value="Q3 Promo New Activation Offer">Q3 Promo New Activation Offer</SelectItem>
                        <SelectItem value="Q4 Promo New Activation Offer">Q4 Promo New Activation Offer</SelectItem>
                        <SelectItem value="Q1 Promo PIC Offer">Q1 Promo PIC Offer</SelectItem>
                        <SelectItem value="Q2 Promo PIC Offer">Q2 Promo PIC Offer</SelectItem>
                        <SelectItem value="Q3 Promo PIC Offer">Q3 Promo PIC Offer</SelectItem>
                        <SelectItem value="Q4 Promo PIC Offer">Q4 Promo PIC Offer</SelectItem>
                        <SelectItem value="Q1 Promo Retail Postpaid Offer">Q1 Promo Retail Postpaid Offer</SelectItem>
                        <SelectItem value="Q2 Promo Retail Postpaid Offer">Q2 Promo Retail Postpaid Offer</SelectItem>
                        <SelectItem value="Q3 Promo Retail Postpaid Offer">Q3 Promo Retail Postpaid Offer</SelectItem>
                        <SelectItem value="Q4 Promo Retail Postpaid Offer">Q4 Promo Retail Postpaid Offer</SelectItem>
                        <SelectItem value="Q1 Promo Upgrade">Q1 Promo Upgrade</SelectItem>
                        <SelectItem value="Q2 Promo Upgrade">Q2 Promo Upgrade</SelectItem>
                        <SelectItem value="Q3 Promo Upgrade">Q3 Promo Upgrade</SelectItem>
                        <SelectItem value="Q4 Promo Upgrade">Q4 Promo Upgrade</SelectItem>
                        <SelectItem value="Q1 Promo Upgrade Boost 5G">Q1 Promo Upgrade Boost 5G</SelectItem>
                        <SelectItem value="Q2 Promo Upgrade Boost 5G">Q2 Promo Upgrade Boost 5G</SelectItem>
                        <SelectItem value="Q3 Promo Upgrade Boost 5G">Q3 Promo Upgrade Boost 5G</SelectItem>
                        <SelectItem value="Q4 Promo Upgrade Boost 5G">Q4 Promo Upgrade Boost 5G</SelectItem>
                        <SelectItem value="Q1 Exclusive Upgrade Offer">Q1 Exclusive Upgrade Offer</SelectItem>
                        <SelectItem value="Q2 Exclusive Upgrade Offer">Q2 Exclusive Upgrade Offer</SelectItem>
                        <SelectItem value="Q3 Exclusive Upgrade Offer">Q3 Exclusive Upgrade Offer</SelectItem>
                        <SelectItem value="Q4 Exclusive Upgrade Offer">Q4 Exclusive Upgrade Offer</SelectItem>
                        <SelectItem value="SIM Card Reimbursement">SIM Card Reimbursement</SelectItem>
                        <SelectItem value="Boost 5G Certified Device Bounty">Boost 5G Certified Device Bounty</SelectItem>
                        <SelectItem value="Boost 5G Network Bounty">Boost 5G Network Bounty</SelectItem>
                        <SelectItem value="Boost 5G Network Migration Bounty">Boost 5G Network Migration Bounty</SelectItem>
                        <SelectItem value="Boost Auto Top-Up">Boost Auto Top-Up</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={payment.amount || ''}
                      onChange={(e) => updatePayment(index, 'amount', parseFloat(e.target.value) || 0)}
                      className="h-8 text-sm w-24"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePayment(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                {payments.length > 0 && (
                  <div className="text-sm font-medium text-success border-t pt-2">
                    Total: ${getTotalAmount().toFixed(2)}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Add multiple payment types and amounts for this month's bounty
              </p>
            </div>

            {/* Date Paid */}
            <div className="space-y-2">
              <Label htmlFor="datePaid" className="text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Paid
              </Label>
              <Input
                id="datePaid"
                type="date"
                value={datePaid}
                onChange={(e) => setDatePaid(e.target.value)}
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
