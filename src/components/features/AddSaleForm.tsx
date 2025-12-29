const paymentOptions = [
  "Boost 5G Certified Device Bounty",
  "Boost 5G Network Bounty",
  "Boost 5G Network Migration Bounty",
  "Boost Auto Top-Up",
  "Boost Ready Bounty",
  "BR BYOD SPIFF",
  "Commision Withholding",
  "Device Financing Bounty",
  "Device Upgrade Bounty",
  "epay RTR Invoice Reimbursement",
  "February Tax Refund Rush Bonus",
  "In-Store Device Financing Bounty",
  "likewize Coupon Redemption",
  "Network change SPIFF",
  "New Activation Bounty",
  "New iPhone Bounty",
  "Other Commision",
  "Other Equipment Reimbursement",
  "Other Service Reimbursement",
  "Pay Later SPIFF",
  "Platinum Sale SPIFF",
  "Postpaid Dropship Launch SPIFF",
  "Q1 AAL Device Discount",
  "Q1 Exclusive Upgrade Offer",
  "Q1 Promo New Activation Offer",
  "Q1 Promo PIC Offer",
  "Q1 Promo Retail Postpaid Offer",
  "Q1 Promo Upgrade",
  "Q1 Promo Upgrade Boost 5G",
  "Q2 AAL Device Discount",
  "Q2 Exclusive Upgrade Offer",
  "Q2 Promo New Activation Offer",
  "Q2 Promo PIC Offer",
  "Q2 Promo Retail Postpaid Offer",
  "Q2 Promo Upgrade",
  "Q2 Promo Upgrade Boost 5G",
  "Q3 AAL Device Discount",
  "Q3 Exclusive Upgrade Offer",
  "Q3 Promo New Activation Offer",
  "Q3 Promo PIC Offer",
  "Q3 Promo Retail Postpaid Offer",
  "Q3 Promo Upgrade",
  "Q3 Promo Upgrade Boost 5G",
  "Q4 AAL Device Discount",
  "Q4 Exclusive Upgrade Offer",
  "Q4 Promo New Activation Offer",
  "Q4 Promo PIC Offer",
  "Q4 Promo Retail Postpaid Offer",
  "Q4 Promo Upgrade",
  "Q4 Promo Upgrade Boost 5G",
  "S25 Device Spiff",
  "SIM Card Reimbursement",
  "Simplified SIM Loading Bounty",
  "Tablet SPIFF"
].filter((v, i, a) => a.indexOf(v) === i).sort();
import { useState } from 'react';
import { useSalesStore } from '../../stores/salesStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { SaleCategory, StoreLocation, BountyMonthTracking } from '../../types';
import { Calendar, Store, Smartphone } from 'lucide-react';
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

export function AddSaleForm() {
  const addSale = useSalesStore((state) => state.addSale);
  const sales = useSalesStore((state) => state.sales);
  const loading = useSalesStore((state) => state.loading);
  const { toast } = useToast();
  
  const [imei, setImei] = useState('');
  const [storeLocation, setStoreLocation] = useState<StoreLocation>('paris-rd');
  const [category, setCategory] = useState<SaleCategory>('new-line');
  const [customerName, setCustomerName] = useState('');
  const [customerPin, setCustomerPin] = useState('');
  const [email, setEmail] = useState('');
  const [activationDate, setActivationDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Initialize all 6 months as unpaid
  const [bountyTracking, setBountyTracking] = useState<BountyMonthTracking[]>(
    Array.from({ length: 6 }, (_, i) => ({
      monthNumber: i + 1,
      paid: false,
      payments: [],
      datePaid: undefined,
      notes: ''
    }))
  );

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

    // Check for duplicate IMEI
    const existingSale = sales.find(sale => sale.imei === imei);
    if (existingSale) {
      toast({
        title: 'Duplicate IMEI',
        description: 'A sale with this IMEI already exists. Please use a unique IMEI.',
        variant: 'destructive',
      });
      return;
    }

    // Filter out empty payments before saving
    const cleanedBountyTracking = bountyTracking.map(bt => ({
      ...bt,
      payments: bt.payments.filter(payment => 
        payment.type.trim() !== '' && payment.amount > 0
      )
    }));

    const success = await addSale({
      imei,
      storeLocation,
      category,
      customerName: customerName || undefined,
      customerPin: customerPin || undefined,
      email,
      activationDate,
      bountyTracking: cleanedBountyTracking,
      status: 'active',
      notes,
    });

    if (success) {
      toast({
        title: 'Sale added successfully!',
        description: 'The new sale has been recorded.',
      });

      // Reset form
      setImei('');
      setStoreLocation('paris-rd');
      setCategory('new-line');
      setCustomerName('');
      setCustomerPin('');
      setEmail('');
      setActivationDate('');
      setNotes('');
      setBountyTracking(
        Array.from({ length: 6 }, (_, i) => ({
          monthNumber: i + 1,
          paid: false,
          payments: [],
          datePaid: undefined,
          notes: '',
        }))
      );
    }
  };

  return (
    <Card className="border-primary/20 card-glow">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-2xl">Add New Sale</CardTitle>
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
            
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
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
                              {paymentOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
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

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity h-12 text-lg font-semibold"
            disabled={loading}
          >
            {loading ? 'Adding Sale...' : 'Add Sale to Records'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
