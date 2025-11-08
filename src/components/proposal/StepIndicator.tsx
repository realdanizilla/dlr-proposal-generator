import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

const STEPS = [
  { number: 1, title: 'Básico' },
  { number: 2, title: 'Contexto' },
  { number: 3, title: 'Solução' },
  { number: 4, title: 'Financeiro' },
  { number: 5, title: 'Infraestrutura' },
  { number: 6, title: 'Timeline' },
];

interface StepIndicatorProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="w-full bg-white border-b border-slate-200 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-900">
              Etapa {currentStep} de {STEPS.length}
            </span>
            <span className="text-sm text-slate-500">
              {Math.round(progress)}% completo
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="flex justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            const isClickable = onStepClick && (isCompleted || isCurrent);

            return (
              <button
                key={step.number}
                onClick={() => isClickable && onStepClick(step.number)}
                disabled={!isClickable}
                className={cn(
                  'flex flex-col items-center gap-2 flex-1',
                  isClickable && 'cursor-pointer hover:opacity-80',
                  !isClickable && 'cursor-not-allowed opacity-50'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors',
                    isCompleted && 'bg-green-500 text-white',
                    isCurrent && 'bg-slate-900 text-white',
                    !isCompleted && !isCurrent && 'bg-slate-200 text-slate-600'
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.number}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium hidden sm:block',
                    isCurrent && 'text-slate-900',
                    !isCurrent && 'text-slate-500'
                  )}
                >
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}