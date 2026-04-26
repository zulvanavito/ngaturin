"use client";

interface BudgetProgressProps {
  category: string;
  spent: number;
  budget: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function BudgetProgress({ category, spent, budget }: BudgetProgressProps) {
  const percentage = Math.min((spent / budget) * 100, 100);
  
  // Hitung persentase murni untuk warna tanpa di-cap ke 100%
  const calcPercentage = (spent / budget) * 100;
  
  let colorClass = "bg-emerald-500"; // Aman (< 75%)
  if (calcPercentage >= 90) {
    colorClass = "bg-red-500"; // Bahaya (> 90%)
  } else if (calcPercentage >= 75) {
    colorClass = "bg-amber-500"; // Peringatan (75% - 89%)
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end text-sm">
        <div>
          <span className="font-medium text-foreground">{category}</span>
          <span className="text-muted-foreground ml-2">
            {formatCurrency(spent)} / {formatCurrency(budget)}
          </span>
        </div>
        <span className={`font-medium ${calcPercentage >= 90 ? 'text-red-500' : calcPercentage >= 75 ? 'text-amber-500' : 'text-emerald-500'}`}>
          {calcPercentage.toFixed(0)}%
        </span>
      </div>
      {/* Menggunakan div murni karena Progress shadcn susah di-override warnanya dinamis tanpa custom CSS class */}
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-in-out ${colorClass}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
