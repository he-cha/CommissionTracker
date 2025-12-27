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

  const sale = sales.find((s) => s.id === saleId);

  const [imei, setImei] = useState('');
  const [storeLocation, setStoreLocation] = useState<StoreLocation>('store-1');
  const [category, setCategory] = useState<SaleCategory>('new-line');
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
      setCustomerPin(sale.customerPin || '');
      setEmail(sale.email);
      setActivationDate(sale.activationDate);
      setNotes(sale.notes || '');
      setBountyTracking(sale.bountyTracking);
    }
  }, [sale]);

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

  const updateBountyMonth = (monthNumber: number, field: keyof BountyMonthTracking, value: any) => {
    setBountyTracking((prev) =>
      prev.map((bt) =>
        bt.monthNumber === monthNumber ? { ...bt, [field]: value } : bt
      )
    );
  };

  const updateBountyAmount = (monthNumber: number, value: string) => {
    const amount = value === '' ? undefined : parseFloat(value);
    updateBountyMonth(monthNumber, 'amountPaid', amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!imei || !email || !activationDate) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields (IMEI, Email, Activation Date)',
        variant: 'destructive',
      });
      return;
    }

    updateSale(saleId, {
      imei,
      storeLocation,
      category,
      customerPin: customerPin || undefined,
      email,
      activationDate,
      bountyTracking,
      notes,
    });

    toast({
      title: 'Sale updated successfully',
      description: `IMEI ${imei} has been updated`,
    });

    onBack();
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
                    <Label className="text-xs text-muted-foreground">Amount Paid ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={bounty.amountPaid ?? ''}
                      onChange={(e) => updateBountyAmount(bounty.monthNumber, e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Date Checked</Label>
                    <Input
                      type="date"
                      value={bounty.dateChecked || ''}
                      onChange={(e) =>
                        updateBountyMonth(bounty.monthNumber, 'dateChecked', e.target.value)
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
