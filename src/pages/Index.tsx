import { useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { Sidebar } from '@/components/Sidebar';
import { EmailList } from '@/components/EmailList';
import { QuoteValidation } from '@/components/QuoteValidation';
import { ConfigPanel } from '@/components/ConfigPanel';
import { getMockEmails, processEmails } from '@/hooks/useMockData';
import { ProcessedEmail } from '@/types/email';

type View = 'inbox' | 'quotes' | 'config';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('inbox');
  const [selectedQuote, setSelectedQuote] = useState<ProcessedEmail | null>(null);
  const [processedEmails, setProcessedEmails] = useState<ProcessedEmail[]>(() => 
    processEmails(getMockEmails())
  );

  const quotes = processedEmails.filter(e => e.isQuote);
  const pendingCount = quotes.filter(q => q.preSapDocument?.meta.validationStatus === 'pending').length;

  const handleSelectQuote = (quote: ProcessedEmail) => {
    setSelectedQuote(quote);
    setCurrentView('quotes');
  };

  const handleValidate = (updatedDoc: ProcessedEmail) => {
    setProcessedEmails(prev => 
      prev.map(e => e.email.id === updatedDoc.email.id ? updatedDoc : e)
    );
    setSelectedQuote(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader pendingCount={pendingCount} />
      
      <div className="flex flex-1">
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView}
          quotesCount={quotes.length}
          pendingCount={pendingCount}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          {currentView === 'config' && <ConfigPanel />}
          
          {currentView === 'inbox' && (
            <EmailList 
              emails={processedEmails}
              onSelectQuote={handleSelectQuote}
            />
          )}
          
          {currentView === 'quotes' && (
            <QuoteValidation 
              quotes={quotes}
              selectedQuote={selectedQuote}
              onSelectQuote={setSelectedQuote}
              onValidate={handleValidate}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
