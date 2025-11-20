export interface Assumption {
  icon: string;
  value: string;
  description: string;
}

export interface Challenge {
  icon: string;
  title: string;
  description: string;
  color: 'red' | 'orange' | 'yellow';
}

export interface ProvenImpactBox {
  enabled: boolean;
  title: string;
  mainMessage: string;
  secondaryMessage?: string;
  color: 'indigo-purple' | 'green' | 'blue';
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
  tags: string[];
  color: string;
}

export interface PricingTier {
  enabled: boolean;
  name: string;
  value: number;
  description: string;
  features: string[];
  isRecommended: boolean;
  roi: number;
  payback: number;
  reduction: number;
}

export interface RecommendationBox {
  enabled: boolean;
  recommendedTier: string;
  text: string;
  color: 'green' | 'blue' | 'purple';
}

export interface PaymentMethod {
  enabled: boolean;
  title: string;
  description: string;
  highlighted: boolean;
}

export interface InfrastructureService {
  name: string;
  logo?: {
    type: 'upload' | 'url';
    value: string;
  };
  model: string;
  volume: {
    requestsPerDay: number;
    requestsPerMonth: number;
  };
  costs: {
    costPerRequest: number;
    monthlyCost: number;
  };
  description?: string;
}

export interface Phase {
  name: string;
  duration: number;
  durationUnit: 'week' | 'month';
  description: string;
}

export interface NextStep {
  number: number;
  title: string;
  description: string;
}

export interface ProposalData {
  basic: {
    clientName: string;
    projectTitle: string;
    projectType: string;
    consultancyName: string;
    consultancyEmail: string;
  };
  context: {
    currentSituation: string;
    challenges: Challenge[];
    impact: {
      annualCost: number;
      assumptions: Assumption[];
      provenImpactBox: ProvenImpactBox;
    };
  };
  solution: {
    description: string;
    features: Feature[];
  };
  financial: {
    roi: {
      savings: number;
      gain: number;
      returnMultiplier: number;
      paybackMonths: number;
    };
    tiers: PricingTier[];
    recommendationBox: RecommendationBox;
    paymentMethods: PaymentMethod[];
  };
  infrastructure: {
    enabled: boolean;
    introduction?: string;
    services: InfrastructureService[];
    clientNote?: string;
  };
  support?: {
    enabled: boolean;
    introduction?: string;
    tiers: SupportTier[];
    recommendationBox?: SupportRecommendationBox;
  };
  timeline: {
    phases: Phase[];
    nextSteps: NextStep[];
    cta: {
      title: string;
      subtitle: string;
      buttonText: string;
    };
    sections: {
      support: boolean;
      training: boolean;
      whyUs: boolean;
    };
  };
}

export interface Proposal {
  id: string;
  user_id: string;
  client_name: string;
  project_title: string;
  status: 'draft' | 'sent' | 'approved';
  selected_tier?: string;
  total_value?: number;
  data: ProposalData;
  created_at: string;
  updated_at: string;
}

export interface ProposalContext {
  currentSituation?: string;
  challenges?: Challenge[];
  impact?: {
    introText?: string; // NOVO
    annualCost?: number;
    costDescription?: string; // NOVO
    assumptions?: Assumption[];
    provenImpactBox?: {
      enabled: boolean;
      title: string;
      mainMessage: string;
      secondaryMessage?: string;
      color: 'indigo-purple' | 'green' | 'blue';
    };
  };
}

export interface ProposalSolution {
  introText?: string; // NOVO
  description?: string;
  features?: Feature[];
}

export interface ROI {
  savings?: number;
  gain?: number;
  gainYear2?: number; // NOVO
  returnMultiplier?: number;
  paybackMonths?: number;
}

export interface ProposalTimeline {
  phases?: Phase[];
  nextSteps?: NextStep[];
  cta?: {
    title: string;
    subtitle: string;
    buttonText: string;
    whatsappLink?: string; // NOVO
  };
  sections?: {
    support?: boolean;
    training?: boolean;
    whyUs?: boolean;
  };
}

export interface SupportTier {
  enabled: boolean;
  name: string;
  value: number;
  description: string;
  features: string[];
  isRecommended: boolean;
  responseTime: string;
  availability: string;
}

export interface SupportRecommendationBox {
  enabled: boolean;
  recommendedTier: string;
  text: string;
  color: 'green' | 'blue' | 'purple';
}

export interface SupportTier {
  enabled: boolean;
  name: string;
  value: number;
  description: string;
  features: string[];
  isRecommended: boolean;
  responseTime: string;
  availability: string;
}

export interface SupportRecommendationBox {
  enabled: boolean;
  recommendedTier: string;
  text: string;
  color: 'green' | 'blue' | 'purple';
}