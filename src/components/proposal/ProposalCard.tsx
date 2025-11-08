import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Proposal } from '../../types/proposal';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  Edit, 
  Eye, 
  Download, 
  Copy, 
  Trash2,
  Calendar,
  DollarSign 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProposalCardProps {
  proposal: Proposal;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (proposal: Proposal) => Promise<void>;
}

export function ProposalCard({ proposal, onDelete, onDuplicate }: ProposalCardProps) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta proposta?')) return;
    
    setIsDeleting(true);
    try {
      await onDelete(proposal.id);
    } catch (error) {
      alert('Erro ao excluir proposta');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      await onDuplicate(proposal);
    } catch (error) {
      alert('Erro ao duplicar proposta');
    } finally {
      setIsDuplicating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'warning' | 'success'> = {
      draft: 'default',
      sent: 'warning',
      approved: 'success',
    };

    const labels: Record<string, string> = {
      draft: 'Rascunho',
      sent: 'Enviada',
      approved: 'Aprovada',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getTierBadge = (tier?: string) => {
    if (!tier) return null;

    const colors: Record<string, string> = {
      mvp: 'bg-blue-100 text-blue-800',
      smart: 'bg-purple-100 text-purple-800',
      premium: 'bg-indigo-100 text-indigo-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[tier.toLowerCase()] || 'bg-slate-100 text-slate-800'}`}>
        {tier.toUpperCase()}
      </span>
    );
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 truncate">
              {proposal.client_name}
            </h3>
            <p className="text-sm text-slate-600 truncate">
              {proposal.project_title}
            </p>
          </div>
        </div>

        {getStatusBadge(proposal.status)}
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
        {proposal.total_value && (
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(proposal.total_value)}
            </span>
            {proposal.selected_tier && (
              <>
                <span className="mx-1">•</span>
                {getTierBadge(proposal.selected_tier)}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>
            Criada: {format(new Date(proposal.created_at), 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span>•</span>
          <span>
            Editada: {format(new Date(proposal.updated_at), 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={() => navigate(`/editor/${proposal.id}`)}
          className="flex-1"
        >
          <Edit className="w-4 h-4 mr-1" />
          Editar
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/preview/${proposal.id}`)}
        >
          <Eye className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => alert('Em breve: Download PDF')}
        >
          <Download className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleDuplicate}
          disabled={isDuplicating}
        >
          <Copy className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}