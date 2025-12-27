export type SaleCategory = 'new-line' | 'port-in' | 'upgrade' | 'finance-postpaid';

export type LineStatus = 'active' | 'deactivated';

export type StoreLocation = 'paris-rd' | 'business-loop' | 'jefferson-city' | 'sedalia';

export interface BountyMonthTracking {
  monthNumber: number; // 1-6
  paid: boolean;
  amountPaid?: number;
  dateChecked?: string;
  notes?: string;
}

export interface Sale {
  id: string;
  imei: string;
  storeLocation: StoreLocation;
  category: SaleCategory;
  customerPin?: string;
  email: string;
  activationDate: string;
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

export interface BountyAlert {
  saleId: string;
  imei: string;
  email: string;
  monthNumber: number;
  checkDate: string;
  daysUntilCheck: number;
  isOverdue: boolean;
  isPaid: boolean;
  storeLocation?: StoreLocation;
}
