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
        
        const totalCommissionEarned = sales.reduce((sum, sale) => sum + sale.baseCommission, 0);
        
        let monthlyBountyTotal = 0;
        let paidBounties = 0;
        let unpaidBounties = 0;

        // Calculate bounty totals - assuming each month has the same bounty amount (baseCommission / 6)
        sales.forEach((sale) => {
          const monthlyBountyAmount = sale.baseCommission / 6;
          sale.bountyTracking.forEach((bt) => {
            monthlyBountyTotal += monthlyBountyAmount;
            if (bt.paid) {
              paidBounties += monthlyBountyAmount;
            } else {
              unpaidBounties += monthlyBountyAmount;
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
