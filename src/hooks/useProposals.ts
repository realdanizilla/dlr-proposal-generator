import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Proposal } from '../types/proposal';

export function useProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProposal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Atualizar lista local
      setProposals(proposals.filter(p => p.id !== id));
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const duplicateProposal = async (proposal: Proposal) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const newProposal = {
        user_id: user.id,
        client_name: `${proposal.client_name} (Cópia)`,
        project_title: proposal.project_title,
        status: 'draft',
        selected_tier: proposal.selected_tier,
        total_value: proposal.total_value,
        data: proposal.data,
      };

      const { data, error } = await supabase
        .from('proposals')
        .insert([newProposal])
        .select()
        .single();

      if (error) throw error;
      
      // Adicionar à lista local
      setProposals([data, ...proposals]);
      
      return data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  return {
    proposals,
    loading,
    error,
    refetch: fetchProposals,
    deleteProposal,
    duplicateProposal,
  };
}