import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useProposalForm } from '../../../contexts/ProposalFormContext';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent } from '../../ui/card';
import { Separator } from '../../ui/separator';
import { RichTextEditor } from '../../ui/rich-text-editor';
import { Plus, Trash2, Star } from 'lucide-react';
import { PricingTier, PaymentMethod } from '../../../types/proposal';

interface Step4FormData {
  savings: number;
  gain: number;
  gainYear2: number;
  returnMultiplier: number;
  paybackMonths: number;
  tiers: PricingTier[];
  recommendationEnabled: boolean;
  recommendationTier: string;
  recommendationText: string;
  recommendationColor: 'green' | 'blue' | 'purple';
  paymentMethods: PaymentMethod[];
}

const DEFAULT_TIERS: PricingTier[] = [
  {
    enabled: true,
    name: 'MVP',
    value: 15000,
    description: '<p>Entrega funcional mínima com geração de valor imediata</p>',
    features: [],
    isRecommended: false,
    roi: 169,
    payback: 3.9,
    reduction: 79,
  },
  {
    enabled: true,
    name: 'Smart',
    value: 20000,
    description: '<p>Melhor relação entre valor e investimento</p>',
    features: [],
    isRecommended: true,
    roi: 170,
    payback: 3.9,
    reduction: 89,
  },
  {
    enabled: true,
    name: 'Premium',
    value: 30000,
    description: '<p>Solução completa e automatizada</p>',
    features: [],
    isRecommended: false,
    roi: 171,
    payback: 4.3,
    reduction: 105,
  },
];

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    enabled: true,
    title: 'À Vista no PIX com 5% de Desconto',
    description: 'Pagamento único no PIX com desconto especial de 5% sobre o valor total do projeto.',
    highlighted: false,
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
];

export function Step4Financial() {
  const { formData, updateFormData, setCurrentStep } = useProposalForm();
  const [initialized, setInitialized] = useState(false);
  const [tierDescriptions, setTierDescriptions] = useState<{ [key: number]: string }>({});

  // Determinar valores iniciais
  const initialTiers = formData.financial?.tiers && formData.financial.tiers.length > 0
    ? formData.financial.tiers
    : DEFAULT_TIERS;

  const initialPaymentMethods = formData.financial?.paymentMethods && formData.financial.paymentMethods.length > 0
    ? formData.financial.paymentMethods
    : DEFAULT_PAYMENT_METHODS;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<Step4FormData>({
    defaultValues: {
      savings: formData.financial?.roi?.savings || 0,
      gain: formData.financial?.roi?.gain || 0,
      gainYear2: formData.financial?.roi?.gainYear2 || 0,
      returnMultiplier: formData.financial?.roi?.returnMultiplier || 0,
      paybackMonths: formData.financial?.roi?.paybackMonths || 0,
      tiers: initialTiers,
      recommendationEnabled: formData.financial?.recommendationBox?.enabled ?? true,
      recommendationTier: formData.financial?.recommendationBox?.recommendedTier || 'Smart',
      recommendationText: formData.financial?.recommendationBox?.text || 'A opção Smart oferece o melhor equilíbrio entre escopo, automação e ROI. É a versão ideal para consolidar o sistema de coleta e curadoria, mantendo abertura para evoluir depois para a elaboração de posts no modelo Premium.',
      recommendationColor: formData.financial?.recommendationBox?.color || 'green',
      paymentMethods: initialPaymentMethods,
    },
  });

  const {
    fields: tierFields,
    append: appendTier,
    remove: removeTier,
  } = useFieldArray({
    control,
    name: 'tiers',
  });

  const {
    fields: paymentFields,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({
    control,
    name: 'paymentMethods',
  });

  // Inicializar os planos se necessário
  useEffect(() => {
    if (!initialized && tierFields.length === 0) {
      reset({
        savings: formData.financial?.roi?.savings || 0,
        gain: formData.financial?.roi?.gain || 0,
        gainYear2: formData.financial?.roi?.gainYear2 || 0,
        returnMultiplier: formData.financial?.roi?.returnMultiplier || 0,
        paybackMonths: formData.financial?.roi?.paybackMonths || 0,
        tiers: initialTiers,
        recommendationEnabled: formData.financial?.recommendationBox?.enabled ?? true,
        recommendationTier: formData.financial?.recommendationBox?.recommendedTier || 'Smart',
        recommendationText: formData.financial?.recommendationBox?.text || 'A opção Smart oferece o melhor equilíbrio entre escopo, automação e ROI. É a versão ideal para consolidar o sistema de coleta e curadoria, mantendo abertura para evoluir depois para a elaboração de posts no modelo Premium.',
        recommendationColor: formData.financial?.recommendationBox?.color || 'green',
        paymentMethods: initialPaymentMethods,
      });
      setInitialized(true);
    }
  }, [initialized, tierFields.length, reset, formData.financial, initialTiers, initialPaymentMethods]);

  // Inicializar descrições dos planos quando os campos carregarem
  useEffect(() => {
    if (tierFields.length > 0) {
      const descriptions: { [key: number]: string } = {};
      tierFields.forEach((field, index) => {
        const desc = watch(`tiers.${index}.description`);
        if (desc && !tierDescriptions[index]) {
          descriptions[index] = desc;
        }
      });
      if (Object.keys(descriptions).length > 0) {
        setTierDescriptions((prev) => ({ ...prev, ...descriptions }));
      }
    }
  }, [tierFields, watch]);

  const handleDescriptionChange = (index: number, value: string) => {
    setTierDescriptions((prev) => ({ ...prev, [index]: value }));
    setValue(`tiers.${index}.description`, value, { shouldDirty: true });
  };

  const onSubmit = (data: Step4FormData) => {
    updateFormData('financial', {
      roi: {
        savings: data.savings,
        gain: data.gain,
        gainYear2: data.gainYear2,
        returnMultiplier: data.returnMultiplier,
        paybackMonths: data.paybackMonths,
      },
      tiers: data.tiers,
      recommendationBox: {
        enabled: data.recommendationEnabled,
        recommendedTier: data.recommendationTier,
        text: data.recommendationText,
        color: data.recommendationColor,
      },
      paymentMethods: data.paymentMethods,
    });
    setCurrentStep(5);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Planos e Financeiro
        </h2>
        <p className="text-slate-600">
          ROI, planos de preços e formas de pagamento
        </p>
      </div>

      {/* ROI e Métricas */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            ROI e Métricas
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Economia Anual Estimada (R$)</Label>
              <Input
                type="number"
                {...register('savings', {
                  min: 0,
                })}
                placeholder="99000"
              />
            </div>

            <div>
              <Label>Ganho Líquido 1º Ano (R$)</Label>
              <Input
                type="number"
                {...register('gain', {
                  min: 0,
                })}
                placeholder="61945"
              />
            </div>

            <div>
              <Label>Ganho Líquido 2º Ano (R$)</Label>
              <Input
                type="number"
                {...register('gainYear2', {
                  min: 0,
                })}
                placeholder="123890"
              />
            </div>

            <div>
              <Label>Retorno por Real Investido (x)</Label>
              <Input
                type="number"
                step="0.01"
                {...register('returnMultiplier', {
                  min: 0,
                })}
                placeholder="1.67"
              />
            </div>

            <div>
              <Label>Payback (meses)</Label>
              <Input
                type="number"
                step="0.1"
                {...register('paybackMonths', {
                  min: 0,
                })}
                placeholder="4"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Planos */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Planos Disponíveis
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendTier({
                  enabled: true,
                  name: '',
                  value: 0,
                  description: '<p></p>',
                  features: [],
                  isRecommended: false,
                  roi: 0,
                  payback: 0,
                  reduction: 0,
                })
              }
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Plano
            </Button>
          </div>

          {tierFields.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              Carregando planos...
            </div>
          )}

          {tierFields.map((field, index) => (
            <Card
              key={field.id}
              className={watch(`tiers.${index}.isRecommended`) ? 'border-2 border-purple-500' : ''}
            >
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register(`tiers.${index}.enabled`)}
                      className="w-4 h-4"
                    />
                    <Label className="text-lg font-semibold">
                      Habilitar Plano {watch(`tiers.${index}.name`) || `#${index + 1}`}
                    </Label>
                    {watch(`tiers.${index}.isRecommended`) && (
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    )}
                  </div>
                  {tierFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTier(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Plano</Label>
                    <Input
                      {...register(`tiers.${index}.name`)}
                      placeholder="MVP"
                    />
                  </div>

                  <div>
                    <Label>Valor (R$)</Label>
                    <Input
                      type="number"
                      {...register(`tiers.${index}.value`, {
                        min: 0,
                      })}
                      placeholder="15000"
                    />
                  </div>
                </div>

                <div>
                  <Label>Descrição (Rich Text - com bullets)</Label>
                  <RichTextEditor
                    value={tierDescriptions[index] || ''}
                    onChange={(value) => handleDescriptionChange(index, value)}
                    placeholder="Entrega funcional mínima..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>ROI (%)</Label>
                    <Input
                      type="number"
                      {...register(`tiers.${index}.roi`)}
                      placeholder="169"
                    />
                  </div>

                  <div>
                    <Label>Payback (meses)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      {...register(`tiers.${index}.payback`)}
                      placeholder="3.9"
                    />
                  </div>

                  <div>
                    <Label>Redução (horas/mês)</Label>
                    <Input
                      type="number"
                      {...register(`tiers.${index}.reduction`)}
                      placeholder="79"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register(`tiers.${index}.isRecommended`)}
                    className="w-4 h-4"
                  />
                  <Label>Marcar como Recomendado ⭐</Label>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Separator />

      {/* Recomendação DLR */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('recommendationEnabled')}
              className="w-4 h-4"
            />
            <h3 className="text-lg font-semibold text-slate-900">
              💡 Recomendação DLR (Box de Destaque)
            </h3>
          </div>

          {watch('recommendationEnabled') && (
            <>
              <div>
                <Label>Plano Recomendado</Label>
                <select
                  {...register('recommendationTier')}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  {tierFields.map((field, index) => (
                    <option key={field.id} value={watch(`tiers.${index}.name`)}>
                      {watch(`tiers.${index}.name`) || `Plano ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Texto da Recomendação</Label>
                <Textarea
                  {...register('recommendationText')}
                  placeholder="A opção Smart oferece o melhor equilíbrio..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Cor do Box</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      {...register('recommendationColor')}
                      value="green"
                      className="w-4 h-4"
                    />
                    <span>Green</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      {...register('recommendationColor')}
                      value="blue"
                      className="w-4 h-4"
                    />
                    <span>Blue</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      {...register('recommendationColor')}
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

      <Separator />

      {/* Formas de Pagamento */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Formas de Pagamento
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendPayment({
                  enabled: true,
                  title: '',
                  description: '',
                  highlighted: false,
                })
              }
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Forma
            </Button>
          </div>

          {paymentFields.map((field, index) => (
            <Card
              key={field.id}
              className="border-2 border-slate-200"
            >
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register(`paymentMethods.${index}.enabled`)}
                      className="w-4 h-4"
                    />
                    <Label>Habilitar</Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePayment(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>

                <div>
                  <Label>Título</Label>
                  <Input
                    {...register(`paymentMethods.${index}.title`)}
                    placeholder="À Vista no PIX com 5% de Desconto"
                  />
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    {...register(`paymentMethods.${index}.description`)}
                    placeholder="Pagamento único no PIX..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(3)}
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