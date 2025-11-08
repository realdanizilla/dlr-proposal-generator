import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ProposalData } from '../types/proposal';

export function useSaveProposal() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const saveProposal = async (
    data: Partial<ProposalData>,
    proposalId?: string
  ) => {
    try {
      setSaving(true);
      setError(null);

      // Obter usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Validar dados básicos
      if (!data.basic?.clientName || !data.basic?.projectTitle) {
        throw new Error('Nome do cliente e título do projeto são obrigatórios');
      }

      // Determinar plano selecionado e valor
      let selectedTier: string | undefined;
      let totalValue: number | undefined;

      if (data.financial?.tiers) {
        const recommendedTier = data.financial.tiers.find(t => t.isRecommended && t.enabled);
        const enabledTiers = data.financial.tiers.filter(t => t.enabled);
        
        if (recommendedTier) {
          selectedTier = recommendedTier.name;
          totalValue = recommendedTier.value;
        } else if (enabledTiers.length > 0) {
          selectedTier = enabledTiers[0].name;
          totalValue = enabledTiers[0].value;
        }
      }

      const proposalPayload = {
        user_id: user.id,
        client_name: data.basic.clientName,
        project_title: data.basic.projectTitle,
        status: 'draft',
        selected_tier: selectedTier,
        total_value: totalValue,
        data: data as ProposalData,
      };

      let savedProposal;

      if (proposalId && proposalId !== 'new') {
        // Atualizar proposta existente
        const { data: updated, error: updateError } = await supabase
          .from('proposals')
          .update(proposalPayload)
          .eq('id', proposalId)
          .select()
          .single();

        if (updateError) throw updateError;
        savedProposal = updated;
      } else {
        // Criar nova proposta
        const { data: created, error: createError } = await supabase
          .from('proposals')
          .insert([proposalPayload])
          .select()
          .single();

        if (createError) throw createError;
        savedProposal = created;
      }

      return savedProposal;
    } catch (err: any) {
      console.error('Erro ao salvar proposta:', err);
      setError(err.message || 'Erro ao salvar proposta');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    saveProposal,
    saving,
    error,
  };
}