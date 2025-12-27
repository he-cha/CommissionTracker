import { useState, useMemo } from 'react';
import { useSalesStore } from '../../stores/salesStore';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Edit, Trash2, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { SaleCategory, LineStatus, StoreLocation } from '../../types';

const categoryLabels: Record<SaleCategory, string> = {
  'new-line': 'New Line',
  'port-in': 'Port-In',
  'upgrade': 'Upgrade',
  'finance-postpaid': 'Finance/Postpaid',
};

const storeLabels: Record<StoreLocation, string> = {
  'paris-rd': 'Paris Rd',
  'business-loop': 'Business Loop',
  'jefferson-city': 'Jefferson City',
  'sedalia': 'Sedalia',
};

type BountyStatusFilter = 'all' | 'fully-paid' | 'partially-paid' | 'unpaid';
type SortOption = 'newest' | 'oldest' | 'highest-earned' | 'lowest-earned';

interface SalesTableProps {
  onEditSale?: (saleId: string) => void;
}

export function SalesTable({ onEditSale }: SalesTableProps) {
  const sales = useSalesStore((state) => state.sales);
  const updateSale = useSalesStore((state) => state.updateSale);
  const deleteSale = useSalesStore((state) => state.deleteSale);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LineStatus>('all');
  const [storeFilter, setStoreFilter] = useState<'all' | StoreLocation>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | SaleCategory>('all');
  const [bountyStatusFilter, setBountyStatusFilter] = useState<BountyStatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const filteredAndSortedSales = useMemo(() => {
    let filtered = sales;

    // Search filter (IMEI or Email)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (sale) =>
          sale.imei.toLowerCase().includes(term) ||
          sale.email.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((sale) => sale.status === statusFilter);
    }

    // Store filter
    if (storeFilter !== 'all') {
      filtered = filtered.filter((sale) => sale.storeLocation === storeFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((sale) => sale.category === categoryFilter);
    }

    // Bounty status filter
    if (bountyStatusFilter !== 'all') {
      filtered = filtered.filter((sale) => {
        const totalMonths = sale.bountyTracking.length;
        const paidMonths = sale.bountyTracking.filter((bt) => bt.paid).length;
        
        if (bountyStatusFilter === 'fully-paid') {
          return paidMonths === totalMonths;
        } else if (bountyStatusFilter === 'partially-paid') {
          return paidMonths > 0 && paidMonths < totalMonths;
        } else if (bountyStatusFilter === 'unpaid') {
          return paidMonths === 0;
        }
        return true;
      });
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'highest-earned') {
        const aEarned = a.bountyTracking
          .filter((bt) => bt.paid)
          .reduce((sum, bt) => sum + (bt.amountPaid || 0), 0);
        const bEarned = b.bountyTracking
          .filter((bt) => bt.paid)
          .reduce((sum, bt) => sum + (bt.amountPaid || 0), 0);
        return bEarned - aEarned;
      } else if (sortBy === 'lowest-earned') {
        const aEarned = a.bountyTracking
          .filter((bt) => bt.paid)
          .reduce((sum, bt) => sum + (bt.amountPaid || 0), 0);
        const bEarned = b.bountyTracking
          .filter((bt) => bt.paid)
          .reduce((sum, bt) => sum + (bt.amountPaid || 0), 0);
        return aEarned - bEarned;
      }
      return 0;
    });

    return sorted;
  }, [sales, searchTerm, statusFilter, storeFilter, categoryFilter, bountyStatusFilter, sortBy]);

  const toggleStatus = async (id: string, currentStatus: LineStatus) => {
    const newStatus: LineStatus = currentStatus === 'active' ? 'deactivated' : 'active';
    await updateSale(id, { status: newStatus });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStoreFilter('all');
    setCategoryFilter('all');
    setBountyStatusFilter('all');
    setSortBy('newest');
  };

  const activeFiltersCount = 
    (searchTerm ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (storeFilter !== 'all' ? 1 : 0) +
    (categoryFilter !== 'all' ? 1 : 0) +
    (bountyStatusFilter !== 'all' ? 1 : 0);

  return (
    <Card className="card-glow">
      <CardHeader className="border-b border-border/50">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Sales Records</CardTitle>
            <Badge variant="outline" className="border-primary/50">
              {filteredAndSortedSales.length} {filteredAndSortedSales.length === 1 ? 'sale' : 'sales'}
            </Badge>
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
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="deactivated">Deactivated</SelectItem>
                </SelectContent>
              </Select>

              {/* Store Filter */}
              <Select value={storeFilter} onValueChange={(value) => setStoreFilter(value as typeof storeFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="Store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  <SelectItem value="paris-rd">Paris Rd</SelectItem>
                  <SelectItem value="business-loop">Business Loop</SelectItem>
                  <SelectItem value="jefferson-city">Jefferson City</SelectItem>
                  <SelectItem value="sedalia">Sedalia</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as typeof categoryFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="new-line">New Line</SelectItem>
                  <SelectItem value="port-in">Port-In</SelectItem>
                  <SelectItem value="upgrade">Upgrade</SelectItem>
                  <SelectItem value="finance-postpaid">Finance/Postpaid</SelectItem>
                </SelectContent>
              </Select>

              {/* Bounty Status Filter */}
              <Select value={bountyStatusFilter} onValueChange={(value) => setBountyStatusFilter(value as BountyStatusFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="Bounty Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bounties</SelectItem>
                  <SelectItem value="fully-paid">Fully Paid</SelectItem>
                  <SelectItem value="partially-paid">Partially Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest-earned">Highest Earned</SelectItem>
                  <SelectItem value="lowest-earned">Lowest Earned</SelectItem>
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {filteredAndSortedSales.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {sales.length === 0 
              ? 'No sales records found. Add your first sale to get started.'
              : 'No sales match your filters. Try adjusting your search criteria.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">IMEI</th>
                  <th className="pb-3 pr-4 font-medium">Store</th>
                  <th className="pb-3 pr-4 font-medium">Category</th>
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">Total Earned</th>
                  <th className="pb-3 pr-4 font-medium">Bounty Progress</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Activation</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedSales.map((sale) => {
                  const totalMonths = sale.bountyTracking.length;
                  const paidMonths = sale.bountyTracking.filter((bt) => bt.paid).length;
                  const totalEarned = sale.bountyTracking
                    .filter((bt) => bt.paid)
                    .reduce((sum, bt) => sum + (bt.amountPaid || 0), 0);
                  
                  return (
                    <tr key={sale._id || sale.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="py-4 pr-4 font-mono text-sm font-medium">{sale.imei}</td>
                      <td className="py-4 pr-4">
                        <Badge variant="outline" className="border-primary/50">{storeLabels[sale.storeLocation]}</Badge>
                      </td>
                      <td className="py-4 pr-4">
                        <Badge variant="outline">{categoryLabels[sale.category]}</Badge>
                      </td>
                      <td className="py-4 pr-4 text-sm">{sale.email}</td>
                      <td className="py-4 pr-4 font-semibold text-success">{formatCurrency(totalEarned)}</td>
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
                            onClick={() => onEditSale?.(sale._id || sale.id)}
                            title="Edit sale"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStatus(sale._id || sale.id, sale.status)}
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
                            onClick={async () => await deleteSale(sale._id || sale.id)}
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
