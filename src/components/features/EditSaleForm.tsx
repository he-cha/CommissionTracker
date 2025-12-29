import { useState, useEffect } from 'react';
import { useSalesStore } from '../../stores/salesStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { SaleCategory, StoreLocation, BountyMonthTracking } from '../../types';
import { Calendar, Store, Smartphone, ArrowLeft } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const categoryOptions: { value: SaleCategory; label: string }[] = [
  { value: 'new-line', label: 'New Line' },
  { value: 'port-in', label: 'Port-In' },
  { value: 'upgrade', label: 'Upgrade' },
  { value: 'finance-postpaid', label: 'Finance / Postpaid' },
  { value: 'add-a-line', label: 'Add a Line' },
  { value: 'port-in-add-a-line', label: 'Port in Add a Line' },
  { value: 'byod', label: 'BYOD' },
];

const storeOptions: { value: StoreLocation; label: string }[] = [
  { value: 'paris-rd', label: 'Paris Rd' },
  { value: 'business-loop', label: 'Business Loop' },
  { value: 'jefferson-city', label: 'Jefferson City' },
  { value: 'sedalia', label: 'Sedalia' },
];

interface EditSaleFormProps {
  saleId: string;
  onBack: () => void;
}

export function EditSaleForm({ saleId, onBack }: EditSaleFormProps) {
  const sales = useSalesStore((state) => state.sales);
  const updateSale = useSalesStore((state) => state.updateSale);
  const { toast } = useToast();

  const sale = sales.find((s) => (s._id || s.id) === saleId);

  const [imei, setImei] = useState('');
  const [storeLocation, setStoreLocation] = useState<StoreLocation>('store-1');
  const [category, setCategory] = useState<SaleCategory>('new-line');
  const [customerName, setCustomerName] = useState('');
  const [customerPin, setCustomerPin] = useState('');
  const [email, setEmail] = useState('');
  const [activationDate, setActivationDate] = useState('');
  const [notes, setNotes] = useState('');
  const [bountyTracking, setBountyTracking] = useState<BountyMonthTracking[]>([]);

  useEffect(() => {
    if (sale) {
      setImei(sale.imei);
      setStoreLocation(sale.storeLocation);
      setCategory(sale.category);
      setCustomerName(sale.customerName || '');
      setCustomerPin(sale.customerPin || '');
      setEmail(sale.email);
      setActivationDate(sale.activationDate);
      setNotes(sale.notes || '');
      
      // Handle backward compatibility for bounty tracking data
      const migratedBountyTracking = sale.bountyTracking.map((bt: any) => {
        // If it has the old amountPaid format, convert to payments array
        if (bt.amountPaid && (!bt.payments || bt.payments.length === 0)) {
          return {
            ...bt,
            payments: [{ type: 'Legacy Payment', amount: bt.amountPaid }],
            amountPaid: undefined // Remove old field
          };
        }
        // Ensure payments array exists
        return {
          ...bt,
          payments: bt.payments || []
        };
      });
      
      setBountyTracking(migratedBountyTracking);
    }
  }, [sale]);

  const updateBountyMonth = (monthNumber: number, field: keyof BountyMonthTracking, value: any) => {
    setBountyTracking((prev) =>
      prev.map((bt) =>
        bt.monthNumber === monthNumber ? { ...bt, [field]: value } : bt
      )
    );
  };

  const addPayment = (monthNumber: number) => {
    setBountyTracking((prev) =>
      prev.map((bt) =>
        bt.monthNumber === monthNumber
          ? { ...bt, payments: [...bt.payments, { type: '', amount: 0 }] }
          : bt
      )
    );
  };

  const updatePayment = (monthNumber: number, paymentIndex: number, field: 'type' | 'amount', value: string | number) => {
    setBountyTracking((prev) =>
      prev.map((bt) =>
        bt.monthNumber === monthNumber
          ? {
              ...bt,
              payments: bt.payments.map((payment, index) =>
                index === paymentIndex ? { ...payment, [field]: value } : payment
              )
            }
          : bt
      )
    );
  };

  const removePayment = (monthNumber: number, paymentIndex: number) => {
    setBountyTracking((prev) =>
      prev.map((bt) =>
        bt.monthNumber === monthNumber
          ? { ...bt, payments: bt.payments.filter((_, index) => index !== paymentIndex) }
          : bt
      )
    );
  };

  const getMonthTotal = (monthNumber: number) => {
    const month = bountyTracking.find(bt => bt.monthNumber === monthNumber);
    return month ? month.payments.reduce((total, payment) => total + (payment.amount || 0), 0) : 0;
  };

  if (!sale) {
    return (
      <Card className="card-glow">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Sale not found.</p>
            <Button onClick={onBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sales List
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imei || !email || !activationDate) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields (IMEI, Email, Activation Date)',
        variant: 'destructive',
      });
      return;
    }

    // Check for duplicate IMEI if it has changed
    if (imei !== sale.imei) {
      const existingSale = sales.find(s => s.imei === imei && (s._id || s.id) !== saleId);
      if (existingSale) {
        toast({
          title: 'Duplicate IMEI',
          description: 'A sale with this IMEI already exists. Please use a unique IMEI.',
          variant: 'destructive',
        });
        return;
      }
    }

    // Filter out empty payments before saving
    const cleanedBountyTracking = bountyTracking.map(bt => ({
      ...bt,
      payments: bt.payments.filter(payment => 
        payment.type.trim() !== '' && payment.amount > 0
      )
    }));

    const success = await updateSale(saleId, {
      imei,
      storeLocation,
      category,
      customerName: customerName || undefined,
      customerPin: customerPin || undefined,
      email,
      activationDate,
      bountyTracking: cleanedBountyTracking,
      notes,
    });

    if (success) {
      toast({
        title: 'Sale updated successfully',
        description: `IMEI ${imei} has been updated`,
      });

      onBack();
    }
  };

  return (
    <Card className="border-primary/20 card-glow">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-2xl">Edit Sale</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Update sale information</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primary Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Primary Information
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="imei" className="text-foreground">
                  IMEI <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="imei"
                  placeholder="Enter IMEI number"
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  className="font-mono"
                  required
                />
                <p className="text-xs text-muted-foreground">Unique device identifier</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeLocation" className="text-foreground">
                  Store Location <span className="text-destructive">*</span>
                </Label>
                <Select value={storeLocation} onValueChange={(value) => setStoreLocation(value as StoreLocation)}>
                  <SelectTrigger id="storeLocation">
                    <SelectValue />
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
                    {storeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground">
                  Sale Category <span className="text-destructive">*</span>
                </Label>
                <Select value={category} onValueChange={(value) => setCategory(value as SaleCategory)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-foreground">
                  Customer Name
                </Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Optional customer identifier</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPin" className="text-foreground">
                  Customer PIN
                </Label>
                <Input
                  id="customerPin"
                  placeholder="Enter customer PIN (optional)"
                  value={customerPin}
                  onChange={(e) => setCustomerPin(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">Optional carrier verification PIN</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Customer Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activationDate" className="text-foreground">
                  Activation Date <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="activationDate"
                    type="date"
                    value={activationDate}
                    onChange={(e) => setActivationDate(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bounty Tracking */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-secondary" />
              Bounty Tracking (6 Months)
            </h3>
            
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {bountyTracking.map((bounty) => (
                <div
                  key={bounty.monthNumber}
                  className="rounded-lg border border-border bg-card/50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Month {bounty.monthNumber}</span>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`month-${bounty.monthNumber}-paid`}
                        checked={bounty.paid}
                        onCheckedChange={(checked) =>
                          updateBountyMonth(bounty.monthNumber, 'paid', checked)
                        }
                      />
                      <Label
                        htmlFor={`month-${bounty.monthNumber}-paid`}
                        className="text-sm cursor-pointer"
                      >
                        Paid
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">Bounty Payments</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addPayment(bounty.monthNumber)}
                        className="h-6 px-2 text-xs"
                      >
                        Add Payment
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {bounty.payments.map((payment, paymentIndex) => (
                        <div key={paymentIndex} className="flex gap-2 items-center">
                          <Select
                            value={payment.type}
                            onValueChange={(value) => updatePayment(bounty.monthNumber, paymentIndex, 'type', value)}
                          >
                            <SelectTrigger className="h-7 text-xs flex-1">
                              <SelectValue placeholder="Payment type" />
                            </SelectTrigger>
                            <SelectContent>
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
                            onChange={(e) => updatePayment(bounty.monthNumber, paymentIndex, 'amount', parseFloat(e.target.value) || 0)}
                            className="h-7 text-xs w-20"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePayment(bounty.monthNumber, paymentIndex)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      {bounty.payments.length > 0 && (
                        <div className="text-xs font-medium text-success border-t pt-2">
                          Total: ${getMonthTotal(bounty.monthNumber).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Date Paid</Label>
                    <Input
                      type="date"
                      value={bounty.datePaid || bounty.dateChecked || ''}
                      onChange={(e) =>
                        updateBountyMonth(bounty.monthNumber, 'datePaid', e.target.value)
                      }
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Notes</Label>
                    <Input
                      placeholder="Optional notes"
                      value={bounty.notes || ''}
                      onChange={(e) =>
                        updateBountyMonth(bounty.monthNumber, 'notes', e.target.value)
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">General Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about this sale..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

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
              Update Sale
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
