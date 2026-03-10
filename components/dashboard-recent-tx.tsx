"use client";

import { Transaction } from "./transaction-form";

interface DashboardRecentTxProps {
  transactions: Transaction[];
}

export function DashboardRecentTx({ transactions }: DashboardRecentTxProps) {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getIconAndColor = (category: string, type: string) => {
    // Basic mapping for nice visuals based on image references
    if (type === 'transfer') return { icon: '⇄', bg: 'bg-blue-100', text: 'text-blue-500' };
    if (category?.toLowerCase().includes('makan') || category?.toLowerCase().includes('jajan') || category?.toLowerCase().includes('sate')) return { icon: '🍡', bg: 'bg-pink-100', text: 'text-pink-500' };
    if (category?.toLowerCase().includes('shopee') || category?.toLowerCase().includes('belanja')) return { icon: '🛍️', bg: 'bg-purple-100', text: 'text-purple-500' };
    if (type === 'income' || category?.toLowerCase().includes('hadiah') || category?.toLowerCase().includes('angpao')) return { icon: '💰', bg: 'bg-yellow-100', text: 'text-yellow-600' };
    
    // default
    return { icon: type === 'income' ? '💵' : '💳', bg: 'bg-slate-100', text: 'text-slate-500' };
  };

  // Ensure we at least show 4 things from the reference
  const renderList = transactions.length > 0 ? transactions.slice(0, 4) : [];

  return (
    <div className="bg-white dark:bg-card rounded-[2rem] border border-border/40 p-6 sm:p-8 shadow-sm h-full flex flex-col">
      <div className="mb-8 flex items-center justify-between">
        <h3 className="font-bold text-foreground text-lg">Transaksi Terbaru</h3>
      </div>
      
      <div className="flex-1 flex flex-col gap-6 w-full max-w-md">
        {renderList.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Belum ada transaksi
          </div>
        ) : (
          renderList.map((tx, idx) => {
            const isIncome = tx.type === 'income';
            const { icon, bg } = getIconAndColor(tx.category, tx.type);
            
            return (
              <div key={tx.id || idx} className="flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  {/* Icon Circle */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${bg} dark:bg-opacity-20`}>
                    {icon}
                  </div>
                  
                  {/* Details */}
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm tracking-tight truncate max-w-[150px] sm:max-w-[200px]">
                      {tx.category || tx.description}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium mt-0.5 truncate">
                      {tx.type === 'transfer' ? tx.description : tx.description || new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                
                {/* Amount */}
                <span className={`text-sm font-bold whitespace-nowrap pl-4 ${
                  isIncome ? 'text-emerald-500' : 
                  tx.type === 'transfer' ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'
                }`}>
                  {isIncome ? '+ ' : tx.type === 'expense' ? '- ' : ''}
                  {formatCurrency(Math.abs(tx.amount))}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
