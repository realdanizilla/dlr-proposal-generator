import { useState } from 'react';
import * as Icons from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { cn } from '../../lib/utils';

// Lista de ícones mais usados
const COMMON_ICONS = [
  'Clock', 'AlertCircle', 'TrendingUp', 'Target', 'Lightbulb', 'Zap',
  'Bot', 'DollarSign', 'Users', 'Calendar', 'FileText', 'Wrench',
  'BookOpen', 'GraduationCap', 'CreditCard', 'Package', 'Rocket',
  'Shield', 'Award', 'CheckCircle', 'XCircle', 'Info', 'Heart',
  'Star', 'ThumbsUp', 'Flame', 'Globe', 'Mail', 'Phone',
];

export interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = COMMON_ICONS.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const SelectedIcon = value && Icons[value as keyof typeof Icons] 
    ? Icons[value as keyof typeof Icons] 
    : Icons.HelpCircle;

  return (
    <div className={cn('relative', className)}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start gap-2"
      >
        <SelectedIcon className="w-5 h-5" />
        <span>{value || 'Escolher ícone'}</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
            <Input
              placeholder="Buscar ícone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-3"
            />

            <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
              {filteredIcons.map((iconName) => {
                const Icon = Icons[iconName as keyof typeof Icons] as any;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onChange(iconName);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      'p-2 rounded hover:bg-slate-100 transition-colors',
                      value === iconName && 'bg-slate-200'
                    )}
                    title={iconName}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>

            {filteredIcons.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                Nenhum ícone encontrado
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}