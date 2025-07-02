import { FinancialMetrics, LogicalIssue } from '../types';

export const validateFinancialMetrics = (metrics: FinancialMetrics): LogicalIssue[] => {
    const issues: LogicalIssue[] = [];

    // 1. Balance Sheet Check
    const totalAssets = metrics.assets.reduce((sum, item) => sum + item.amount, 0);
    const totalLiabilitiesAndEquity = 
        metrics.liabilities.reduce((sum, item) => sum + item.amount, 0) +
        metrics.equityItems.reduce((sum, item) => sum + item.amount, 0);
    
    const difference = totalAssets - totalLiabilitiesAndEquity;

    if (Math.abs(difference) > 1) { // Allow for minor rounding differences up to 1 kr
        issues.push({
            type: 'BalanceSheet',
            severity: 'error',
            message: 'Balansräkningen balanserar inte.',
            details: {
                totalAssets,
                totalLiabilitiesAndEquity,
                difference
            }
        });
    }

    // 2. Voucher Balance Check
    for (const voucher of metrics.vouchers) {
        const voucherSum = voucher.transactions.reduce((sum, trans) => sum + trans.amount, 0);
        if (Math.abs(voucherSum) > 0.01) { // Check for sums not being zero
            issues.push({
                type: 'Voucher',
                severity: 'error',
                message: `Verifikationen '${voucher.id}' balanserar inte.`,
                details: {
                    voucherId: voucher.id,
                    description: voucher.description,
                    imbalance: voucherSum,
                    transactionCount: voucher.transactions.length
                }
            });
        }
    }

    // 3. Ambiguity Check for Opening Balances
    if (metrics.parsingWarnings.some(w => w.includes("#UB -1"))) {
        issues.push({
            type: 'Ambiguity',
            severity: 'warning',
            message: "Ingående balanser baseras på föregående års utgående balanser (#UB -1).",
            details: "Detta är vanligt i SIE-filer, men det är bra att bekräfta att det är avsikten. Appen har tolkat dessa som årets ingående balanser."
        });
    }

    return issues;
};
