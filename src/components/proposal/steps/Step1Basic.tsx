import { useForm } from 'react-hook-form';
import { useProposalForm } from '../../../contexts/ProposalFormContext';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select } from '../../ui/select';
import { Card, CardContent } from '../../ui/card';

interface Step1FormData {
  clientName: string;
  projectTitle: string;
  projectType: string;
  consultancyName: string;
  consultancyEmail: string;
}

export function Step1Basic() {
  const { formData, updateFormData, setCurrentStep } = useProposalForm();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1FormData>({
    defaultValues: formData.basic || {
      clientName: '',
      projectTitle: '',
      projectType: '',
      consultancyName: 'DLR.ai',
      consultancyEmail: 'danizilla@gmail.com',
    },
  });

  const onSubmit = (data: Step1FormData) => {
    updateFormData('basic', data);
    setCurrentStep(2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Informações Básicas
        </h2>
        <p className="text-slate-600">
          Dados fundamentais sobre o cliente e o projeto
        </p>
      </div>

      {/* Cliente e Projeto */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Cliente e Projeto
          </h3>

          <div>
            <Label htmlFor="clientName" required>
              Nome do Cliente
            </Label>
            <Input
              id="clientName"
              {...register('clientName', { required: 'Nome do cliente é obrigatório' })}
              placeholder="Ex: Luiz Eduardo Veiga"
              error={!!errors.clientName}
            />
            {errors.clientName && (
              <p className="text-sm text-red-600 mt-1">{errors.clientName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="projectTitle" required>
              Título do Projeto
            </Label>
            <Input
              id="projectTitle"
              {...register('projectTitle', { required: 'Título do projeto é obrigatório' })}
              placeholder="Ex: Automação de Curadoria LinkedIn"
              error={!!errors.projectTitle}
            />
            {errors.projectTitle && (
              <p className="text-sm text-red-600 mt-1">{errors.projectTitle.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="projectType">
              Tipo de Projeto
            </Label>
            <Select
              id="projectType"
              {...register('projectType')}
            >
              <option value="">Selecione...</option>
              <option value="linkedin-curation">Curadoria LinkedIn</option>
              <option value="ecommerce">E-commerce</option>
              <option value="customer-service">Automação Atendimento</option>
              <option value="other">Outro</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Consultoria */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Consultoria
          </h3>

          <div>
            <Label htmlFor="consultancyName" required>
              Nome da Consultoria
            </Label>
            <Input
              id="consultancyName"
              {...register('consultancyName', { required: 'Nome da consultoria é obrigatório' })}
              placeholder="DLR.ai"
              error={!!errors.consultancyName}
            />
            {errors.consultancyName && (
              <p className="text-sm text-red-600 mt-1">{errors.consultancyName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="consultancyEmail" required>
              Email de Contato
            </Label>
            <Input
              id="consultancyEmail"
              type="email"
              {...register('consultancyEmail', {
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido',
                },
              })}
              placeholder="seu@email.com"
              error={!!errors.consultancyEmail}
            />
            {errors.consultancyEmail && (
              <p className="text-sm text-red-600 mt-1">{errors.consultancyEmail.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <div></div>
        <Button type="submit" size="lg">
          Próximo →
        </Button>
      </div>
    </form>
  );
}