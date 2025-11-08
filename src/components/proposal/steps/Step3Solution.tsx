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
import { Badge } from '../../ui/badge';
import { Plus, Trash2, X } from 'lucide-react';
import { Feature } from '../../../types/proposal';

interface Step3FormData {
  description: string;
  features: Feature[];
}

const COLOR_OPTIONS = [
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'violet', label: 'Violet', class: 'bg-violet-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
  { value: 'teal', label: 'Teal', class: 'bg-teal-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
];

export function Step3Solution() {
  const { formData, updateFormData, setCurrentStep } = useProposalForm();
  const [description, setDescription] = useState(
    formData.solution?.description || ''
  );
  const [newTags, setNewTags] = useState<{ [key: number]: string }>({});

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<Step3FormData>({
    defaultValues: {
      description: formData.solution?.description || '',
      features: formData.solution?.features || [],
    },
  });

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control,
    name: 'features',
  });

  const addTag = (featureIndex: number) => {
    const tagValue = newTags[featureIndex]?.trim();
    if (!tagValue) return;

    const currentTags = watch(`features.${featureIndex}.tags`) || [];
    setValue(`features.${featureIndex}.tags`, [...currentTags, tagValue]);
    setNewTags({ ...newTags, [featureIndex]: '' });
  };

  const removeTag = (featureIndex: number, tagIndex: number) => {
    const currentTags = watch(`features.${featureIndex}.tags`) || [];
    setValue(
      `features.${featureIndex}.tags`,
      currentTags.filter((_, i) => i !== tagIndex)
    );
  };

  const onSubmit = (data: Step3FormData) => {
    updateFormData('solution', {
      description,
      features: data.features,
    });
    setCurrentStep(4);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Solução Proposta
        </h2>
        <p className="text-slate-600">
          Descrição da solução e suas principais funcionalidades
        </p>
      </div>

      {/* Descrição da Solução */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label required>Descrição da Solução</Label>
            <p className="text-sm text-slate-500 mb-2">
              💡 Dica: Descreva a solução proposta de forma geral
            </p>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="A solução proposta é um sistema automatizado e inteligente..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Funcionalidades / Features
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendFeature({
                  icon: 'Bot',
                  title: '',
                  description: '',
                  tags: [],
                  color: 'indigo',
                })
              }
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Feature
            </Button>
          </div>

          {featureFields.map((field, index) => (
            <Card key={field.id} className="border-2">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <h4 className="text-md font-semibold">Feature #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFeature(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>

                <div>
                  <Label>Ícone</Label>
                  <IconPicker
                    value={watch(`features.${index}.icon`)}
                    onChange={(icon) => setValue(`features.${index}.icon`, icon)}
                  />
                </div>

                <div>
                  <Label required>Título</Label>
                  <Input
                    {...register(`features.${index}.title`, {
                      required: 'Título é obrigatório',
                    })}
                    placeholder="Coleta Automática de Fontes"
                    error={!!errors.features?.[index]?.title}
                  />
                </div>

                <div>
                  <Label required>Descrição</Label>
                  <Textarea
                    {...register(`features.${index}.description`, {
                      required: 'Descrição é obrigatória',
                    })}
                    placeholder="Newsletters, Substacks, sites de notícias..."
                    rows={3}
                    error={!!errors.features?.[index]?.description}
                  />
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags (opcional)</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTags[index] || ''}
                      onChange={(e) =>
                        setNewTags({ ...newTags, [index]: e.target.value })
                      }
                      placeholder="Nome da tag"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(index);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addTag(index)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(watch(`features.${index}.tags`) || []).map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index, tagIndex)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Cor do Card */}
                <div>
                  <Label>Cor do Card</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {COLOR_OPTIONS.map((color) => (
                      <label
                        key={color.value}
                        className="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-slate-50"
                      >
                        <input
                          type="radio"
                          {...register(`features.${index}.color`)}
                          value={color.value}
                          className="w-4 h-4"
                        />
                        <div className={`w-4 h-4 rounded ${color.class}`} />
                        <span className="text-sm">{color.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {featureFields.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              Nenhuma feature adicionada. Clique em "Adicionar Feature" para começar.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(2)}
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