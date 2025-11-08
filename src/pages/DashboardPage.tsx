import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProposals } from '../hooks/useProposals';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { ProposalCard } from '../components/proposal/ProposalCard';
import { Plus, Search, LogOut } from 'lucide-react';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { proposals, loading, deleteProposal, duplicateProposal } = useProposals();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch =
      proposal.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.project_title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || proposal.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateNew = () => {
    navigate('/editor/new');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                DLR.ai - Proposal Builder
              </h1>
              <p className="text-sm text-slate-600">{user?.email}</p>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and New Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Minhas Propostas
            </h2>
            <p className="text-slate-600 mt-1">
              {proposals.length} proposta{proposals.length !== 1 ? 's' : ''} no total
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Proposta
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por cliente ou projeto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48"
          >
            <option value="all">Todos os status</option>
            <option value="draft">Rascunho</option>
            <option value="sent">Enviada</option>
            <option value="approved">Aprovada</option>
          </Select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            <p className="mt-4 text-slate-600">Carregando propostas...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && proposals.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Nenhuma proposta ainda
            </h3>
            <p className="text-slate-600 mb-4">
              Comece criando sua primeira proposta
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Proposta
            </Button>
          </div>
        )}

        {/* Proposals Grid */}
        {!loading && filteredProposals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onDelete={deleteProposal}
                onDuplicate={duplicateProposal}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && proposals.length > 0 && filteredProposals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">
              Nenhuma proposta encontrada com os filtros aplicados
            </p>
          </div>
        )}
      </main>
    </div>
  );
}