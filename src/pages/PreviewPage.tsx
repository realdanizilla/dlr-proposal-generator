import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { ArrowLeft, Download, CreditCard, Banknote, Calendar, DollarSign, Target, Zap, BookOpen, Award, CheckCircle, TrendingUp, Clock, Users } from 'lucide-react';
import { ProposalData } from '../types/proposal';
import * as Icons from 'lucide-react';
import '../styles/pdf.css';

export function PreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadProposal = async () => {
      try {
        const { data, error } = await supabase
          .from('proposals')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        console.log('=== CARREGANDO PREVIEW ===');
        console.log('Serviços carregados:', data.data.infrastructure?.services?.map((s, i) => ({ index: i, name: s.name })));
        setProposal(data);
      } catch (error) {
        console.error('Erro ao carregar proposta:', error);
        alert('Erro ao carregar proposta');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadProposal();
  }, [id, navigate]);

  const generatePDF = async () => {
    if (!contentRef.current) return;

    try {
      setGenerating(true);

      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Proposta_${proposal.client_name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { 
          type: 'jpeg', 
          quality: 0.98 
        },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
          scrollY: 0,
          scrollX: 0,
          backgroundColor: '#ffffff',
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
        },
        pagebreak: { 
          mode: ['css', 'legacy'],
          before: '.pdf-page-break',
          avoid: ['.pdf-no-break', '.pdf-card', 'img']
        }
      };

      await html2pdf().set(opt).from(contentRef.current).save();
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF.');
    } finally {
      setGenerating(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getPaymentIcon = (title: string) => {
    if (title.toLowerCase().includes('pix')) {
      return <Banknote className="w-5 h-5" />;
    } else if (title.toLowerCase().includes('parcelado')) {
      return <CreditCard className="w-5 h-5" />;
    } else {
      return <Calendar className="w-5 h-5" />;
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="w-6 h-6" /> : <Target className="w-6 h-6" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return null;
  }

  const data: ProposalData = proposal.data;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-xl font-bold text-slate-900">
                Preview da Proposta
              </h1>
            </div>
            <Button
              onClick={generatePDF}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              {generating ? 'Gerando PDF...' : 'Baixar PDF'}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div ref={contentRef} className="bg-white shadow-lg">
          {/* Capa - Página 1 */}
          <div className="pdf-cover min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white p-16 flex flex-col justify-center">
            <div className="mb-12">
              <p className="text-sm uppercase tracking-wider mb-2 opacity-90">
                {data.basic?.consultancyName || 'DLR.ai'}
              </p>
              <p className="text-sm opacity-90">
                Consultoria de IA e Automação
              </p>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <p className="text-lg uppercase tracking-wider mb-4 opacity-90">
                PROPOSTA PARA
              </p>
              <h1 className="text-6xl font-bold mb-4 leading-tight">
                {data.basic?.clientName}
              </h1>
              <div className="w-24 h-1 bg-white mb-8"></div>
              <h2 className="text-3xl font-light mb-8 leading-relaxed">
                {data.basic?.projectTitle}
              </h2>
            </div>

            <div className="flex items-center gap-2 text-sm opacity-90">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('pt-BR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}</span>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-12">
            {/* Contexto e Desafios */}
            {data.context && (
              <>
                <section className="pdf-page-break pdf-section">
                  <div className="pdf-section-header">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Contexto e Entendimento
                    </h2>
                    <p className="text-slate-600 text-base">Análise da situação atual</p>
                    <div className="w-16 h-1 bg-blue-600 mt-3"></div>
                  </div>
                  
                  {data.context.currentSituation && (
                    <div className="pdf-text mb-8">
                      <div 
                        className="prose prose-slate prose-base max-w-none text-slate-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: data.context.currentSituation }}
                      />
                    </div>
                  )}

                  {data.context.challenges && data.context.challenges.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">
                        Desafios Identificados
                      </h3>
                      <p className="text-slate-600 text-sm mb-4">
                        Principais obstáculos no processo atual
                      </p>
                      <div className="w-16 h-1 bg-blue-600 mb-6"></div>
                      
                      <p className="pdf-text text-slate-700">
                        Durante a análise, identificamos que o processo atual enfrenta {data.context.challenges.length === 1 ? 'o seguinte obstáculo' : `${data.context.challenges.length} principais obstáculos`}:
                      </p>
                      
                      <div className="space-y-4">
                        {data.context.challenges.map((challenge, index) => (
                          <div 
                            key={index} 
                            className={`pdf-card border-l-4 rounded-r-lg p-5 flex items-start gap-4 ${
                              challenge.color === 'red' ? 'bg-red-50 border-red-500' :
                              challenge.color === 'orange' ? 'bg-orange-50 border-orange-500' :
                              'bg-yellow-50 border-yellow-500'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              challenge.color === 'red' ? 'bg-red-100 text-red-600' :
                              challenge.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                              'bg-yellow-100 text-yellow-600'
                            }`}>
                              {getIconComponent(challenge.icon || 'AlertCircle')}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 text-base mb-2">
                                {challenge.title}
                              </h4>
                              <p className="text-slate-700 leading-relaxed text-sm">{challenge.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Impacto */}
                  {data.context.impact && (
                    <div className="mt-10">
                      <div className="pdf-section-header">
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">
                          Impacto
                        </h3>
                        <p className="text-slate-600 text-sm mb-4">
                          Consequências da manutenção do status quo
                        </p>
                        <div className="w-16 h-1 bg-blue-600"></div>
                      </div>

                      {data.context.impact.introText && (
                        <p className="pdf-text text-slate-700">
                          {data.context.impact.introText}
                        </p>
                      )}

                      {/* Custo Anual */}
                      <div className="pdf-card bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base font-semibold text-slate-900 mb-3">
                              Custo Anual das Ineficiências
                            </h4>
                            <p className="text-4xl font-bold text-red-600 mb-3">
                              {formatCurrency(data.context.impact.annualCost || 0)}
                            </p>
                            {data.context.impact.costDescription && (
                              <p className="text-slate-700 leading-relaxed text-sm">
                                {data.context.impact.costDescription}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Premissas */}
                      {data.context.impact.assumptions && data.context.impact.assumptions.length > 0 && (
                        <div>
                          <h4 className="text-base font-semibold text-slate-900 mb-4">
                            Principais Premissas Adotadas
                          </h4>
                          <div className="pdf-grid-3">
                            {data.context.impact.assumptions.map((assumption, index) => {
                              const colors = ['bg-indigo-50 border-indigo-200', 'bg-purple-50 border-purple-200', 'bg-green-50 border-green-200'];
                              const iconColors = ['bg-indigo-100 text-indigo-600', 'bg-purple-100 text-purple-600', 'bg-green-100 text-green-600'];
                              return (
                                <div 
                                  key={index}
                                  className={`pdf-card border-2 rounded-lg p-4 ${colors[index % 3]} flex items-start gap-3`}
                                >
                                  <div className={`w-11 h-11 rounded-lg ${iconColors[index % 3]} flex items-center justify-center flex-shrink-0`}>
                                    {getIconComponent(assumption.icon || 'Target')}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xl font-bold text-slate-900 mb-2">
                                      {assumption.value}
                                    </p>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                      {assumption.description}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Box Impacto Comprovado */}
                      {data.context.impact.provenImpactBox?.enabled && (
                        <div className="pdf-card bg-indigo-50 border-2 border-indigo-200 rounded-lg p-5 mt-6">
                          <h4 className="font-semibold text-slate-900 text-base mb-2">
                            {data.context.impact.provenImpactBox.title}
                          </h4>
                          <p className="text-slate-700 text-sm leading-relaxed mb-2">
                            {data.context.impact.provenImpactBox.mainMessage}
                          </p>
                          {data.context.impact.provenImpactBox.secondaryMessage && (
                            <p className="text-slate-600 text-sm leading-relaxed">
                              {data.context.impact.provenImpactBox.secondaryMessage}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </>
            )}

            {/* Solução Proposta */}
            {data.solution && (
              <>
                <section className="pdf-page-break pdf-section">
                  <div className="pdf-section-header">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Necessidade e Oportunidade
                    </h2>
                    <p className="text-slate-600 text-base">A solução proposta</p>
                    <div className="w-16 h-1 bg-blue-600 mt-3"></div>
                  </div>

                  {data.solution.introText && (
                    <p className="pdf-text text-slate-700">
                      {data.solution.introText}
                    </p>
                  )}
                  
                  {data.solution.description && (
                    <div 
                      className="prose prose-slate prose-base max-w-none pdf-text text-slate-700"
                      dangerouslySetInnerHTML={{ __html: data.solution.description }}
                    />
                  )}

                  {data.solution.features && data.solution.features.length > 0 && (
                    <div className="pdf-grid-2 mt-8">
                      {data.solution.features.map((feature, index) => {
                        const getFeatureColorClasses = (color: string) => {
                          const colorMap: Record<string, string> = {
                            indigo: 'bg-indigo-50 border-indigo-200',
                            purple: 'bg-purple-50 border-purple-200',
                            violet: 'bg-violet-50 border-violet-200',
                            blue: 'bg-blue-50 border-blue-200',
                            green: 'bg-green-50 border-green-200',
                            emerald: 'bg-emerald-50 border-emerald-200',
                            teal: 'bg-teal-50 border-teal-200',
                            cyan: 'bg-cyan-50 border-cyan-200',
                          };
                          return colorMap[color] || 'bg-indigo-50 border-indigo-200';
                        };

                        const getIconColorClasses = (color: string) => {
                          const colorMap: Record<string, string> = {
                            indigo: 'bg-indigo-500 text-white',
                            purple: 'bg-purple-500 text-white',
                            violet: 'bg-violet-500 text-white',
                            blue: 'bg-blue-500 text-white',
                            green: 'bg-green-500 text-white',
                            emerald: 'bg-emerald-500 text-white',
                            teal: 'bg-teal-500 text-white',
                            cyan: 'bg-cyan-500 text-white',
                          };
                          return colorMap[color] || 'bg-indigo-500 text-white';
                        };

                        return (
                          <div 
                            key={index}
                            className={`pdf-card border-2 rounded-lg p-5 ${getFeatureColorClasses(feature.color || 'indigo')}`}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`w-10 h-10 rounded-lg ${getIconColorClasses(feature.color || 'indigo')} flex items-center justify-center flex-shrink-0`}>
                                {getIconComponent(feature.icon || 'Target')}
                              </div>
                              <h3 className="font-semibold text-slate-900 text-base flex-1 leading-tight">
                                {feature.title}
                              </h3>
                            </div>
                            <p className="text-slate-700 leading-relaxed text-sm mb-3">
                              {feature.description}
                            </p>
                            {feature.tags && feature.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {feature.tags.map((tag, tagIndex) => (
                                  <span 
                                    key={tagIndex}
                                    className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </>
            )}

            {/* ROI */}
            {data.financial?.roi && (
              <>
                <section className="pdf-page-break pdf-section">
                  <div className="pdf-section-header">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Retorno sobre o Investimento
                    </h2>
                    <p className="text-slate-600 text-base">Números baseados no estudo financeiro realizado</p>
                    <div className="w-16 h-1 bg-blue-600 mt-3"></div>
                  </div>

                  <div className="pdf-grid-4">
                    <div className="pdf-card bg-white border-2 border-slate-200 rounded-lg p-5 flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mb-3">
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <p className="text-3xl font-bold text-slate-900 mb-2">
                        {formatCurrency(data.financial.roi.savings || 0)}
                      </p>
                      <p className="text-xs text-slate-600 leading-tight">Economia Anual Estimada</p>
                    </div>

                    <div className="pdf-card bg-white border-2 border-slate-200 rounded-lg p-5 flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <p className="text-3xl font-bold text-slate-900 mb-2">
                        {formatCurrency(data.financial.roi.gain || 0)}
                      </p>
                      <p className="text-xs text-slate-600 leading-tight">
                        Ganho Líquido 1º Ano
                      </p>
                    </div>

                    <div className="pdf-card bg-white border-2 border-slate-200 rounded-lg p-5 flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                        <Target className="w-6 h-6" />
                      </div>
                      <p className="text-3xl font-bold text-slate-900 mb-2">
                        {data.financial.roi.returnMultiplier}x
                      </p>
                      <p className="text-xs text-slate-600 leading-tight">Retorno por Real Investido</p>
                    </div>

                    <div className="pdf-card bg-white border-2 border-slate-200 rounded-lg p-5 flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                        <Clock className="w-6 h-6" />
                      </div>
                      <p className="text-3xl font-bold text-slate-900 mb-2">
                        {data.financial.roi.paybackMonths}
                      </p>
                      <p className="text-xs text-slate-600 leading-tight">Payback (meses)</p>
                    </div>
                  </div>

                  {data.context?.impact?.provenImpactBox?.enabled && (
                    <div className="pdf-card bg-indigo-50 border-2 border-indigo-200 rounded-lg p-5 mt-6">
                      <h4 className="font-semibold text-slate-900 text-base mb-2">
                        Impacto Comprovado
                      </h4>
                      <p className="text-slate-700 text-sm leading-relaxed mb-2">
                        {data.context.impact.provenImpactBox.mainMessage}
                      </p>
                      {data.context.impact.provenImpactBox.secondaryMessage && (
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {data.context.impact.provenImpactBox.secondaryMessage}
                        </p>
                      )}
                    </div>
                  )}
                </section>
              </>
            )}

            {/* Planos */}
            {data.financial?.tiers && data.financial.tiers.filter(t => t.enabled).length > 0 && (
              <>
                <section className="pdf-page-break pdf-section">
                  <div className="pdf-section-header">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Propostas de Implementação
                    </h2>
                    <p className="text-slate-600 text-base">Opções flexíveis para começar</p>
                    <div className="w-16 h-1 bg-blue-600 mt-3"></div>
                  </div>

                  <p className="pdf-text text-slate-700">
                    Oferecemos três níveis de implementação para atender diferentes necessidades e orçamentos.
                  </p>

                  <div className="pdf-grid-3">
                    {data.financial.tiers
                      .filter(t => t.enabled)
                      .map((tier, index) => (
                        <div 
                          key={index}
                          className={`pdf-card rounded-lg p-5 flex flex-col ${
                            tier.isRecommended 
                              ? 'bg-indigo-50 border-2 border-indigo-500' 
                              : 'bg-white border-2 border-slate-200'
                          }`}
                          style={{ minHeight: '380px' }}
                        >
                          {/* Cabeçalho */}
                          <div className="mb-3">
                            <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">
                              {tier.name} {tier.isRecommended && '⭐'}
                            </h3>
                          </div>

                          {/* Descrição com bullets */}
                          <div className="mb-4 flex-grow">
                            {tier.description && (
                              <div 
                                className="text-xs text-slate-600 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:list-inside [&_ul]:pl-0 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:pl-0 [&_li]:mb-1 [&_li]:leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: tier.description }}
                              />
                            )}
                          </div>

                          {/* Preço */}
                          <div className="mb-4">
                            <p className="text-3xl font-bold text-slate-900 leading-none">
                              {formatCurrency(tier.value)}
                            </p>
                          </div>
                            
                          {/* Métricas - sempre no final */}
                          {(tier.roi || tier.payback || tier.reduction) && (
                            <div className="pt-3 border-t border-slate-200 space-y-1 mt-auto">
                              {tier.roi && (
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-600 text-xs">ROI:</span>
                                  <span className="font-semibold text-xs">+{tier.roi}%</span>
                                </div>
                              )}
                              {tier.payback && (
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-600 text-xs">Payback:</span>
                                  <span className="font-semibold text-xs">{tier.payback} meses</span>
                                </div>
                              )}
                              {tier.reduction && (
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-600 text-xs">Redução:</span>
                                  <span className="font-semibold text-xs">{tier.reduction} h/mês</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  {data.financial.recommendationBox?.enabled && (
                    <div className="pdf-card bg-green-50 border-2 border-green-200 rounded-lg p-5 flex items-start gap-4 mt-6">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-base mb-2">
                          💡 Recomendação DLR:
                        </h4>
                        <p className="text-slate-700 text-sm leading-relaxed">
                          {data.financial.recommendationBox.text}
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              </>
            )}

            {/* Formas de Pagamento */}
            {data.financial?.paymentMethods && data.financial.paymentMethods.filter(p => p.enabled).length > 0 && (
              <>
                <section className="pdf-section mb-8">
                  <h3 className="text-xl font-semibold text-slate-900 mb-5">
                    Formas de Pagamento
                  </h3>
                  <div className="space-y-3">
                    {data.financial.paymentMethods
                      .filter(p => p.enabled)
                      .map((method, index) => (
                        <div 
                          key={index}
                          className="pdf-card p-4 rounded-lg border-2 border-slate-200 bg-white flex items-start gap-3"
                        >
                          <div className="p-2 rounded-lg bg-slate-100 flex-shrink-0">
                            <div className="text-slate-600">
                              {getPaymentIcon(method.title)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 text-sm mb-1">{method.title}</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">{method.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              </>
            )}

            {/* Custos de Infraestrutura e APIs */}
            {data.infrastructure?.enabled && data.infrastructure.services && data.infrastructure.services.length > 0 && (
              <>
                <section className="pdf-page-break pdf-section">
                  <div className="pdf-section-header">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Custos de Infraestrutura e APIs
                    </h2>
                    <p className="text-slate-600 text-base">Serviços de terceiros necessários para operação</p>
                    <div className="w-16 h-1 bg-blue-600 mt-3"></div>
                  </div>

                  {data.infrastructure.introduction && (
                    <p className="pdf-text text-slate-700">
                      {data.infrastructure.introduction}
                    </p>
                  )}

                  {/* Grid de Serviços */}
                  <div className="space-y-4">
                    {data.infrastructure.services
                    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999)) // Ordena por order
                    .map((service, index) => (
                      <div 
                        key={index}
                        className="pdf-card bg-white border-2 border-slate-200 rounded-lg overflow-hidden"
                      >
                        {/* Header do Card */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-slate-200 p-4">
                          <div className="flex items-center gap-4">
                            {/* Logo */}
                            {service.logo?.value && (
                              <div className="w-16 h-16 bg-white rounded-lg border-2 border-slate-200 flex items-center justify-center p-2 flex-shrink-0">
                                <img
                                  src={service.logo.value}
                                  alt={service.name}
                                  className="max-w-full max-h-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            
                            {/* Nome e Modelo */}
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-slate-900 mb-1">
                                {service.name}
                              </h3>
                              {service.model && (
                                <p className="text-sm text-slate-600">
                                  {service.model}
                                </p>
                              )}
                            </div>

                            {/* Custo Mensal - Destaque */}
                            <div className="text-right bg-white rounded-lg border-2 border-indigo-200 px-4 py-2">
                              <p className="text-xs text-slate-600 mb-1">Custo Mensal</p>
                              <p className="text-2xl font-bold text-indigo-600">
                                {formatCurrency(service.costs.monthlyCost)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Body do Card - Métricas */}
                        <div className="p-4">
                          <div className="grid grid-cols-3 gap-4 mb-3">
                            {/* Requisições por Dia */}
                            <div className="text-center bg-blue-50 rounded-lg p-3 border border-blue-200">
                              <div className="flex items-center justify-center mb-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                              </div>
                              <p className="text-2xl font-bold text-blue-600 mb-1">
                                {service.volume.requestsPerDay.toLocaleString('pt-BR')}
                              </p>
                              <p className="text-xs text-slate-600">Requisições/Dia</p>
                            </div>

                            {/* Requisições por Mês */}
                            <div className="text-center bg-purple-50 rounded-lg p-3 border border-purple-200">
                              <div className="flex items-center justify-center mb-2">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                              </div>
                              <p className="text-2xl font-bold text-purple-600 mb-1">
                                {service.volume.requestsPerMonth.toLocaleString('pt-BR')}
                              </p>
                              <p className="text-xs text-slate-600">Requisições/Mês</p>
                            </div>

                            {/* Custo por Requisição */}
                            <div className="text-center bg-green-50 rounded-lg p-3 border border-green-200">
                              <div className="flex items-center justify-center mb-2">
                                <DollarSign className="w-5 h-5 text-green-600" />
                              </div>
                              <p className="text-2xl font-bold text-green-600 mb-1">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                  minimumFractionDigits: 4,
                                  maximumFractionDigits: 4,
                                }).format(service.costs.costPerRequest)}
                              </p>
                              <p className="text-xs text-slate-600">Custo/Requisição</p>
                            </div>
                          </div>

                          {/* Descrição/Observação */}
                          {service.description && (
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {service.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Resumo Total */}
                  <div className="pdf-card bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-6 mt-6">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-sm opacity-90 mb-1">Custo Total de Infraestrutura</p>
                          <h3 className="text-3xl font-bold">
                            {formatCurrency(
                              data.infrastructure.services.reduce(
                                (sum, service) => sum + (service.costs.monthlyCost || 0),
                                0
                              )
                            )}
                            <span className="text-lg font-normal opacity-90">/mês</span>
                          </h3>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm opacity-90 mb-1">Custo Anual</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(
                            data.infrastructure.services.reduce(
                              (sum, service) => sum + (service.costs.monthlyCost || 0),
                              0
                            ) * 12
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Nota para o Cliente */}
                  {data.infrastructure.clientNote && (
                    <div className="pdf-card bg-amber-50 border-2 border-amber-200 rounded-lg p-5 flex items-start gap-4 mt-6">
                      <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 text-base mb-2">
                          📌 Importante
                        </h4>
                        <p className="text-slate-700 text-sm leading-relaxed">
                          {data.infrastructure.clientNote}
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              </>
            )}

            {/* Planos de Suporte */}
            {data.support?.enabled && data.support.tiers && data.support.tiers.filter(t => t.enabled).length > 0 && (
              <>
                <section className="pdf-page-break pdf-section">
                  <div className="pdf-section-header">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Planos de Suporte e Manutenção
                    </h2>
                    <p className="text-slate-600 text-base">Opções de suporte contínuo para seu projeto</p>
                    <div className="w-16 h-1 bg-blue-600 mt-3"></div>
                  </div>

                  {data.support.introduction && (
                    <p className="pdf-text text-slate-700">
                      {data.support.introduction}
                    </p>
                  )}

                  <div className="pdf-grid-3">
                    {data.support.tiers
                      .filter(t => t.enabled)
                      .map((tier, index) => (
                        <div 
                          key={index}
                          className={`pdf-card rounded-lg p-5 flex flex-col ${
                            tier.isRecommended 
                              ? 'bg-green-50 border-2 border-green-500' 
                              : 'bg-white border-2 border-slate-200'
                          }`}
                          style={{ minHeight: '420px' }}
                        >
                          {/* Cabeçalho */}
                          <div className="mb-3">
                            <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">
                              {tier.name} {tier.isRecommended && '⭐'}
                            </h3>
                          </div>

                          {/* Descrição com bullets */}
                          <div className="mb-4 flex-grow">
                            {tier.description && (
                              <div 
                                className="text-xs text-slate-600 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:list-inside [&_ul]:pl-0 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:pl-0 [&_li]:mb-1 [&_li]:leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: tier.description }}
                              />
                            )}
                          </div>

                          {/* Preço */}
                          <div className="mb-4">
                            <p className="text-3xl font-bold text-slate-900 leading-none">
                              {formatCurrency(tier.value)}
                              <span className="text-base font-normal text-slate-600">/mês</span>
                            </p>
                          </div>
                            
                          {/* Métricas - sempre no final */}
                          <div className="pt-3 border-t border-slate-200 space-y-2 mt-auto">
                            {tier.responseTime && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-600 text-xs flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Resposta:
                                </span>
                                <span className="font-semibold text-xs">{tier.responseTime}</span>
                              </div>
                            )}
                            {tier.availability && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-600 text-xs flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Disponibilidade:
                                </span>
                                <span className="font-semibold text-xs">{tier.availability}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>

                  {data.support.recommendationBox?.enabled && (
                    <div className="pdf-card bg-green-50 border-2 border-green-200 rounded-lg p-5 flex items-start gap-4 mt-6">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-base mb-2">
                          💡 Recomendação DLR:
                        </h4>
                        <p className="text-slate-700 text-sm leading-relaxed">
                          {data.support.recommendationBox.text}
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              </>
            )}

            {/* Treinamento */}
            {data.timeline?.sections?.training && (
              <>
                <section className="pdf-page-break pdf-section">
                  <div className="pdf-section-header">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Treinamento
                    </h2>
                    <p className="text-slate-600 text-base">Capacitação completa para autonomia</p>
                    <div className="w-16 h-1 bg-blue-600 mt-3"></div>
                  </div>

                  <div className="pdf-card bg-indigo-50 border-2 border-indigo-200 rounded-lg p-5 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-base mb-2">
                          Nossa Metodologia
                        </h3>
                        <p className="text-slate-700 text-sm leading-relaxed mb-2">
                          "Transferimos o conhecimento e capacitamos sua equipe para usar, manter e evoluir as soluções."
                        </p>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          <strong>Objetivo:</strong> Garantir que o cliente e sua equipe compreendam e usem bem as soluções implementadas, reduzindo dependência e aumentando o retorno sobre o investimento.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 mb-5">
                    Como Fazemos
                  </h3>

                  <div className="pdf-grid-2 mb-6">
                    <div className="pdf-card bg-green-50 border-2 border-green-200 rounded-lg p-5">
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-3">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-slate-900 text-base mb-2">
                        Treinamento Prático
                      </h4>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Capacitação para usar a solução em situações reais do seu negócio. Nada de teoria genérica.
                      </p>
                    </div>

                    <div className="pdf-card bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-slate-900 text-base mb-2">
                        Conteúdo Técnico
                      </h4>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Para pequenas alterações e manutenções. Exemplos: "como alterar o prompt do agente", "como alterar uma imagem".
                      </p>
                    </div>

                    <div className="pdf-card bg-purple-50 border-2 border-purple-200 rounded-lg p-5">
                      <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-slate-900 text-base mb-2">
                        Documentação Completa
                      </h4>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Criação e entrega de documentação clara e acessível, com manuais e tutoriais passo a passo para consulta.
                      </p>
                    </div>

                    <div className="pdf-card bg-orange-50 border-2 border-orange-200 rounded-lg p-5">
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-3">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-slate-900 text-base mb-2">
                        Sessões de Handover
                      </h4>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Transferência formal de conhecimento para o cliente.
                      </p>
                    </div>
                  </div>

                  <div className="pdf-card bg-slate-50 border-2 border-slate-200 rounded-lg p-5">
                    <h4 className="font-semibold text-slate-900 text-base mb-3">
                      Resultado Esperado
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-slate-700 text-sm leading-relaxed">Autonomia e Segurança para usar as soluções (e manter, conforme o caso)</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-slate-700 text-sm leading-relaxed">Redução de dependência da consultoria no dia a dia</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-slate-700 text-sm leading-relaxed">Maior engajamento e adesão à nova forma de trabalho</p>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Cronograma */}
            {data.timeline && data.timeline.phases && data.timeline.phases.length > 0 && (
              <>
                <section className="pdf-page-break pdf-section">
                  <div className="pdf-section-header">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Cronograma e Fases de Execução
                    </h2>
                    <p className="text-slate-600 text-base">Metodologia estruturada de entrega</p>
                    <div className="w-16 h-1 bg-blue-600 mt-3"></div>
                  </div>

                  <p className="pdf-text text-slate-700">
                    Nossa metodologia comprovada garante entrega rápida e com mínima interrupção nas suas operações. O projeto é dividido em fases claras com entregas definidas.
                  </p>

                  {/* Prazo Total Estimado */}
                  {(() => {
                    let totalWeeks = 0;
                    data.timeline.phases.forEach((phase) => {
                      const duration = Number(phase.duration) || 0;
                      const unit = phase.durationUnit;
                      if (unit === 'week') {
                        totalWeeks += duration;
                      } else if (unit === 'month') {
                        totalWeeks += duration * 4;
                      }
                    });
                    const totalMonths = Math.round(totalWeeks / 4);

                    return (
                      <div className="pdf-card bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-6 mb-6 flex items-center gap-6">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock className="w-9 h-9 text-white" />
                        </div>
                        <div className="flex-1 text-white">
                          <p className="text-sm opacity-90 mb-2">Prazo Total Estimado</p>
                          <div className="flex items-baseline gap-3">
                            <p className="text-4xl font-bold">
                              {totalWeeks}
                            </p>
                            <p className="text-xl font-medium opacity-90">
                              {totalWeeks === 1 ? 'semana' : 'semanas'}
                            </p>
                            {totalWeeks >= 4 && (
                              <>
                                <span className="text-2xl opacity-60">•</span>
                                <p className="text-2xl font-semibold">
                                  {totalMonths} {totalMonths === 1 ? 'mês' : 'meses'}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Fases */}
                  <div className="space-y-5">
                    {data.timeline.phases.map((phase, index) => (
                      <div key={index} className="pdf-card flex gap-5 items-start">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-lg p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">
                              Fase {index + 1}
                            </span>
                          </div>
                          <h3 className="font-semibold text-slate-900 text-base mb-1">
                            {phase.name}
                          </h3>
                          <p className="text-sm text-slate-600 mb-2">
                            {phase.duration} {phase.durationUnit === 'week' ? 'semana' : 'mês'}{phase.duration > 1 ? 's' : ''}
                          </p>
                          <p className="text-slate-700 text-sm leading-relaxed">
                            {phase.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Próximos Passos */}
            {data.timeline && data.timeline.nextSteps && data.timeline.nextSteps.length > 0 && (
              <>
                <section className="pdf-section">
                  <div className="pdf-section-header">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Próximos Passos
                    </h2>
                    <div className="w-16 h-1 bg-blue-600"></div>
                  </div>
                  <div className="space-y-5">
                    {data.timeline.nextSteps.map((step, index) => (
                      <div key={index} className="pdf-card flex gap-5 items-start">
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">{step.number}</span>
                          </div>
                        </div>
                        <div className="flex-1 pt-2">
                          <h3 className="font-semibold text-slate-900 text-base mb-1">{step.title}</h3>
                          <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Por que a DLR */}
            {data.timeline?.sections?.whyUs && (
              <>
                <section className="pdf-page-break pdf-section">
                  <div className="pdf-section-header">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Por que a DLR AI Consultoria
                    </h2>
                    <p className="text-slate-600 text-base">Nossos diferenciais</p>
                    <div className="w-16 h-1 bg-blue-600 mt-3"></div>
                  </div>

                  <div className="pdf-grid-2">
                    <div className="pdf-card bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-base mb-2">
                        Visão de Negócios + Domínio Técnico
                      </h3>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Mais de 20 anos atuando em empresas de diferentes portes e setores. Não entregamos scripts, entregamos soluções que realmente funcionam e geram resultados mensuráveis.
                      </p>
                    </div>

                    <div className="pdf-card bg-green-50 border-2 border-green-200 rounded-lg p-5">
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-3">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-base mb-2">
                        Foco em ROI
                      </h3>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Todas as automações são justificadas com impacto financeiro e tempo economizado documentados.
                      </p>
                    </div>

                    <div className="pdf-card bg-orange-50 border-2 border-orange-200 rounded-lg p-5">
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-3">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-base mb-2">
                        Abordagem Progressiva
                      </h3>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Começamos simples e evoluímos conforme o retorno aparece. Investimento incremental e inteligente.
                      </p>
                    </div>

                    <div className="pdf-card bg-purple-50 border-2 border-purple-200 rounded-lg p-5">
                      <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-base mb-2">
                        Metodologia de Gestão de Projetos
                      </h3>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Cada automação é tratada como projeto, com planejamento, acompanhamento e entregas claras.
                      </p>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* CTA Final */}
            {data.timeline?.cta && (
              <section className="pdf-card bg-slate-50 border-2 border-slate-200 rounded-lg p-10 text-center mt-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  {data.timeline.cta.title}
                </h2>
                <p className="text-base text-slate-600 mb-6 leading-relaxed max-w-2xl mx-auto">
                  {data.timeline.cta.subtitle}
                </p>
                {data.timeline.cta.whatsappLink ? (
                  <a 
                    href={data.timeline.cta.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold text-base shadow-lg hover:bg-indigo-700 transition-colors no-underline"
                  >
                    {data.timeline.cta.buttonText}
                  </a>
                ) : (
                  <div className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold text-base shadow-lg">
                    {data.timeline.cta.buttonText}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}