import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ProposalFormProvider, useProposalForm } from '../contexts/ProposalFormContext';
import { useSaveProposal } from '../hooks/useSaveProposal';
import { StepIndicator } from '../components/proposal/StepIndicator';
import { Step1Basic } from '../components/proposal/steps/Step1Basic';
import { Step2Context } from '../components/proposal/steps/Step2Context';
import { Step3Solution } from '../components/proposal/steps/Step3Solution';
import { Step4Financial } from '../components/proposal/steps/Step4Financial';
import { Step5Infrastructure } from '../components/proposal/steps/Step5Infrastructure';
import { Step6Timeline } from '../components/proposal/steps/Step6Timeline';
import { Button } from '../components/ui/button';
import { ArrowLeft, Save, Check, AlertCircle } from 'lucide-react';
import { ProposalData } from '../types/proposal';

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
        
        // Adicionar o ID da proposta aos dados básicos
        const dataWithId = {
          ...data.data,
          basic: {
            ...data.data.basic,
            proposalId: data.id,
          }
        };
        
        setInitialData(dataWithId);
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
  const { currentStep, setCurrentStep, formData } = useProposalForm();
  const { saveProposal, saving } = useSaveProposal();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
        return <Step5Infrastructure />;
      case 6:
        return <Step6Timeline />;
      default:
        return <Step1Basic />;
    }
  };

  const handleStepClick = (step: number) => {
    // Scroll suave para o topo quando mudar de etapa
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(step);
  };

  const handleQuickSave = async () => {
    try {
      setSaveError(null);
      setSaveSuccess(false);

      // Validar dados mínimos
      if (!formData.basic?.clientName || !formData.basic?.projectTitle) {
        setSaveError('Preencha pelo menos o nome do cliente e título do projeto (Etapa 1)');
        return;
      }

      // Salvar proposta
      await saveProposal(formData, formData.basic?.proposalId);
      
      // Mostrar sucesso
      setSaveSuccess(true);
      
      // Esconder mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      setSaveError(error.message || 'Erro ao salvar proposta');
      
      // Esconder mensagem de erro após 5 segundos
      setTimeout(() => {
        setSaveError(null);
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - Sticky */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
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

            {/* Botão de Salvar e Status */}
            <div className="flex items-center gap-3">
              {/* Mensagem de Status */}
              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium animate-in fade-in slide-in-from-right-2 duration-300">
                  <Check className="w-4 h-4" />
                  <span>Salvo com sucesso!</span>
                </div>
              )}

              {saveError && (
                <div className="flex items-center gap-2 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-right-2 duration-300">
                  <AlertCircle className="w-4 h-4" />
                  <span className="max-w-xs truncate">{saveError}</span>
                </div>
              )}

              {/* Botão Salvar */}
              <Button
                onClick={handleQuickSave}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
                size="default"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Proposta
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Step Indicator - Sticky abaixo do header */}
      <StepIndicator 
        currentStep={currentStep} 
        onStepClick={handleStepClick}
      />

      {/* Form Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          {renderStep()}
        </div>
      </main>
    </div>
  );
}
