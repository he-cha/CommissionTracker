import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Sale, DashboardStats } from '../types';

interface SalesState {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  updateSale: (id: string, updates: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  toggleBountyPaid: (saleId: string, month: string) => void;
  getDashboardStats: () => DashboardStats;
}

export const useSalesStore = create<SalesState>()(
  persist(
    (set, get) => ({
      sales: [],

      addSale: (sale) => {
        const newSale: Sale = {
          ...sale,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ sales: [...state.sales, newSale] }));
      },

      updateSale: (id, updates) => {
        set((state) => ({
          sales: state.sales.map((sale) =>
            sale.id === id ? { ...sale, ...updates } : sale
          ),
        }));
      },

      deleteSale: (id) => {
        set((state) => ({
          sales: state.sales.filter((sale) => sale.id !== id),
        }));
      },

      toggleBountyPaid: (saleId, monthNumber) => {
        set((state) => ({
          sales: state.sales.map((sale) => {
            if (sale.id === saleId) {
              return {
                ...sale,
                bountyTracking: sale.bountyTracking.map((bt) =>
                  bt.monthNumber === parseInt(monthNumber) 
                    ? { ...bt, paid: !bt.paid, dateChecked: new Date().toISOString() } 
                    : bt
                ),
              };
            }
            return sale;
          }),
        }));
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
            const amount = bt.amountPaid || 0;
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
    }),
    {
      name: 'sales-storage',
    }
  )
);
