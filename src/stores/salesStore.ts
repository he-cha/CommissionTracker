import { create } from 'zustand';
import { Sale, DashboardStats } from '../types';

interface SalesState {
  sales: Sale[];
  loading: boolean;
  error: string | null;
  fetchSales: () => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => Promise<boolean>;
  updateSale: (id: string, updates: Partial<Sale>) => Promise<boolean>;
  deleteSale: (id: string) => Promise<boolean>;
  toggleBountyPaid: (saleId: string, month: string) => Promise<boolean>;
  getDashboardStats: () => DashboardStats;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const useSalesStore = create<SalesState>((set, get) => ({
  sales: [],
  loading: false,
  error: null,

  fetchSales: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const sales = await response.json();
        set({ sales, loading: false });
      } else {
        throw new Error('Failed to fetch sales');
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addSale: async (sale) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sale),
      });

      if (response.ok) {
        const newSale = await response.json();
        set((state) => ({
          sales: [...state.sales, newSale],
          loading: false
        }));
        return true;
      } else {
        throw new Error('Failed to add sale');
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return false;
    }
  },

  updateSale: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedSale = await response.json();
        set((state) => ({
          sales: state.sales.map((sale) =>
            sale._id === id ? updatedSale : sale
          ),
          loading: false
        }));
        return true;
      } else {
        throw new Error('Failed to update sale');
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return false;
    }
  },

  deleteSale: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        set((state) => ({
          sales: state.sales.filter((sale) => sale._id !== id),
          loading: false
        }));
        return true;
      } else {
        throw new Error('Failed to delete sale');
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return false;
    }
  },

  toggleBountyPaid: async (saleId, monthNumber) => {
    const sales = get().sales;
    const sale = sales.find(s => s._id === saleId);
    if (!sale) return false;

    const bountyIndex = sale.bountyTracking.findIndex(bt => bt.monthNumber === parseInt(monthNumber));
    if (bountyIndex === -1) return false;

    const updatedBountyTracking = [...sale.bountyTracking];
    updatedBountyTracking[bountyIndex] = {
      ...updatedBountyTracking[bountyIndex],
      paid: !updatedBountyTracking[bountyIndex].paid,
      dateChecked: new Date().toISOString(),
    };

    return await get().updateSale(saleId, { bountyTracking: updatedBountyTracking });
  },

  getDashboardStats: () => {
    const sales = get().sales;

    const totalActiveLines = sales.filter((s) => s.status === 'active').length;
    const totalDeactivatedLines = sales.filter((s) => s.status === 'deactivated').length;

    let totalCommissionEarned = 0;
    let monthlyBountyTotal = 0;
    let paidBounties = 0;
    let unpaidBounties = 0;

    // Calculate bounty totals from actual amounts paid
    sales.forEach((sale) => {
      sale.bountyTracking.forEach((bt) => {
        // Always try to sum payments if they exist
        let amount = 0;
        if (bt.payments && Array.isArray(bt.payments)) {
          amount = bt.payments.reduce((sum, payment) => sum + (Number(payment?.amount) || 0), 0);
        }
        
        // Also check legacy amountPaid
        const legacyAmount = Number(bt.amountPaid) || 0;
        amount = Math.max(amount, legacyAmount);
        
        monthlyBountyTotal += amount;
        if (bt.paid && amount > 0) {
          paidBounties += amount;
          totalCommissionEarned += amount;
        } else if (amount > 0) {
          unpaidBounties += amount;
        }
      });
    });

    return {
      totalActiveLines,
      totalDeactivatedLines,
      totalCommissionEarned,
      monthlyBountyTotal,
      paidBounties,
      unpaidBounties,
    };
  },
}));
