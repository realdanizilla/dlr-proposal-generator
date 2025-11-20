import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useProposalForm } from '../../../contexts/ProposalFormContext';
import { useSaveProposal } from '../../../hooks/useSaveProposal';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent } from '../../ui/card';
import { Separator } from '../../ui/separator';
import { Select } from '../../ui/select';
import { Alert, AlertDescription } from '../../ui/alert';
import { RichTextEditor } from '../../ui/rich-text-editor';
import { Plus, Trash2, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { Phase, NextStep, SupportTier } from '../../../types/proposal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Step6FormData {
  // Support
  supportEnabled: boolean;
  supportIntroduction: string;
  supportTiers: SupportTier[];
  supportRecommendationEnabled: boolean;
  supportRecommendationTier: string;
  supportRecommendationText: string;
  supportRecommendationColor: 'green' | 'blue' | 'purple';
  
  // Timeline
  phases: Phase[];
  nextSteps: NextStep[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
  ctaWhatsappLink: string;
  includeTraining: boolean;
  includeWhyUs: boolean;
}

const DEFAULT_SUPPORT_TIERS: SupportTier[] = [
  {
    enabled: true,
    name: 'Básico',
    value: 500,
    description: '<p>Suporte essencial para manter o sistema funcionando</p>',
    features: [],
    isRecommended: false,
    responseTime: '48h',
    availability: 'Dias úteis, 9h-18h',
  },
  {
    enabled: true,
    name: 'Profissional',
    value: 1200,
    description: '<p>Suporte completo com melhorias mensais</p>',
    features: [],
    isRecommended: true,
    responseTime: '24h',
    availability: 'Dias úteis, 9h-18h',
  },
  {
    enabled: true,
    name: 'Enterprise',
    value: 2500,
    description: '<p>Suporte premium com prioridade máxima</p>',
    features: [],
    isRecommended: false,
    responseTime: '4h',
    availability: '24/7',
  },
];

export function Step6Timeline() {
  const { formData, updateFormData, setCurrentStep } = useProposalForm();
  const navigate = useNavigate();
  const { saveProposal, saving: isSaving } = useSaveProposal();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [supportTierDescriptions, setSupportTierDescriptions] = useState<{ [key: number]: string }>({});

  const initialSupportTiers = formData.support?.tiers && formData.support.tiers.length > 0
    ? formData.support.tiers
    : DEFAULT_SUPPORT_TIERS;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<Step6FormData>({
    defaultValues: {
      supportEnabled: formData.support?.enabled ?? false,
      supportIntroduction: formData.support?.introduction || '',
      supportTiers: initialSupportTiers,
      supportRecommendationEnabled: formData.support?.recommendationBox?.enabled ?? true,
      supportRecommendationTier: formData.support?.recommendationBox?.recommendedTier || 'Profissional',
      supportRecommendationText: formData.support?.recommendationBox?.text || 'O plano Profissional oferece o melhor equilíbrio entre suporte ágil, melhorias contínuas e custo-benefício. Ideal para garantir que o sistema evolua conforme suas necessidades.',
      supportRecommendationColor: formData.support?.recommendationBox?.color || 'green',
      
      phases: formData.timeline?.phases || [],
      nextSteps: formData.timeline?.nextSteps || [],
      ctaTitle: formData.timeline?.cta?.title || 'Pronto para transformar sua produção de conteúdo?',
      ctaSubtitle: formData.timeline?.cta?.subtitle || 'Vamos marcar a próxima conversa e dar o primeiro passo rumo à automação inteligente.',
      ctaButtonText: formData.timeline?.cta?.buttonText || 'Vamos Conversar',
      ctaWhatsappLink: formData.timeline?.cta?.whatsappLink || '',
      includeTraining: formData.timeline?.sections?.training ?? true,
      includeWhyUs: formData.timeline?.sections?.whyUs ?? true,
    },
  });

  const {
    fields: supportTierFields,
    append: appendSupportTier,
    remove: removeSupportTier,
  } = useFieldArray({
    control,
    name: 'supportTiers',
  });

  const {
    fields: phaseFields,
    append: appendPhase,
    remove: removePhase,
    move: movePhase,
  } = useFieldArray({
    control,
    name: 'phases',
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
    move: moveStep,
  } = useFieldArray({
    control,
    name: 'nextSteps',
  });

  // Inicializar planos de suporte se necessário
  useEffect(() => {
    if (!initialized && supportTierFields.length === 0) {
      reset({
        supportEnabled: formData.support?.enabled ?? false,
        supportIntroduction: formData.support?.introduction || '',
        supportTiers: initialSupportTiers,
        supportRecommendationEnabled: formData.support?.recommendationBox?.enabled ?? true,
        supportRecommendationTier: formData.support?.recommendationBox?.recommendedTier || 'Profissional',
        supportRecommendationText: formData.support?.recommendationBox?.text || 'O plano Profissional oferece o melhor equilíbrio entre suporte ágil, melhorias contínuas e custo-benefício. Ideal para garantir que o sistema evolua conforme suas necessidades.',
        supportRecommendationColor: formData.support?.recommendationBox?.color || 'green',
        
        phases: formData.timeline?.phases || [],
        nextSteps: formData.timeline?.nextSteps || [],
        ctaTitle: formData.timeline?.cta?.title || 'Pronto para transformar sua produção de conteúdo?',
        ctaSubtitle: formData.timeline?.cta?.subtitle || 'Vamos marcar a próxima conversa e dar o primeiro passo rumo à automação inteligente.',
        ctaButtonText: formData.timeline?.cta?.buttonText || 'Vamos Conversar',
        ctaWhatsappLink: formData.timeline?.cta?.whatsappLink || '',
        includeTraining: formData.timeline?.sections?.training ?? true,
        includeWhyUs: formData.timeline?.sections?.whyUs ?? true,
      });
      setInitialized(true);
    }
  }, [initialized, supportTierFields.length, reset, formData, initialSupportTiers]);

  // Inicializar descrições dos planos de suporte
  useEffect(() => {
    if (supportTierFields.length > 0) {
      const descriptions: { [key: number]: string } = {};
      supportTierFields.forEach((field, index) => {
        const desc = watch(`supportTiers.${index}.description`);
        if (desc && !supportTierDescriptions[index]) {
          descriptions[index] = desc;
        }
      });
      if (Object.keys(descriptions).length > 0) {
        setSupportTierDescriptions((prev) => ({ ...prev, ...descriptions }));
      }
    }
  }, [supportTierFields, watch]);

  // Inicializar fases e passos padrão
  useEffect(() => {
    if (phaseFields.length === 0) {
      const defaultPhases: Phase[] = [
        {
          name: 'Planejamento',
          duration: 1,
          durationUnit: 'week',
          description: 'Kickoff, alinhamento de escopo, definição de metas e métricas de sucesso',
        },
        {
          name: 'Mapeamento e Design',
          duration: 1,
          durationUnit: 'week',
          description: 'Revisão de processos, definição de fluxos as is e to be, arquitetura técnica',
        },
        {
          name: 'Desenvolvimento',
          duration: 2,
          durationUnit: 'week',
          description: 'Criação das automações, agentes e integrações',
        },
        {
          name: 'Testes e Validação',
          duration: 2,
          durationUnit: 'week',
          description: 'Testes pelo cliente, simulações de uso real e ajustes finos',
        },
        {
          name: 'Treinamento e Entrega',
          duration: 1,
          durationUnit: 'week',
          description: 'Capacitação prática, entrega de documentação e handover completo',
        },
      ];
      defaultPhases.forEach(phase => appendPhase(phase));
    }

    if (stepFields.length === 0) {
      const defaultSteps: NextStep[] = [
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
          description: 'Kickoff com a equipe, início da fase de diagnóstico e primeiras entregas.',
        },
      ];
      defaultSteps.forEach(step => appendStep(step));
    }
  }, [phaseFields.length, stepFields.length, appendPhase, appendStep]);

  const handleSupportDescriptionChange = (index: number, value: string) => {
    setSupportTierDescriptions((prev) => ({ ...prev, [index]: value }));
    setValue(`supportTiers.${index}.description`, value, { shouldDirty: true });
  };

  // Funções de reordenação para Fases
  const movePhaseUp = (index: number) => {
    if (index > 0) {
      movePhase(index, index - 1);
    }
  };

  const movePhaseDown = (index: number) => {
    if (index < phaseFields.length - 1) {
      movePhase(index, index + 1);
    }
  };

  // Funções de reordenação para Próximos Passos
  const moveStepUp = (index: number) => {
    if (index > 0) {
      moveStep(index, index - 1);
    }
  };

  const moveStepDown = (index: number) => {
    if (index < stepFields.length - 1) {
      moveStep(index, index + 1);
    }
  };

  // Calcular prazo total
  const calculateTotalDuration = () => {
    let totalWeeks = 0;
    phaseFields.forEach((field, index) => {
      const duration = Number(watch(`phases.${index}.duration`)) || 0;
      const unit = watch(`phases.${index}.durationUnit`);
      if (unit === 'week') {
        totalWeeks += duration;
      } else if (unit === 'month') {
        totalWeeks += duration * 4;
      }
    });
    return totalWeeks;
  };

  const onSubmit = async (data: Step6FormData) => {
    try {
      setSaveError(null);

      // Atualizar dados de suporte
      updateFormData('support', {
        enabled: data.supportEnabled,
        introduction: data.supportIntroduction,
        tiers: data.supportTiers,
        recommendationBox: {
          enabled: data.supportRecommendationEnabled,
          recommendedTier: data.supportRecommendationTier,
          text: data.supportRecommendationText,
          color: data.supportRecommendationColor,
        },
      });

      // Atualizar dados do timeline no contexto
      updateFormData('timeline', {
        phases: data.phases,
        nextSteps: data.nextSteps,
        cta: {
          title: data.ctaTitle,
          subtitle: data.ctaSubtitle,
          buttonText: data.ctaButtonText,
          whatsappLink: data.ctaWhatsappLink,
        },
        sections: {
          training: data.includeTraining,
          whyUs: data.includeWhyUs,
        },
      });

      // Construir objeto completo com todos os dados
      const completeData = {
        ...formData,
        support: {
          enabled: data.supportEnabled,
          introduction: data.supportIntroduction,
          tiers: data.supportTiers,
          recommendationBox: {
            enabled: data.supportRecommendationEnabled,
            recommendedTier: data.supportRecommendationTier,
            text: data.supportRecommendationText,
            color: data.supportRecommendationColor,
          },
        },
        timeline: {
          phases: data.phases,
          nextSteps: data.nextSteps,
          cta: {
            title: data.ctaTitle,
            subtitle: data.ctaSubtitle,
            buttonText: data.ctaButtonText,
            whatsappLink: data.ctaWhatsappLink,
          },
          sections: {
            training: data.includeTraining,
            whyUs: data.includeWhyUs,
          },
        },
      };

      // Salvar no banco
      await saveProposal(completeData, formData.basic?.proposalId);

      // Redirecionar para o dashboard
      alert('✅ Proposta salva com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      setSaveError(error.message || 'Erro ao salvar proposta. Tente novamente.');
    }
  };

  const totalWeeks = calculateTotalDuration();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Suporte, Cronograma e Próximos Passos
        </h2>
        <p className="text-slate-600">
          Planos de suporte, fases do projeto e passos para iniciar
        </p>
      </div>

      {/* Planos de Suporte */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-6">
            <input
              type="checkbox"
              {...register('supportEnabled')}
              className="w-4 h-4"
            />
            <Label className="text-lg font-semibold">
              ☑️ Incluir Seção de Planos de Suporte
            </Label>
          </div>

          {watch('supportEnabled') && (
            <>
              <div className="mb-6">
                <Label>Introdução da Seção (opcional)</Label>
                <Textarea
                  {...register('supportIntroduction')}
                  placeholder="Oferecemos diferentes níveis de suporte para manter seu sistema..."
                  rows={3}
                />
              </div>

              <Separator className="my-6" />

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Planos de Suporte
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendSupportTier({
                      enabled: true,
                      name: '',
                      value: 0,
                      description: '<p></p>',
                      features: [],
                      isRecommended: false,
                      responseTime: '24h',
                      availability: 'Dias úteis',
                    })
                  }
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Plano
                </Button>
              </div>

              {supportTierFields.map((field, index) => (
                <Card
                  key={field.id}
                  className={`mb-4 ${watch(`supportTiers.${index}.isRecommended`) ? 'border-2 border-purple-500' : ''}`}
                >
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register(`supportTiers.${index}.enabled`)}
                          className="w-4 h-4"
                        />
                        <Label className="text-lg font-semibold">
                          Habilitar Plano {watch(`supportTiers.${index}.name`) || `#${index + 1}`}
                        </Label>
                      </div>
                      {supportTierFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSupportTier(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome do Plano</Label>
                        <Input
                          {...register(`supportTiers.${index}.name`)}
                          placeholder="Básico"
                        />
                      </div>

                      <div>
                        <Label>Valor Mensal (R$)</Label>
                        <Input
                          type="number"
                          {...register(`supportTiers.${index}.value`, {
                            min: 0,
                          })}
                          placeholder="500"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Descrição (Rich Text - com bullets)</Label>
                      <RichTextEditor
                        value={supportTierDescriptions[index] || ''}
                        onChange={(value) => handleSupportDescriptionChange(index, value)}
                        placeholder="Suporte essencial para manter o sistema funcionando..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Tempo de Resposta</Label>
                        <Input
                          {...register(`supportTiers.${index}.responseTime`)}
                          placeholder="24h"
                        />
                      </div>

                      <div>
                        <Label>Disponibilidade</Label>
                        <Input
                          {...register(`supportTiers.${index}.availability`)}
                          placeholder="Dias úteis, 9h-18h"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...register(`supportTiers.${index}.isRecommended`)}
                        className="w-4 h-4"
                      />
                      <Label>Marcar como Recomendado ⭐</Label>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Separator className="my-6" />

              {/* Recomendação DLR para Suporte */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('supportRecommendationEnabled')}
                      className="w-4 h-4"
                    />
                    <h3 className="text-lg font-semibold text-slate-900">
                      💡 Recomendação DLR (Box de Destaque)
                    </h3>
                  </div>

                  {watch('supportRecommendationEnabled') && (
                    <>
                      <div>
                        <Label>Plano Recomendado</Label>
                        <select
                          {...register('supportRecommendationTier')}
                          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                        >
                          {supportTierFields.map((field, index) => (
                            <option key={field.id} value={watch(`supportTiers.${index}.name`)}>
                              {watch(`supportTiers.${index}.name`) || `Plano ${index + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label>Texto da Recomendação</Label>
                        <Textarea
                          {...register('supportRecommendationText')}
                          placeholder="O plano Profissional oferece o melhor equilíbrio..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>Cor do Box</Label>
                        <div className="flex gap-4 mt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              {...register('supportRecommendationColor')}
                              value="green"
                              className="w-4 h-4"
                            />
                            <span>Green</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              {...register('supportRecommendationColor')}
                              value="blue"
                              className="w-4 h-4"
                            />
                            <span>Blue</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              {...register('supportRecommendationColor')}
                              value="purple"
                              className="w-4 h-4"
                            />
                            <span>Purple</span>
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Fases do Projeto */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Fases do Projeto
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendPhase({
                  name: '',
                  duration: 1,
                  durationUnit: 'week',
                  description: '',
                })
              }
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Fase
            </Button>
          </div>

          {phaseFields.map((field, index) => (
            <Card key={field.id} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="text-md font-semibold">Fase #{index + 1}</h4>
                    </div>

                    <div>
                      <Label required>Nome da Fase</Label>
                      <Input
                        {...register(`phases.${index}.name`, {
                          required: 'Nome é obrigatório',
                        })}
                        placeholder="Planejamento"
                        error={!!errors.phases?.[index]?.name}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label required>Duração</Label>
                        <Input
                          type="number"
                          {...register(`phases.${index}.duration`, {
                            required: 'Duração é obrigatória',
                            min: 1,
                          })}
                          placeholder="1"
                          error={!!errors.phases?.[index]?.duration}
                        />
                      </div>

                      <div>
                        <Label required>Unidade</Label>
                        <Select {...register(`phases.${index}.durationUnit`)}>
                          <option value="week">Semana(s)</option>
                          <option value="month">Mês(es)</option>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label required>Descrição</Label>
                      <Textarea
                        {...register(`phases.${index}.description`, {
                          required: 'Descrição é obrigatória',
                        })}
                        placeholder="Kickoff, alinhamento de escopo..."
                        rows={2}
                        error={!!errors.phases?.[index]?.description}
                      />
                    </div>
                  </div>

                  {/* Botões de controle */}
                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => movePhaseUp(index)}
                      disabled={index === 0}
                      className={index === 0 ? 'opacity-30 cursor-not-allowed' : ''}
                      title="Mover para cima"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => movePhaseDown(index)}
                      disabled={index === phaseFields.length - 1}
                      className={index === phaseFields.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}
                      title="Mover para baixo"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    {phaseFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePhase(index)}
                        className="mt-2"
                        title="Remover fase"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Prazo Total */}
          <Alert variant="info">
            <AlertDescription>
              <strong>Prazo Total Estimado:</strong> {totalWeeks} semana(s)
              {totalWeeks >= 4 && ` (aproximadamente ${Math.round(totalWeeks / 4)} mês(es))`}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Separator />

      {/* Próximos Passos */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Próximos Passos
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const nextNumber = stepFields.length + 1;
                appendStep({
                  number: nextNumber,
                  title: '',
                  description: '',
                });
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Passo
            </Button>
          </div>

          {stepFields.map((field, index) => (
            <Card key={field.id} className="border-l-4 border-l-green-500">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <h4 className="text-md font-semibold">Passo #{index + 1}</h4>
                    </div>

                    <div>
                      <Label required>Título</Label>
                      <Input
                        {...register(`nextSteps.${index}.title`, {
                          required: 'Título é obrigatório',
                        })}
                        placeholder="Escolher a Opção Desejada"
                        error={!!errors.nextSteps?.[index]?.title}
                      />
                    </div>

                    <div>
                      <Label required>Descrição</Label>
                      <Textarea
                        {...register(`nextSteps.${index}.description`, {
                          required: 'Descrição é obrigatória',
                        })}
                        placeholder="Selecione entre MVP, Smart ou Premium..."
                        rows={2}
                        error={!!errors.nextSteps?.[index]?.description}
                      />
                    </div>
                  </div>

                  {/* Botões de controle */}
                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveStepUp(index)}
                      disabled={index === 0}
                      className={index === 0 ? 'opacity-30 cursor-not-allowed' : ''}
                      title="Mover para cima"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveStepDown(index)}
                      disabled={index === stepFields.length - 1}
                      className={index === stepFields.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}
                      title="Mover para baixo"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    {stepFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStep(index)}
                        className="mt-2"
                        title="Remover passo"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Separator />

      {/* Call-to-Action Final */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Call-to-Action Final
          </h3>

          <div>
            <Label required>Título</Label>
            <Input
              {...register('ctaTitle', {
                required: 'Título é obrigatório',
              })}
              placeholder="Pronto para transformar..."
              error={!!errors.ctaTitle}
            />
          </div>

          <div>
            <Label required>Subtítulo</Label>
            <Textarea
              {...register('ctaSubtitle', {
                required: 'Subtítulo é obrigatório',
              })}
              placeholder="Vamos marcar a próxima conversa..."
              rows={2}
              error={!!errors.ctaSubtitle}
            />
          </div>

          <div>
            <Label required>Texto do Botão</Label>
            <Input
              {...register('ctaButtonText', {
                required: 'Texto do botão é obrigatório',
              })}
              placeholder="Vamos Conversar"
              error={!!errors.ctaButtonText}
            />
          </div>

          <div>
            <Label>Link do WhatsApp (opcional)</Label>
            <Input
              {...register('ctaWhatsappLink')}
              placeholder="https://wa.me/5511999999999"
            />
            <p className="text-xs text-slate-500 mt-1">
              Formato: https://wa.me/5511999999999 (com código do país e DDD)
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Seções Adicionais */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Seções Adicionais
          </h3>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('includeTraining')}
                className="w-4 h-4"
              />
              <Label>☑️ Incluir seção "Treinamento"</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('includeWhyUs')}
                className="w-4 h-4"
              />
              <Label>☑️ Incluir seção "Por que escolher DLR"</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {saveError && (
        <Alert variant="danger">
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      <Alert variant="success">
        <CheckCircle className="w-4 h-4" />
        <AlertDescription>
          <strong>Parabéns!</strong> Você completou todos os campos do formulário. 
          Clique em "Salvar Proposta" para finalizar.
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(5)}
          disabled={isSaving}
        >
          ← Anterior
        </Button>
        <Button 
          type="submit" 
          size="lg" 
          className="bg-green-600 hover:bg-green-700"
          disabled={isSaving}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Proposta'}
        </Button>
      </div>
    </form>
  );
}