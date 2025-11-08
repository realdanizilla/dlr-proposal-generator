import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useProposalForm } from '../../../contexts/ProposalFormContext';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent } from '../../ui/card';
import { RichTextEditor } from '../../ui/rich-text-editor';
import { IconPicker } from '../../ui/icon-picker';
import { Separator } from '../../ui/separator';
import { Plus, Trash2 } from 'lucide-react';
import { Challenge, Assumption } from '../../../types/proposal';

interface Step2FormData {
  currentSituation: string;
  challenges: Challenge[];
  annualCost: number;
  assumptions: Assumption[];
  provenImpactTitle: string;
  provenImpactMain: string;
  provenImpactSecondary: string;
  provenImpactColor: 'indigo-purple' | 'green' | 'blue';
}

export function Step2Context() {
  const { formData, updateFormData, setCurrentStep } = useProposalForm();
  const [currentSituation, setCurrentSituation] = useState(
    formData.context?.currentSituation || ''
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<Step2FormData>({
    defaultValues: {
      currentSituation: formData.context?.currentSituation || '',
      challenges: formData.context?.challenges || [],
      annualCost: formData.context?.impact?.annualCost || 0,
      assumptions: formData.context?.impact?.assumptions || [],
      provenImpactTitle: formData.context?.impact?.provenImpactBox?.title || 'Impacto Comprovado',
      provenImpactMain: formData.context?.impact?.provenImpactBox?.mainMessage || '',
      provenImpactSecondary: formData.context?.impact?.provenImpactBox?.secondaryMessage || '',
      provenImpactColor: formData.context?.impact?.provenImpactBox?.color || 'indigo-purple',
    },
  });

  const {
    fields: challengeFields,
    append: appendChallenge,
    remove: removeChallenge,
  } = useFieldArray({
    control,
    name: 'challenges',
  });

  const {
    fields: assumptionFields,
    append: appendAssumption,
    remove: removeAssumption,
  } = useFieldArray({
    control,
    name: 'assumptions',
  });

  const onSubmit = (data: Step2FormData) => {
    updateFormData('context', {
      currentSituation,
      challenges: data.challenges,
      impact: {
        annualCost: data.annualCost,
        assumptions: data.assumptions,
        provenImpactBox: {
          enabled: true,
          title: data.provenImpactTitle,
          mainMessage: data.provenImpactMain,
          secondaryMessage: data.provenImpactSecondary,
          color: data.provenImpactColor,
        },
      },
    });
    setCurrentStep(3);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Contexto e Desafios
        </h2>
        <p className="text-slate-600">
          Situação atual do cliente e principais obstáculos
        </p>
      </div>

      {/* Situação Atual */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label required>Situação Atual do Cliente</Label>
            <p className="text-sm text-slate-500 mb-2">
              💡 Dica: Descreva a situação atual do cliente
            </p>
            <RichTextEditor
              value={currentSituation}
              onChange={setCurrentSituation}
              placeholder="Atualmente, o processo de produção de conteúdo..."
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Desafios */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Principais Desafios
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendChallenge({
                  icon: 'Clock',
                  title: '',
                  description: '',
                  color: 'red',
                })
              }
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Desafio
            </Button>
          </div>

          {challengeFields.map((field, index) => (
            <Card key={field.id} className="border-l-4 border-l-slate-300">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <h4 className="text-md font-semibold">Desafio #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeChallenge(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>

                <div>
                  <Label>Escolher Ícone</Label>
                  <IconPicker
                    value={watch(`challenges.${index}.icon`)}
                    onChange={(icon) => setValue(`challenges.${index}.icon`, icon)}
                  />
                </div>

                <div>
                  <Label required>Título do Desafio</Label>
                  <Input
                    {...register(`challenges.${index}.title`, {
                      required: 'Título é obrigatório',
                    })}
                    placeholder="Tempo Desperdiçado com Tarefas Repetitivas"
                    error={!!errors.challenges?.[index]?.title}
                  />
                </div>

                <div>
                  <Label required>Descrição</Label>
                  <Textarea
                    {...register(`challenges.${index}.description`, {
                      required: 'Descrição é obrigatória',
                    })}
                    placeholder="Leitura e triagem de conteúdos dispersos..."
                    rows={3}
                    error={!!errors.challenges?.[index]?.description}
                  />
                </div>

                <div>
                  <Label>Cor de Destaque</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        {...register(`challenges.${index}.color`)}
                        value="red"
                        className="w-4 h-4"
                      />
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded" />
                        Vermelho
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        {...register(`challenges.${index}.color`)}
                        value="orange"
                        className="w-4 h-4"
                      />
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-500 rounded" />
                        Laranja
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        {...register(`challenges.${index}.color`)}
                        value="yellow"
                        className="w-4 h-4"
                      />
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded" />
                        Amarelo
                      </span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {challengeFields.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              Nenhum desafio adicionado. Clique em "Adicionar Desafio" para começar.
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Impacto Financeiro */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Impacto Financeiro
          </h3>

          <div>
            <Label required>Custo Anual Estimado das Ineficiências</Label>
            <Input
              type="number"
              {...register('annualCost', {
                required: 'Custo anual é obrigatório',
                min: 0,
              })}
              placeholder="99000"
              error={!!errors.annualCost}
            />
          </div>

          {/* Premissas */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <Label>Premissas (opcional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendAssumption({
                    icon: 'Clock',
                    value: '',
                    description: '',
                  })
                }
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Premissa
              </Button>
            </div>

            {assumptionFields.map((field, index) => (
              <Card key={field.id} className="mb-4">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-semibold">Premissa #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAssumption(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>

                  <div>
                    <Label>Ícone</Label>
                    <IconPicker
                      value={watch(`assumptions.${index}.icon`)}
                      onChange={(icon) => setValue(`assumptions.${index}.icon`, icon)}
                    />
                  </div>

                  <div>
                    <Label required>Valor/Métrica</Label>
                    <Input
                      {...register(`assumptions.${index}.value`, {
                        required: 'Valor é obrigatório',
                      })}
                      placeholder="1,5h/dia"
                      error={!!errors.assumptions?.[index]?.value}
                    />
                  </div>

                  <div>
                    <Label required>Descrição</Label>
                    <Input
                      {...register(`assumptions.${index}.description`, {
                        required: 'Descrição é obrigatória',
                      })}
                      placeholder="Tempo do owner dedicado à curadoria"
                      error={!!errors.assumptions?.[index]?.description}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Box Impacto Comprovado */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">
            💡 Impacto Comprovado (Box de Destaque)
          </h3>

          <div>
            <Label required>Título</Label>
            <Input
              {...register('provenImpactTitle', {
                required: 'Título é obrigatório',
              })}
              placeholder="Impacto Comprovado"
              error={!!errors.provenImpactTitle}
            />
          </div>

          <div>
            <Label required>Mensagem Principal</Label>
            <Textarea
              {...register('provenImpactMain', {
                required: 'Mensagem principal é obrigatória',
              })}
              placeholder="Com base em dados reais de tempo gasto..."
              rows={3}
              error={!!errors.provenImpactMain}
            />
          </div>

          <div>
            <Label>Mensagem Secundária (opcional)</Label>
            <Textarea
              {...register('provenImpactSecondary')}
              placeholder="E você libera 25 horas suas por mês..."
              rows={2}
            />
          </div>

          <div>
            <Label>Cor do Box</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  {...register('provenImpactColor')}
                  value="indigo-purple"
                  className="w-4 h-4"
                />
                <span>Indigo-Purple</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  {...register('provenImpactColor')}
                  value="green"
                  className="w-4 h-4"
                />
                <span>Green</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  {...register('provenImpactColor')}
                  value="blue"
                  className="w-4 h-4"
                />
                <span>Blue</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(1)}
        >
          ← Anterior
        </Button>
        <Button type="submit" size="lg">
          Próximo →
        </Button>
      </div>
    </form>
  );
}