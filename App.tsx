
import React, { useState, useCallback, useEffect } from 'react';
import { FinancialMetrics, SieParserResult, LogicalIssue } from './types';
import { parseSieFile } from './services/sieParser';
import { validateFinancialMetrics } from './services/logicalValidator';
import FileUpload from './components/FileUpload';
import CompanyPulse from './components/CompanyPulse';
import AiErrorAssistant from './components/AiErrorAssistant';
import AiChatAssistant from './components/AiChatAssistant';
import { ShieldExclamationIcon } from './components/icons/ShieldExclamationIcon';

type AppState =
  | 'idle'
  | 'parsing'
  | 'awaitingSyntaxFix'
  | 'validatingLogic'
  | 'awaitingLogicFix'
  | 'success'
  | 'fatalError';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null);
  const [fatalError, setFatalError] = useState<string>('');
  const [parsingErrorDetails, setParsingErrorDetails] = useState<{
    problematicLine: string;
    originalFileContent: string;
    errorMessage: string;
  } | null>(null);
  const [logicalIssues, setLogicalIssues] = useState<LogicalIssue[]>([]);
  const [currentFileContent, setCurrentFileContent] = useState<string | null>(null);

  const processAndValidate = useCallback((fileContent: string) => {
    // Start of flow
    setAppState('parsing');
    setFatalError('');
    setParsingErrorDetails(null);
    setLogicalIssues([]);
    setFinancialMetrics(null);
    setCurrentFileContent(fileContent);

    setTimeout(() => {
      const parseResult: SieParserResult = parseSieFile(fileContent);

      if (parseResult.success) {
        // Parsing succeeded
        setAppState('validatingLogic');
        const validationIssues = validateFinancialMetrics(parseResult.metrics);
        if (validationIssues.length > 0) {
          setLogicalIssues(validationIssues);
          setFinancialMetrics(parseResult.metrics); // We have metrics, but they're flawed
          setAppState('awaitingLogicFix');
        } else {
          setFinancialMetrics(parseResult.metrics);
          setAppState('success');
        }
      } else {
        // Handle errors: parseResult.success is false
        // The type guard might fail in some TS versions, so we make it explicit.
        const errorResult = parseResult as Extract<SieParserResult, { success: false }>;
        if (errorResult.error === 'recoverable') {
          setParsingErrorDetails({
            problematicLine: errorResult.problematicLine,
            originalFileContent: errorResult.originalFileContent,
            errorMessage: errorResult.errorMessage,
          });
          setAppState('awaitingSyntaxFix');
        } else { // fatal error
          setFatalError(`Fel vid bearbetning av SIE-fil: ${errorResult.message}`);
          setAppState('fatalError');
        }
      }
    }, 100);
  }, []);

  const handleReset = () => {
    setAppState('idle');
    setFinancialMetrics(null);
    setFatalError('');
    setParsingErrorDetails(null);
    setLogicalIssues([]);
    setCurrentFileContent(null);
  };
  
  const handleLogicIssuesAccepted = () => {
    // User has seen the logical issues and wants to proceed anyway
    if (financialMetrics) {
        setAppState('success');
    } else {
        // Should not happen, but as a fallback
        handleReset();
    }
  };


  const handleAiSyntaxCorrection = (correctedLine: string) => {
    if (parsingErrorDetails) {
      const newFileContent = parsingErrorDetails.originalFileContent.replace(
        parsingErrorDetails.problematicLine,
        correctedLine
      );
      // Re-run the entire validation flow with the corrected content
      processAndValidate(newFileContent);
    }
  };

  const renderContent = () => {
    switch (appState) {
      case 'parsing':
      case 'validatingLogic':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-300 animate-pulse">
              {appState === 'parsing' ? 'Tolkar SIE-fil...' : 'Kör logisk validering...'}
            </h2>
            <p className="text-gray-400">Ett ögonblick, vi analyserar din bokföring.</p>
          </div>
        );
      case 'awaitingSyntaxFix':
        return parsingErrorDetails ? (
          <AiErrorAssistant
            problematicLine={parsingErrorDetails.problematicLine}
            errorMessage={parsingErrorDetails.errorMessage}
            onAccept={handleAiSyntaxCorrection}
            onReject={handleReset}
          />
        ) : null;
      case 'awaitingLogicFix':
          return (
              <AiChatAssistant 
                issues={logicalIssues}
                onAccept={handleLogicIssuesAccepted}
                onReject={handleReset}
              />
          );
      case 'success':
        return financialMetrics ? (
          <CompanyPulse metrics={financialMetrics} onReset={handleReset} />
        ) : null;
      case 'fatalError':
        return (
          <div className="text-center bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-lg mx-auto">
            <ShieldExclamationIcon className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h2 className="text-2xl font-semibold text-red-300 mb-2">Oj, ett allvarligt fel inträffade</h2>
            <p className="text-red-400 mb-6">{fatalError}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-md font-semibold transition-colors"
            >
              Börja om
            </button>
          </div>
        );
      case 'idle':
      default:
        return <FileUpload onFileProcessed={processAndValidate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 transition-all duration-500">
      {renderContent()}
    </div>
  );
};

export default App;