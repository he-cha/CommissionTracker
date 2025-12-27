export type SaleCategory = 'new-line' | 'port-in' | 'upgrade' | 'finance-postpaid';

export type LineStatus = 'active' | 'deactivated';

export type StoreLocation = 'store-1' | 'store-2' | 'store-3' | 'store-4';

export interface BountyMonthTracking {
  monthNumber: number; // 1-6
  paid: boolean;
  dateChecked?: string;
  notes?: string;
}

export interface Sale {
  id: string;
  imei: string;
  storeLocation: StoreLocation;
  category: SaleCategory;
  customerPin: string;
  activationDate: string;
  baseCommission: number;
  bountyTracking: BountyMonthTracking[];
  status: LineStatus;
  createdAt: string;
  notes?: string;
}

export interface DashboardStats {
  totalActiveLines: number;
  totalDeactivatedLines: number;
  totalCommissionEarned: number;
  monthlyBountyTotal: number;
  paidBounties: number;
  unpaidBounties: number;
}
