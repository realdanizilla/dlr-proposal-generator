import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ProposalFormProvider } from '../contexts/ProposalFormContext';
import { StepIndicator } from '../components/proposal/StepIndicator';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ProposalData } from '../types/proposal';
import { useProposalForm } from '../contexts/ProposalFormContext';
import { Step1Basic } from '../components/proposal/steps/Step1Basic';
import { Step2Context } from '../components/proposal/steps/Step2Context';
import { Step3Solution } from '../components/proposal/steps/Step3Solution';
import { Step4Financial } from '../components/proposal/steps/Step4Financial';

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Partial<ProposalData> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProposal = async () => {
      if (id === 'new') {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('proposals')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setInitialData(data.data);
      } catch (error) {
        console.error('Erro ao carregar proposta:', error);
        alert('Erro ao carregar proposta');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadProposal();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <ProposalFormProvider initialData={initialData || undefined} proposalId={id !== 'new' ? id : undefined}>
      <EditorContent />
    </ProposalFormProvider>
  );
}

function EditorContent() {
  const navigate = useNavigate();
  const { currentStep } = useProposalForm();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Basic />;
      case 2:
        return <Step2Context />;
      case 3:
        return <Step3Solution />;
      case 4:
        return <Step4Financial />;
      case 5:
        return <div className="text-center py-12 text-slate-600">Step 5 - Em breve</div>;
      case 6:
        return <div className="text-center py-12 text-slate-600">Step 6 - Em breve</div>;
      default:
        return <Step1Basic />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <h1 className="text-xl font-bold text-slate-900">
              Editor de Proposta
            </h1>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Form Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          {renderStep()}
        </div>
      </main>
    </div>
  );
}