import { SieAccount, BalanceSheetItem, TimelineEvent, SieParserResult, SieVoucher } from '../types';

export const parseSieFile = (fileContent: string): SieParserResult => {
 try {
    const lines = fileContent.split(/\r?\n/);

    let companyName = "Okänt Företag";
    let fiscalYearStart = "";
    let fiscalYearEnd = "";
    const parsingWarnings: string[] = [];
    
    const accounts = new Map<string, SieAccount>();
    const openingBalances = new Map<string, number>();
    const periodChanges = new Map<string, number>();
    const vouchers: SieVoucher[] = [];
    let currentVoucher: SieVoucher | null = null;
    let hasExplicitOpeningBalance = false;
    
    const parseAmount = (amountStr: string | undefined): number => {
      if (!amountStr) return 0;
      const sanitized = amountStr.replace(/"/g, '').trim().replace(',', '.');
      
      if ((sanitized.match(/\./g) || []).length > 1) {
        throw new Error(`Ambiguous number format with multiple decimal separators.`);
      }
      
      const number = parseFloat(sanitized);
      if (isNaN(number)) {
        throw new Error(`Could not parse '${amountStr}' as a number.`);
      }
      return number;
    };

    for (const line of lines) {
      if (!line.startsWith('#')) continue;

      const tagMatch = line.match(/^#(\w+)\s+(.*)/);
      if (!tagMatch) continue;

      const [, tag, rawValue] = tagMatch;
      const value = rawValue.replace(/^"|"$/g, '').trim(); 
      
      switch (tag) {
        case 'FNAMN':
          companyName = value;
          break;
        case 'RAR': {
          const parts = value.split(' ');
          if (parts.length >= 3 && parts[0] === '0') {
            fiscalYearStart = parts[1];
            fiscalYearEnd = parts[2];
          }
          break;
        }
        case 'KONTO': {
          const parts = value.match(/(\d+)\s+"?([^"]+)"?/);
          if (parts) {
              accounts.set(parts[1], { name: parts[2].trim() });
          }
          break;
        }
        case 'IB': {
          const parts = value.split(/\s+/);
          if (parts.length >= 3 && parts[0] === '0') {
            hasExplicitOpeningBalance = true;
            const accountNumber = parts[1];
            const amount = parseAmount(parts[2]);
            openingBalances.set(accountNumber, (openingBalances.get(accountNumber) || 0) + amount);
          }
          break;
        }
        case 'UB': {
          const parts = value.split(/\s+/);
          if (parts.length >= 3 && parts[0] === '-1') {
            const accountNumber = parts[1];
            const amount = parseAmount(parts[2]);
            openingBalances.set(accountNumber, (openingBalances.get(accountNumber) || 0) + amount);
          }
          break;
        }
        case 'VER': {
          const verMatch = value.match(/(\S+)\s+(\S+)\s+(\S+)\s+"?([^"]+)"?/);
          if(verMatch) {
              const [, series, id, date, description] = verMatch;
              const voucherId = `${series}-${id}`;
              currentVoucher = {
                  id: voucherId,
                  date: date,
                  description: description,
                  transactions: []
              };
              vouchers.push(currentVoucher);
          }
          break;
        }
        case 'TRANS': {
          if (currentVoucher) {
              try {
                  const transMatch = value.match(/(\d+)\s+\{.*?\}\s+([-\d.,]+)/);
                  if (transMatch) {
                      const [, accountNumber, amountStr] = transMatch;
                      const amount = parseAmount(amountStr);
                      currentVoucher.transactions.push({ accountNumber, amount });
                      periodChanges.set(accountNumber, (periodChanges.get(accountNumber) || 0) + amount);
                  }
              } catch (e) {
                  const errorMessage = e instanceof Error ? e.message : 'Unknown parsing error';
                  return { 
                      success: false, 
                      error: 'recoverable', 
                      problematicLine: line,
                      originalFileContent: fileContent,
                      errorMessage: `Fel på transaktionsrad: ${errorMessage}`
                  };
              }
          }
          break;
        }
      }
    }
    
    if (!hasExplicitOpeningBalance && openingBalances.size > 0) {
        parsingWarnings.push("Inga '#IB 0' (ingående balans) hittades. Balanserna är baserade på '#UB -1' (utgående balans föregående år).");
    }

    if (accounts.size === 0) {
        return { success: false, error: 'fatal', message: "Inga konton hittades. Är detta en giltig SIE-fil?" };
    }

    const finalBalances = new Map<string, number>();
    const allAccountNumbers = new Set([...accounts.keys(), ...openingBalances.keys(), ...periodChanges.keys()]);

    for (const accNum of allAccountNumbers) {
      const ob = openingBalances.get(accNum) || 0;
      const trans = periodChanges.get(accNum) || 0;
      finalBalances.set(accNum, ob + trans);
    }

    const assets: BalanceSheetItem[] = [], liabilities: BalanceSheetItem[] = [], equityItems: BalanceSheetItem[] = [];
    let profitOrLoss = 0, totalLiquidity = 0, initialLiquidity = 0;

    for (const [accNum, balance] of finalBalances.entries()) {
      if (Math.abs(balance) < 0.01) continue; 
      const accountName = accounts.get(accNum)?.name || `Konto ${accNum}`;
      
      if (accNum.startsWith('1')) {
        assets.push({ accountNumber: accNum, name: accountName, amount: balance });
        if (accNum.startsWith('19')) totalLiquidity += balance;
      } else if (accNum.startsWith('20')) {
        equityItems.push({ accountNumber: accNum, name: accountName, amount: -balance });
      } else if (accNum.startsWith('2')) {
        liabilities.push({ accountNumber: accNum, name: accountName, amount: -balance });
      } else if (parseInt(accNum, 10) >= 3000) {
        profitOrLoss += balance;
      }
    }

    for(const [accNum, balance] of openingBalances.entries()){
        if (accNum.startsWith('19')) initialLiquidity += balance;
    }

    const finalProfitOrLoss = -profitOrLoss;
    if (Math.abs(finalProfitOrLoss) > 0.01) {
      equityItems.push({ accountNumber: 'result', name: 'Årets resultat', amount: finalProfitOrLoss });
    }

    const obShareCapital = openingBalances.get('2081') || 0;
    let shareCapital = Math.abs(obShareCapital) || 25000;
    
    const totalEquity = equityItems.reduce((sum, item) => sum + item.amount, 0);

    const timelineEvents: TimelineEvent[] = vouchers
      .sort((a,b) => a.date.localeCompare(b.date))
      .map(voucher => {
        const dateStr = voucher.date;
        const date = new Date(parseInt(dateStr.slice(0, 4)), parseInt(dateStr.slice(4, 6)) - 1, parseInt(dateStr.slice(6, 8)));
        let resultChange = 0, cashChange = 0;

        for (const trans of voucher.transactions) {
            if (parseInt(trans.accountNumber, 10) >= 3000) resultChange -= trans.amount;
            if (trans.accountNumber.startsWith('19')) cashChange += trans.amount;
        }
        return { date, description: voucher.description, resultChange, cashChange };
      }).filter(e => Math.abs(e.resultChange) > 0.01 || Math.abs(e.cashChange) > 0.01);
    
    return {
      success: true,
      metrics: {
          companyName,
          fiscalYearStart,
          fiscalYearEnd,
          shareCapital,
          totalEquity,
          totalLiquidity,
          initialLiquidity,
          assets: assets.sort((a,b) => a.accountNumber.localeCompare(b.accountNumber)),
          liabilities: liabilities.sort((a,b) => a.accountNumber.localeCompare(b.accountNumber)),
          equityItems: equityItems.sort((a,b) => a.accountNumber.localeCompare(b.accountNumber)),
          timelineEvents,
          vouchers: vouchers.sort((a,b) => a.date.localeCompare(b.date)),
          parsingWarnings,
      }
    };
  } catch (err) {
    console.error("Fatal SIE parsing error:", err);
    const message = err instanceof Error ? err.message : 'Ett okänt fel inträffade.';
    return {
        success: false,
        error: 'fatal',
        message: `Ett oväntat fel uppstod vid tolkningen av filen. Detta kan bero på att filen är korrupt eller har ett mycket oväntat format. Fel: ${message}`
    };
  }
};