import { createContext, useContext, useState, ReactNode } from 'react';
import { ProposalData } from '../types/proposal';

interface ProposalFormContextType {
  formData: Partial<ProposalData>;
  updateFormData: (step: keyof ProposalData, data: any) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isEditing: boolean;
  proposalId?: string;
}

const ProposalFormContext = createContext<ProposalFormContextType | undefined>(undefined);

const getDefaultFormData = (): Partial<ProposalData> => ({
  basic: {
    clientName: '',
    projectTitle: '',
    projectType: '',
    consultancyName: 'DLR.ai',
    consultancyEmail: 'danizilla@gmail.com',
  },
  context: {
    currentSituation: '',
    challenges: [],
    impact: {
      annualCost: 0,
      assumptions: [],
      provenImpactBox: {
        enabled: true,
        title: 'Impacto Comprovado',
        mainMessage: '',
        color: 'indigo-purple',
      },
    },
  },
  solution: {
    description: '',
    features: [],
  },
  financial: {
    roi: {
      savings: 0,
      gain: 0,
      returnMultiplier: 0,
      paybackMonths: 0,
    },
    tiers: [],
    recommendationBox: {
      enabled: true,
      recommendedTier: 'smart',
      text: '',
      color: 'green',
    },
    paymentMethods: [
      {
        enabled: true,
        title: 'À Vista no PIX com 5% de Desconto',
        description: 'Pagamento único no PIX com desconto especial de 5% sobre o valor total do projeto.',
        highlighted: true,
      },
      {
        enabled: true,
        title: 'Parcelado em 2x',
        description: '50% no aceite da proposta e 50% na entrega final do projeto. Sem juros.',
        highlighted: false,
      },
      {
        enabled: true,
        title: 'Parcelado em Até 5x',
        description: '30% no aceite da proposta e o restante dividido em até 4 parcelas mensais sem juros.',
        highlighted: false,
      },
    ],
  },
  infrastructure: {
    enabled: false,
    services: [],
  },
  timeline: {
    phases: [],
    nextSteps: [
      {
        number: 1,
        title: 'Escolher a Opção Desejada',
        description: 'Selecione entre MVP, Smart ou Premium conforme suas necessidades e orçamento disponível.',
      },
      {
        number: 2,
        title: 'Assinatura da Proposta e Contrato',
        description: 'Formalização do acordo através de assinatura eletrônica, definindo escopo e prazos.',
      },
      {
        number: 3,
        title: 'Início do Projeto',
        description: 'Kickoff com a equipe, início da fase de diagnóstico e primeiras entregas em até 17 dias úteis.',
      },
    ],
    cta: {
      title: 'Pronto para transformar sua produção de conteúdo?',
      subtitle: 'Vamos marcar a próxima conversa e dar o primeiro passo rumo à automação inteligente.',
      buttonText: 'Vamos Conversar',
    },
    sections: {
      support: true,
      training: true,
      whyUs: true,
    },
  },
});

export function ProposalFormProvider({ 
  children,
  initialData,
  proposalId,
}: { 
  children: ReactNode;
  initialData?: Partial<ProposalData>;
  proposalId?: string;
}) {
  const [formData, setFormData] = useState<Partial<ProposalData>>(
    initialData || getDefaultFormData()
  );
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = (step: keyof ProposalData, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [step]: data,
    }));
  };

  const value = {
    formData,
    updateFormData,
    currentStep,
    setCurrentStep,
    isEditing: !!proposalId,
    proposalId,
  };

  return (
    <ProposalFormContext.Provider value={value}>
      {children}
    </ProposalFormContext.Provider>
  );
}

export function useProposalForm() {
  const context = useContext(ProposalFormContext);
  if (context === undefined) {
    throw new Error('useProposalForm must be used within ProposalFormProvider');
  }
  return context;
}