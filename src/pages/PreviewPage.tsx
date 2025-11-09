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
      margin: [5, 5, 5, 5],
      filename: `Proposta_${proposal.client_name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 0.98 
      },
      html2canvas: { 
        scale: 1.5,
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
        avoid: ['.pdf-no-break', 'img']
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
                {data.basic?.consultantName || 'DLR.ai'}
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
          <div className="p-16">
            {/* Contexto e Desafios - Página 2 */}
            {data.context && (
              <>
                <section className="pdf-page-break pdf-no-break mb-8">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-1">
                      Contexto e Entendimento
                    </h2>
                    <p className="text-slate-600">Análise da situação atual</p>
                    <div className="w-16 h-1 bg-blue-600 mt-2"></div>
                  </div>
                  
                  {data.context.currentSituation && (
                    <div className="mb-8">
                      <div 
                        className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: data.context.currentSituation }}
                      />
                    </div>
                  )}

                  {data.context.challenges && data.context.challenges.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-slate-800 mb-1">
                        Desafios Identificados
                      </h3>
                      <p className="text-slate-600 text-sm mb-4">
                        Principais obstáculos no processo atual
                      </p>
                      <div className="w-16 h-1 bg-blue-600 mb-6"></div>
                      
                      <p className="text-slate-700 mb-6">
                        Durante a análise, identificamos que o processo atual enfrenta três principais obstáculos:
                      </p>
                      
                      <div className="space-y-4">
                        {data.context.challenges.map((challenge, index) => (
                          <div 
                            key={index} 
                            className={`border-l-4 rounded-r-lg p-6 flex items-start gap-4 avoid-break ${
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
                              <h4 className="font-semibold text-slate-900 text-lg mb-2">
                                {challenge.title}
                              </h4>
                              <p className="text-slate-700 leading-relaxed">{challenge.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Impacto */}
                  {data.context.impact && (
                    <>
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold text-slate-800 mb-1">
                          Impacto
                        </h3>
                        <p className="text-slate-600 text-sm mb-4">
                          Consequências da manutenção do status quo
                        </p>
                        <div className="w-16 h-1 bg-blue-600 mb-6"></div>
                      </div>

                      {data.context.impact.introText && (
                        <p className="text-slate-700 mb-6 leading-relaxed">
                          {data.context.impact.introText}
                        </p>
                      )}

                      {/* Layout: 2 linhas, 1 coluna */}
                      <div className="space-y-6 mb-8">
                        {/* Linha 1: Custo Anual */}
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 avoid-break">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <DollarSign className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-slate-900 mb-3">
                                Custo Anual das Ineficiências
                              </h4>
                              <p className="text-5xl font-bold text-red-600 mb-4">
                                {formatCurrency(data.context.impact.annualCost || 0)}
                              </p>
                              {data.context.impact.costDescription && (
                                <p className="text-slate-700 leading-relaxed">
                                  {data.context.impact.costDescription}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Linha 2: Premissas (grid flexível) */}
                        {data.context.impact.assumptions && data.context.impact.assumptions.length > 0 && (
                          <div>
                            <h4 className="text-lg font-semibold text-slate-900 mb-4">
                              Principais Premissas Adotadas
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {data.context.impact.assumptions.map((assumption, index) => {
                                const colors = ['bg-indigo-50 border-indigo-200', 'bg-purple-50 border-purple-200', 'bg-green-50 border-green-200'];
                                const iconColors = ['bg-indigo-100 text-indigo-600', 'bg-purple-100 text-purple-600', 'bg-green-100 text-green-600'];
                                return (
                                  <div 
                                    key={index}
                                    className={`border-2 rounded-lg p-5 ${colors[index % 3]} flex items-start gap-3 avoid-break`}
                                  >
                                    <div className={`w-12 h-12 rounded-lg ${iconColors[index % 3]} flex items-center justify-center flex-shrink-0`}>
                                      {getIconComponent(assumption.icon || 'Target')}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-2xl font-bold text-slate-900 mb-2">
                                        {assumption.value}
                                      </p>
                                      <p className="text-sm text-slate-600 leading-relaxed">
                                        {assumption.description}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {data.context.impact.provenImpactBox?.enabled && (
                        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6 avoid-break">
                          <h4 className="font-semibold text-slate-900 mb-2">
                            {data.context.impact.provenImpactBox.title}
                          </h4>
                          <p className="text-slate-700 mb-2">
                            {data.context.impact.provenImpactBox.mainMessage}
                          </p>
                          {data.context.impact.provenImpactBox.secondaryMessage && (
                            <p className="text-slate-600">
                              {data.context.impact.provenImpactBox.secondaryMessage}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </section>

                <div className="border-t-2 border-slate-200 my-6"></div>
              </>
            )}

            {/* Solução Proposta - Página 3 */}
            {data.solution && (
              <>
                <section className="pdf-page-break pdf-no-break mb-8">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-1">
                      Necessidade e Oportunidade
                    </h2>
                    <p className="text-slate-600">A solução proposta</p>
                    <div className="w-16 h-1 bg-blue-600 mt-2"></div>
                  </div>

                  {data.solution.introText && (
                    <p className="text-slate-700 leading-relaxed mb-8">
                      {data.solution.introText}
                    </p>
                  )}
                  
                  {data.solution.description && (
                    <div 
                      className="prose prose-slate prose-lg max-w-none mb-8 text-slate-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: data.solution.description }}
                    />
                  )}

                  {data.solution.features && data.solution.features.length > 0 && (
                    <div className="grid grid-cols-2 gap-6 mt-8">
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
                            className={`border-2 rounded-lg p-6 avoid-break ${getFeatureColorClasses(feature.color || 'indigo')}`}
                          >
                            <div className="flex items-start gap-3 mb-4">
                              <div className={`w-10 h-10 rounded-lg ${getIconColorClasses(feature.color || 'indigo')} flex items-center justify-center flex-shrink-0`}>
                                {getIconComponent(feature.icon || 'Target')}
                              </div>
                              <h3 className="font-semibold text-slate-900 text-lg flex-1">
                                {feature.title}
                              </h3>
                            </div>
                            <p className="text-slate-700 mb-3 leading-relaxed text-sm">
                              {feature.description}
                            </p>
                            {feature.tags && feature.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {feature.tags.map((tag, tagIndex) => (
                                  <span 
                                    key={tagIndex}
                                    className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-medium"
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

                <div className="border-t-2 border-slate-200 my-6"></div>
              </>
            )}

            {/* Retorno sobre Investimento - Página 4 */}
            {data.financial?.roi && (
              <>
                <section className="pdf-page-break pdf-no-break mb-8">                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Retorno sobre o Investimento
                    </h2>
                    <p className="text-slate-600">Números baseados no estudo financeiro realizado</p>
                    <div className="w-16 h-1 bg-blue-600 mt-2"></div>
                  </div>

                  <div className="pdf-grid-4 pdf-no-break mb-8">
                    <div className="grid grid-cols-4 gap-4 mb-8">
                      <div className="bg-white border-2 border-slate-200 rounded-lg p-6 flex flex-col items-center text-center avoid-break">
                        <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mb-4">
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-bold text-slate-900 mb-2">
                          {formatCurrency(data.financial.roi.savings || 0)}
                        </p>
                        <p className="text-xs text-slate-600">Economia Anual Estimada</p>
                      </div>

                      <div className="bg-white border-2 border-slate-200 rounded-lg p-6 flex flex-col items-center text-center avoid-break">
                        <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                          <TrendingUp className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-bold text-slate-900 mb-2">
                          {formatCurrency(data.financial.roi.gain || 0)}
                        </p>
                        <p className="text-xs text-slate-600">
                          Ganho Líquido no 1º Ano e {formatCurrency(data.financial.roi.gainYear2 || 0)} no 2º ano
                        </p>
                      </div>

                      <div className="bg-white border-2 border-slate-200 rounded-lg p-6 flex flex-col items-center text-center avoid-break">
                        <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                          <Target className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-bold text-slate-900 mb-2">
                          {data.financial.roi.returnMultiplier}x
                        </p>
                        <p className="text-xs text-slate-600">Retorno por Real Investido</p>
                      </div>

                      <div className="bg-white border-2 border-slate-200 rounded-lg p-6 flex flex-col items-center text-center avoid-break">
                        <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                          <Clock className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-bold text-slate-900 mb-2">
                          {data.financial.roi.paybackMonths} meses
                        </p>
                        <p className="text-xs text-slate-600">Retorno do Investimento</p>
                      </div>
                    </div>
                  </div>

                  {data.context?.impact?.provenImpactBox?.enabled && (
                    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6 avoid-break">
                      <h4 className="font-semibold text-slate-900 mb-3">
                        Impacto Comprovado
                      </h4>
                      <p className="text-slate-700 mb-2">
                        {data.context.impact.provenImpactBox.mainMessage}
                      </p>
                      {data.context.impact.provenImpactBox.secondaryMessage && (
                        <p className="text-slate-600">
                          {data.context.impact.provenImpactBox.secondaryMessage}
                        </p>
                      )}
                    </div>
                  )}
                </section>

                <div className="border-t-2 border-slate-200 my-6"></div>
              </>
            )}

            {/* Propostas de Implementação - Página 5 */}
            {data.financial?.tiers && data.financial.tiers.filter(t => t.enabled).length > 0 && (
              <>
                <section className="pdf-page-break pdf-no-break mb-8">                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Propostas de Implementação
                    </h2>
                    <p className="text-slate-600">Opções flexíveis para começar</p>
                    <div className="w-16 h-1 bg-blue-600 mt-2"></div>
                  </div>

                  <p className="text-slate-700 mb-8">
                    Oferecemos três níveis de implementação para atender diferentes necessidades e orçamentos.
                  </p>

                  <div className="pdf-grid-3 pdf-no-break mb-8">
                    {data.financial.tiers
                      .filter(t => t.enabled)
                      .map((tier, index) => (
                        <div 
                          key={index}
                          className={`pdf-no-break rounded-lg p-6 flex flex-col ${
                            tier.isRecommended 
                              ? 'bg-indigo-50 border-2 border-indigo-500' 
                              : 'bg-white border-2 border-slate-200'
                          }`}
                          style={{ minHeight: '450px', maxHeight: '450px' }}
                        >
                          {/* Cabeçalho */}
                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-slate-900 mb-2 min-h-[32px]">
                              {tier.name} {tier.isRecommended && '⭐'}
                            </h3>
                          </div>

                          {/* Descrição com bullets */}
                          <div className="mb-6 flex-grow">
                            {tier.description && (
                              <div 
                                className="text-sm text-slate-600 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:list-inside [&_ol]:list-decimal [&_ol]:list-inside [&_li]:mb-1"
                                dangerouslySetInnerHTML={{ __html: tier.description }}
                              />
                            )}
                          </div>

                          {/* Preço */}
                          <div className="mb-6">
                            <p className="text-4xl font-bold text-slate-900">
                              {formatCurrency(tier.value)}
                            </p>
                          </div>
                            
                          {/* Métricas - sempre no final */}
                          {(tier.roi || tier.payback || tier.reduction) && (
                            <div className="pt-4 border-t border-slate-200 space-y-1 mt-auto">
                              {tier.roi && (
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-600 text-sm">ROI:</span>
                                  <span className="font-semibold text-sm">+{tier.roi}%</span>
                                </div>
                              )}
                              {tier.payback && (
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-600 text-sm">Payback:</span>
                                  <span className="font-semibold text-sm">{tier.payback} meses</span>
                                </div>
                              )}
                              {tier.reduction && (
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-600 text-sm">Redução:</span>
                                  <span className="font-semibold text-sm">{tier.reduction} horas/mês</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  {data.financial.recommendationBox?.enabled && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 flex items-start gap-4 avoid-break">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">
                          💡 Recomendação DLR:
                        </h4>
                        <p className="text-slate-700">
                          {data.financial.recommendationBox.text}
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                <div className="border-t-2 border-slate-200 my-6"></div>
              </>
            )}

            {/* Formas de Pagamento */}
            {data.financial?.paymentMethods && data.financial.paymentMethods.filter(p => p.enabled).length > 0 && (
              <>
                <section className="mb-8 avoid-break">
                  <h3 className="text-xl font-semibold text-slate-900 mb-6">
                    Formas de Pagamento
                  </h3>
                  <div className="space-y-4">
                    {data.financial.paymentMethods
                      .filter(p => p.enabled)
                      .map((method, index) => (
                        <div 
                          key={index}
                          className="p-5 rounded-lg border-2 border-slate-200 bg-white flex items-start gap-4 avoid-break"
                        >
                          <div className="p-3 rounded-lg bg-slate-100">
                            <div className="text-slate-600">
                              {getPaymentIcon(method.title)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-1">{method.title}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{method.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>

                <div className="border-t-2 border-slate-200 my-6"></div>
              </>
            )}

            {/* Suporte e Melhorias - Página 6 */}
            {data.timeline?.sections?.support && (
              <>
                <section className="pdf-page-break pdf-no-break mb-8">                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      O que está Incluído no Suporte e Melhorias
                    </h2>
                    <p className="text-slate-600">Detalhamento do suporte contínuo</p>
                    <div className="w-16 h-1 bg-blue-600 mt-2"></div>
                  </div>

                  <p className="text-slate-700 mb-8">
                    Oferecemos um pacote completo de suporte e melhorias contínuas:
                  </p>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 avoid-break">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-lg mb-3">
                        Pequenas Alterações
                      </h3>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Até 2 mini features por mês, incluindo ajustes de textos e prompts, troca de imagens pré-aprovadas, correção de links quebrados e pequenas correções.
                      </p>
                    </div>

                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 avoid-break">
                      <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-lg mb-3">
                        Melhorias e Features
                      </h3>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Até 1 melhoria (feature) por mês, desde que não seja muito complexa. Evoluções incrementais para otimizar o sistema.
                      </p>
                    </div>

                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 avoid-break">
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-lg mb-3">
                        Monitoramento Básico
                      </h3>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Acompanhamento do funcionamento das automações para garantir que tudo está operando conforme esperado.
                      </p>
                    </div>

                    <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 avoid-break">
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-lg mb-3">
                        Suporte Técnico
                      </h3>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Atendimento para erros, comportamento anormal e paradas de sistema durante horário comercial (9h às 18h, dias úteis).
                      </p>
                    </div>
                  </div>
                </section>

                <div className="border-t-2 border-slate-200 my-6"></div>
              </>
            )}

            {/* Treinamento - Página 7 */}
            {data.timeline?.sections?.training && (
              <>
                <section className="pdf-page-break pdf-no-break mb-8">                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Treinamento
                    </h2>
                    <p className="text-slate-600">Capacitação completa para autonomia</p>
                    <div className="w-16 h-1 bg-blue-600 mt-2"></div>
                  </div>

                  <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6 mb-8 avoid-break">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-lg mb-2">
                          Nossa Metodologia
                        </h3>
                        <p className="text-slate-700 mb-2">
                          "Transferimos o conhecimento e capacitamos sua equipe para usar, manter e evoluir as soluções."
                        </p>
                        <p className="text-slate-600 text-sm">
                          <strong>Objetivo:</strong> Garantir que o cliente e sua equipe compreendam e usem bem as soluções implementadas, reduzindo dependência e aumentando o retorno sobre o investimento.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 mb-6">
                    Como Fazemos
                  </h3>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 avoid-break">
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-3">
                        Treinamento Focado
                      </h4>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Capacitação exclusiva nas soluções implantadas, com base em casos e fluxos reais do seu negócio. Nada de teoria genérica.
                      </p>
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 avoid-break">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-3">
                        Capacitação Prática
                      </h4>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Conteúdo hands-on. Exemplos: "como alterar o prompt do agente", "como alterar os critérios de score".
                      </p>
                    </div>

                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 avoid-break">
                      <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-3">
                        Documentação Completa
                      </h4>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Criação e entrega de documentação clara e acessível, com manuais e tutoriais passo a passo para consulta.
                      </p>
                    </div>

                    <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 avoid-break">
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-3">
                        Sessões de Handover
                      </h4>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Transferência formal de conhecimento da operação para o cliente, com período de acompanhamento de 30 dias.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-6 avoid-break">
                    <h4 className="font-semibold text-slate-900 mb-3">
                      Resultado Esperado
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-slate-700">Autonomia e Segurança para usar as soluções (e manter, conforme o caso)</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-slate-700">Redução de dependência da consultoria no dia a dia</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-slate-700">Maior engajamento e adesão à nova forma de trabalho</p>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="border-t-2 border-slate-200 my-6"></div>
              </>
            )}

            {/* Cronograma - Página 8 */}
            {data.timeline && data.timeline.phases && data.timeline.phases.length > 0 && (
              <>
                <section className="pdf-page-break pdf-no-break mb-8">                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Cronograma e Fases de Execução
                    </h2>
                    <p className="text-slate-600">Metodologia estruturada de entrega</p>
                    <div className="w-16 h-1 bg-blue-600 mt-2"></div>
                  </div>

                  <p className="text-slate-700 mb-8">
                    Nossa metodologia comprovada garante entrega rápida e com mínima interrupção nas suas operações. O projeto é dividido em fases claras com entregas definidas.
                  </p>

                  <div className="space-y-6">
                    {data.timeline.phases.map((phase, index) => (
                      <div key={index} className="flex gap-6 items-start avoid-break">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-lg p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">
                              Fase {index + 1}
                            </span>
                          </div>
                          <h3 className="font-semibold text-slate-900 text-lg mb-1">
                            {phase.name}
                          </h3>
                          <p className="text-sm text-slate-600 mb-3">
                            {phase.duration} {phase.durationUnit === 'week' ? 'semana' : 'mês'}{phase.duration > 1 ? 's' : ''}
                          </p>
                          <p className="text-slate-700 leading-relaxed">
                            {phase.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="border-t-2 border-slate-200 my-6"></div>
              </>
            )}

            {/* Próximos Passos */}
            {data.timeline && data.timeline.nextSteps && data.timeline.nextSteps.length > 0 && (
              <>
                <section className="mb-8 avoid-break">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Próximos Passos
                    </h2>
                    <div className="w-16 h-1 bg-blue-600"></div>
                  </div>
                  <div className="space-y-6">
                    {data.timeline.nextSteps.map((step, index) => (
                      <div key={index} className="flex gap-6 items-start avoid-break">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-2xl">{step.number}</span>
                          </div>
                        </div>
                        <div className="flex-1 pt-3">
                          <h3 className="font-semibold text-slate-900 text-lg mb-1">{step.title}</h3>
                          <p className="text-slate-600 leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="border-t-2 border-slate-200 my-6"></div>
              </>
            )}

            {/* Por que a DLR - Página 9 */}
            {data.timeline?.sections?.whyUs && (
              <>
                <section className="pdf-page-break pdf-no-break mb-8">                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Por que a DLR AI Consultoria
                    </h2>
                    <p className="text-slate-600">Nossos diferenciais</p>
                    <div className="w-16 h-1 bg-blue-600 mt-2"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 avoid-break">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-lg mb-3">
                        Visão de Negócios + Domínio Técnico
                      </h3>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Mais de 20 anos atuando em empresas de diferentes portes e setores. Não entregamos scripts, entregamos soluções que realmente funcionam e geram resultados mensuráveis.
                      </p>
                    </div>

                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 avoid-break">
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-lg mb-3">
                        Foco em ROI
                      </h3>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Todas as automações são justificadas com impacto financeiro e tempo economizado documentados.
                      </p>
                    </div>

                    <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 avoid-break">
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-lg mb-3">
                        Abordagem Progressiva
                      </h3>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Começamos simples e evoluímos conforme o retorno aparece. Investimento incremental e inteligente.
                      </p>
                    </div>

                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 avoid-break">
                      <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-lg mb-3">
                        Metodologia de Gestão de Projetos
                      </h3>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Cada automação é tratada como projeto, com planejamento, acompanhamento e entregas claras.
                      </p>
                    </div>
                  </div>
                </section>

                <div className="border-t-2 border-slate-200 my-6"></div>
              </>
            )}

            {/* CTA Final */}
            {data.timeline?.cta && (
              <section className="bg-slate-50 border-2 border-slate-200 rounded-lg p-12 text-center avoid-break">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  {data.timeline.cta.title}
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                  {data.timeline.cta.subtitle}
                </p>
                {data.timeline.cta.whatsappLink ? (
                  <a 
                    href={data.timeline.cta.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-lg font-semibold text-lg shadow-lg hover:bg-indigo-700 transition-colors no-underline"
                  >
                    {data.timeline.cta.buttonText}
                  </a>
                ) : (
                  <div className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-lg font-semibold text-lg shadow-lg">
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