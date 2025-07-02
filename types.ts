export interface BalanceSheetItem {
  accountNumber: string;
  name: string;
  amount: number;
}

export interface TimelineEvent {
  date: Date;
  description: string;
  resultChange: number;
  cashChange: number;
}

export interface SieVoucher {
  id: string;
  date: string;
  description: string;
  transactions: { accountNumber: string; amount: number }[];
}

export interface FinancialMetrics {
  companyName: string;
  fiscalYearStart: string;
  fiscalYearEnd: string;
  shareCapital: number;
  totalEquity: number;
  totalLiquidity: number;
  initialLiquidity: number;
  assets: BalanceSheetItem[];
  liabilities: BalanceSheetItem[];
  equityItems: BalanceSheetItem[];
  timelineEvents: TimelineEvent[];
  vouchers: SieVoucher[];
  parsingWarnings: string[];
}

export interface SieAccount {
  name: string;
}

export interface LogicalIssue {
    type: 'BalanceSheet' | 'Voucher' | 'Date' | 'Ambiguity';
    severity: 'error' | 'warning';
    message: string;
    details?: any;
}


export type SieParserResult = 
  | { success: true; metrics: FinancialMetrics }
  | { 
      success: false; 
      error: 'recoverable'; 
      problematicLine: string; 
      originalFileContent: string;
      errorMessage: string;
    }
  | { 
      success: false; 
      error: 'fatal'; 
      message: string; 
    };