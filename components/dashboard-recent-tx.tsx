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
    <div className="bg-white dark:bg-card rounded-[2rem] border border-border/40 p-5 shadow-sm flex flex-col overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-foreground text-base">Transaksi Terbaru</h3>
      </div>
      
      <div className="flex flex-col gap-3 w-full overflow-y-auto">
        {renderList.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Belum ada transaksi
          </div>
        ) : (
          renderList.map((tx, idx) => {
            const isIncome = tx.type === 'income';
            const { icon, bg } = getIconAndColor(tx.category, tx.type);
            
            return (
              <div key={tx.id || idx} className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0">
                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 mt-0.5 ${bg} dark:bg-opacity-20`}>
                  {icon}
                </div>

                {/* Info block — full width, wraps naturally */}
                <div className="flex-1 min-w-0">
                  {/* Row 1: category + amount */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {tx.category || tx.description}
                    </span>
                    <span className={`text-sm font-bold shrink-0 ${
                      isIncome ? 'text-income' :
                      tx.type === 'transfer' ? 'text-primary' : 'text-foreground'
                    }`}>
                      {isIncome ? '+ ' : tx.type === 'expense' ? '- ' : ''}
                      {formatCurrency(Math.abs(tx.amount))}
                    </span>
                  </div>
                  {/* Row 2: description + date */}
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground truncate">
                      {tx.description || '—'}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
