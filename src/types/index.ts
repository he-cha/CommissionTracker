export type SaleCategory = 'new-line' | 'port-in' | 'upgrade' | 'finance-postpaid' | 'add-a-line' | 'port-in-add-a-line' | 'byod';

export type LineStatus = 'active' | 'deactivated';

export type StoreLocation = 'paris-rd' | 'business-loop' | 'jefferson-city' | 'sedalia';

export interface Payment {
  type: string;
  amount: number;
}

export interface BountyMonthTracking {
  monthNumber: number; // 1-6
  paid: boolean;
  payments: Payment[];
  datePaid?: string;
  dateChecked?: string; // For backward compatibility
  notes?: string;
}

export interface Sale {
  id?: string; // For backward compatibility
  _id?: string; // MongoDB ID
  imei: string;
  storeLocation: StoreLocation;
  category: SaleCategory;
  customerName?: string;
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
