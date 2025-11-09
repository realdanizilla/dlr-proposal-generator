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
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import { Phase, NextStep } from '../../../types/proposal';

interface Step6FormData {
  phases: Phase[];
  nextSteps: NextStep[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
  ctaWhatsappLink: string;
  includeSupport: boolean;
  includeTraining: boolean;
  includeWhyUs: boolean;
}

export function Step6Timeline() {
  const { formData, updateFormData, setCurrentStep } = useProposalForm();
  const navigate = useNavigate();
  const { saveProposal, saving: isSaving } = useSaveProposal();
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<Step6FormData>({
    defaultValues: {
      phases: formData.timeline?.phases || [],
      nextSteps: formData.timeline?.nextSteps || [],
      ctaTitle: formData.timeline?.cta?.title || 'Pronto para transformar sua produção de conteúdo?',
      ctaSubtitle: formData.timeline?.cta?.subtitle || 'Vamos marcar a próxima conversa e dar o primeiro passo rumo à automação inteligente.',
      ctaButtonText: formData.timeline?.cta?.buttonText || 'Vamos Conversar',
      ctaWhatsappLink: formData.timeline?.cta?.whatsappLink || '',
      includeSupport: formData.timeline?.sections?.support ?? true,
      includeTraining: formData.timeline?.sections?.training ?? true,
      includeWhyUs: formData.timeline?.sections?.whyUs ?? true,
    },
  });

  const {
    fields: phaseFields,
    append: appendPhase,
    remove: removePhase,
  } = useFieldArray({
    control,
    name: 'phases',
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({
    control,
    name: 'nextSteps',
  });

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
          support: data.includeSupport,
          training: data.includeTraining,
          whyUs: data.includeWhyUs,
        },
      });

      // Construir objeto completo com todos os dados
      const completeData = {
        ...formData,
        timeline: {
          phases: data.phases,
          nextSteps: data.nextSteps,
          cta: {
            title: data.ctaTitle,
            subtitle: data.ctaSubtitle,
            buttonText: data.ctaButtonText,
          },
          sections: {
            support: data.includeSupport,
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
          Cronograma e Próximos Passos
        </h2>
        <p className="text-slate-600">
          Fases do projeto e passos para iniciar
        </p>
      </div>

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
                <div className="flex items-start justify-between">
                  <h4 className="text-md font-semibold">Fase #{index + 1}</h4>
                  {phaseFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePhase(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  )}
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
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <h4 className="text-md font-semibold">Passo #{index + 1}</h4>
                  </div>
                  {stepFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  )}
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
                {...register('includeSupport')}
                className="w-4 h-4"
              />
              <Label>☑️ Incluir seção "Suporte e Manutenção"</Label>
            </div>

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