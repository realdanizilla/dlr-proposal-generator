import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useProposalForm } from '../../../contexts/ProposalFormContext';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent } from '../../ui/card';
import { Separator } from '../../ui/separator';
import { Alert, AlertDescription } from '../../ui/alert';
import { Plus, Trash2, Upload, DollarSign, ChevronUp, ChevronDown } from 'lucide-react';
import { InfrastructureService } from '../../../types/proposal';
import { supabase } from '../../../lib/supabase';

interface Step5FormData {
  enabled: boolean;
  introduction: string;
  services: InfrastructureService[];
  clientNote: string;
}

export function Step5Infrastructure() {
  const { formData, updateFormData, setCurrentStep } = useProposalForm();
  const [uploadingLogo, setUploadingLogo] = useState<number | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<Step5FormData>({
    defaultValues: {
      enabled: formData.infrastructure?.enabled ?? false,
      introduction: formData.infrastructure?.introduction || '',
      services: formData.infrastructure?.services || [],
      clientNote: formData.infrastructure?.clientNote || 'Estes custos são de responsabilidade do cliente e faturados diretamente pelos fornecedores de serviço.',
    },
  });

  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
    move: moveService,
  } = useFieldArray({
    control,
    name: 'services',
  });

  // Calcular requisições mensais automaticamente
  const calculateMonthlyRequests = (index: number) => {
    const dailyRequests = watch(`services.${index}.volume.requestsPerDay`) || 0;
    const monthlyRequests = dailyRequests * 30;
    setValue(`services.${index}.volume.requestsPerMonth`, monthlyRequests);
    calculateMonthlyCost(index);
  };

  // Calcular custo mensal automaticamente
  const calculateMonthlyCost = (index: number) => {
    const monthlyRequests = watch(`services.${index}.volume.requestsPerMonth`) || 0;
    const costPerRequest = watch(`services.${index}.costs.costPerRequest`) || 0;
    const monthlyCost = monthlyRequests * costPerRequest;
    setValue(`services.${index}.costs.monthlyCost`, parseFloat(monthlyCost.toFixed(2)));
  };

  // Calcular total mensal
  const calculateTotalMonthlyCost = () => {
    return serviceFields.reduce((total, field, index) => {
      const cost = watch(`services.${index}.costs.monthlyCost`) || 0;
      return total + cost;
    }, 0);
  };

  // Funções de reordenação
  const moveServiceUp = (index: number) => {
    if (index > 0) {
      moveService(index, index - 1);
    }
  };

  const moveServiceDown = (index: number) => {
    if (index < serviceFields.length - 1) {
      moveService(index, index + 1);
    }
  };

  // Upload de logo
  const handleLogoUpload = async (index: number, file: File) => {
    try {
      setUploadingLogo(index);

      // Verificar tamanho do arquivo (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Arquivo muito grande. Máximo 5MB.');
        setUploadingLogo(null);
        return;
      }

      // Verificar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Apenas imagens são permitidas.');
        setUploadingLogo(null);
        return;
      }

      console.log('Iniciando upload...', { fileName: file.name, size: file.size });

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Tentar upload no Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('proposal-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erro no upload Supabase:', uploadError);
        
        // Fallback: usar base64
        console.log('Usando base64 como fallback...');
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setValue(`services.${index}.logo`, {
            type: 'url',
            value: base64String,
          });
          setUploadingLogo(null);
          alert('Upload no Supabase falhou. Usando imagem local (base64). Funcionará, mas não será salva no servidor.');
        };
        reader.onerror = () => {
          alert('Erro ao processar imagem');
          setUploadingLogo(null);
        };
        reader.readAsDataURL(file);
        return;
      }

      console.log('Upload bem-sucedido:', uploadData);

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('proposal-logos')
        .getPublicUrl(filePath);

      console.log('URL pública:', publicUrl);

      setValue(`services.${index}.logo`, {
        type: 'upload',
        value: publicUrl,
      });

      setUploadingLogo(null);
      alert('Logo enviado com sucesso!');

    } catch (error: any) {
      console.error('Erro geral no upload:', error);
      
      // Fallback final: base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setValue(`services.${index}.logo`, {
          type: 'url',
          value: base64String,
        });
        setUploadingLogo(null);
        alert('Upload falhou. Usando imagem local. Cole uma URL para persistir a imagem.');
      };
      reader.onerror = () => {
        alert('Erro ao processar imagem');
        setUploadingLogo(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: Step5FormData) => {
    updateFormData('infrastructure', {
      enabled: data.enabled,
      introduction: data.introduction,
      services: data.services,
      clientNote: data.clientNote,
    });
    setCurrentStep(6);
  };

  const totalMonthlyCost = calculateTotalMonthlyCost();
  const totalAnnualCost = totalMonthlyCost * 12;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Custos de Infraestrutura e APIs
        </h2>
        <p className="text-slate-600">
          Serviços de terceiros que geram custos operacionais mensais
        </p>
      </div>

      {/* Habilitar Seção */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('enabled')}
              className="w-4 h-4"
            />
            <Label className="text-lg font-semibold">
              ☑️ Incluir Seção de Custos de Infraestrutura
            </Label>
          </div>
        </CardContent>
      </Card>

      {watch('enabled') && (
        <>
          {/* Introdução */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Introdução da Seção (opcional)</Label>
                <Textarea
                  {...register('introduction')}
                  placeholder="Além do investimento no projeto, o sistema utiliza serviços de terceiros..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Serviços */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Serviços e APIs
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendService({
                      name: '',
                      model: '',
                      volume: {
                        requestsPerDay: 0,
                        requestsPerMonth: 0,
                      },
                      costs: {
                        costPerRequest: 0,
                        monthlyCost: 0,
                      },
                    })
                  }
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Serviço
                </Button>
              </div>

              {serviceFields.map((field, index) => (
                <Card key={field.id} className="border-2">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <h4 className="text-md font-semibold">Serviço #{index + 1}</h4>
                        </div>

                        <div>
                          <Label required>Nome do Serviço</Label>
                          <Input
                            {...register(`services.${index}.name`, {
                              required: 'Nome é obrigatório',
                            })}
                            placeholder="OpenAI API"
                            error={!!errors.services?.[index]?.name}
                          />
                        </div>

                        {/* Logo Upload */}
                        <div>
                          <Label>Logo do Serviço</Label>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                type="text"
                                placeholder="Cole a URL da imagem"
                                defaultValue={watch(`services.${index}.logo`)?.type === 'url' ? watch(`services.${index}.logo`)?.value : ''}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    setValue(`services.${index}.logo`, {
                                      type: 'url',
                                      value: e.target.value,
                                    });
                                  }
                                }}
                              />
                              <span className="text-slate-500 py-2">ou</span>
                              <div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  id={`logo-upload-${index}`}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleLogoUpload(index, file);
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={uploadingLogo === index}
                                  onClick={() => document.getElementById(`logo-upload-${index}`)?.click()}
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  {uploadingLogo === index ? 'Enviando...' : 'Upload'}
                                </Button>
                              </div>
                            </div>

                            {watch(`services.${index}.logo`)?.value && (
                              <div className="mt-2">
                                <p className="text-sm text-slate-500 mb-2">Preview:</p>
                                <div className="flex items-center gap-2">
                                  <img
                                    src={watch(`services.${index}.logo`)?.value}
                                    alt="Logo preview"
                                    className="w-20 h-20 object-contain border rounded p-2 bg-white"
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://via.placeholder.com/80?text=Erro';
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setValue(`services.${index}.logo`, undefined)}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label>Modelo/Serviço</Label>
                          <Input
                            {...register(`services.${index}.model`)}
                            placeholder="GPT-4"
                          />
                        </div>

                        <Separator />

                        <h5 className="text-sm font-semibold text-slate-900">Volume Estimado</h5>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label required>Requisições por Dia</Label>
                            <Input
                              type="number"
                              {...register(`services.${index}.volume.requestsPerDay`, {
                                required: 'Requisições por dia é obrigatório',
                                min: 0,
                              })}
                              placeholder="500"
                              onChange={(e) => {
                                register(`services.${index}.volume.requestsPerDay`).onChange(e);
                                setTimeout(() => calculateMonthlyRequests(index), 0);
                              }}
                              error={!!errors.services?.[index]?.volume?.requestsPerDay}
                            />
                          </div>

                          <div>
                            <Label>Requisições por Mês (auto)</Label>
                            <Input
                              type="number"
                              {...register(`services.${index}.volume.requestsPerMonth`)}
                              placeholder="15000"
                              disabled
                              className="bg-slate-100"
                            />
                          </div>
                        </div>

                        <Separator />

                        <h5 className="text-sm font-semibold text-slate-900">Custos</h5>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label required>Custo por Requisição (R$)</Label>
                            <Input
                              type="number"
                              step="0.0001"
                              {...register(`services.${index}.costs.costPerRequest`, {
                                required: 'Custo por requisição é obrigatório',
                                min: 0,
                              })}
                              placeholder="0.0050"
                              onChange={(e) => {
                                register(`services.${index}.costs.costPerRequest`).onChange(e);
                                setTimeout(() => calculateMonthlyCost(index), 0);
                              }}
                              error={!!errors.services?.[index]?.costs?.costPerRequest}
                            />
                            <p className="text-xs text-slate-500 mt-1">
                              Aceita até 4 casas decimais para cálculos precisos
                            </p>
                          </div>

                          <div>
                            <Label>Custo Mensal (R$) (auto)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              {...register(`services.${index}.costs.monthlyCost`)}
                              placeholder="750.00"
                              disabled
                              className="bg-slate-100"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Descrição/Observação (opcional)</Label>
                          <Textarea
                            {...register(`services.${index}.description`)}
                            placeholder="Usado para geração de conteúdo..."
                            rows={2}
                          />
                        </div>
                      </div>

                      {/* Botões de controle */}
                      <div className="flex flex-col gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveServiceUp(index)}
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
                          onClick={() => moveServiceDown(index)}
                          disabled={index === serviceFields.length - 1}
                          className={index === serviceFields.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}
                          title="Mover para baixo"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeService(index)}
                          className="mt-2"
                          title="Remover serviço"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {serviceFields.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  Nenhum serviço adicionado. Clique em "Adicionar Serviço" para começar.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo de Custos */}
          {serviceFields.length > 0 && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      📊 Custo Total de Infraestrutura
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-600">Custo Mensal</p>
                        <p className="text-3xl font-bold text-blue-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(totalMonthlyCost)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Custo Anual</p>
                        <p className="text-3xl font-bold text-indigo-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(totalAnnualCost)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nota para o Cliente */}
          <Card>
            <CardContent className="pt-6">
              <div>
                <Label>Nota para o Cliente (opcional)</Label>
                <Textarea
                  {...register('clientNote')}
                  placeholder="Estes custos são de responsabilidade do cliente..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(4)}
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