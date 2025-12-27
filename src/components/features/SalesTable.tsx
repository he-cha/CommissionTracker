import { useState } from 'react';
import { useSalesStore } from '../../stores/salesStore';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { SaleCategory, LineStatus, StoreLocation } from '../../types';

const categoryLabels: Record<SaleCategory, string> = {
  'new-line': 'New Line',
  'port-in': 'Port-In',
  'upgrade': 'Upgrade',
  'finance-postpaid': 'Finance/Postpaid',
};

const storeLabels: Record<StoreLocation, string> = {
  'store-1': 'Store 1',
  'store-2': 'Store 2',
  'store-3': 'Store 3',
  'store-4': 'Store 4',
};

export function SalesTable() {
  const sales = useSalesStore((state) => state.sales);
  const updateSale = useSalesStore((state) => state.updateSale);
  const deleteSale = useSalesStore((state) => state.deleteSale);
  const [filter, setFilter] = useState<'all' | LineStatus>('all');

  const filteredSales = filter === 'all' 
    ? sales 
    : sales.filter((sale) => sale.status === filter);

  const toggleStatus = (id: string, currentStatus: LineStatus) => {
    const newStatus: LineStatus = currentStatus === 'active' ? 'deactivated' : 'active';
    updateSale(id, { status: newStatus });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Sales Records</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={filter === 'deactivated' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('deactivated')}
            >
              Deactivated
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredSales.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No sales records found. Add your first sale to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">IMEI</th>
                  <th className="pb-3 pr-4 font-medium">Store</th>
                  <th className="pb-3 pr-4 font-medium">Category</th>
                  <th className="pb-3 pr-4 font-medium">Customer PIN</th>
                  <th className="pb-3 pr-4 font-medium">Commission</th>
                  <th className="pb-3 pr-4 font-medium">Bounty Progress</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Activation</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => {
                  const totalMonths = sale.bountyTracking.length;
                  const paidMonths = sale.bountyTracking.filter((bt) => bt.paid).length;
                  
                  return (
                    <tr key={sale.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="py-4 pr-4 font-mono text-sm font-medium">{sale.imei}</td>
                      <td className="py-4 pr-4">
                        <Badge variant="outline" className="border-primary/50">{storeLabels[sale.storeLocation]}</Badge>
                      </td>
                      <td className="py-4 pr-4">
                        <Badge variant="outline">{categoryLabels[sale.category]}</Badge>
                      </td>
                      <td className="py-4 pr-4 font-mono text-sm">{sale.customerPin}</td>
                      <td className="py-4 pr-4 font-semibold text-success">{formatCurrency(sale.baseCommission)}</td>
                      <td className="py-4 pr-4">
                        <div className="text-sm">
                          <div className="font-medium">{paidMonths} / {totalMonths} paid</div>
                          <div className="w-full bg-muted h-1.5 rounded-full mt-1">
                            <div 
                              className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full transition-all"
                              style={{ width: `${(paidMonths / totalMonths) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <Badge variant={sale.status === 'active' ? 'default' : 'destructive'}>
                          {sale.status}
                        </Badge>
                      </td>
                      <td className="py-4 pr-4 text-sm text-muted-foreground">
                        {formatDate(sale.activationDate)}
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStatus(sale.id, sale.status)}
                            title={`Mark as ${sale.status === 'active' ? 'deactivated' : 'active'}`}
                          >
                            {sale.status === 'active' ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSale(sale.id)}
                            title="Delete sale"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
