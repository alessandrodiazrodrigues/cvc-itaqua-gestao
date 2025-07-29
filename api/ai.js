// /api/ai.js - Versão otimizada com GPT-4o-mini + medidor de custo + imagens corrigidas

// 📋 TEMPLATES INLINE
const templates = {
  'Aéreo Múltiplas Opções': `*Passagens Aéreas - Opções Disponíveis*

📋 *OPÇÃO 1: [COMPANHIA_1]*
🗓️ [DATA_IDA_1] a [DATA_VOLTA_1] ([DURACAO_1])
✈️ Ida: [DATA_IDA_1] - [AEROPORTO_ORIGEM_1] [HORA_IDA_1] / [AEROPORTO_DESTINO_1] [HORA_CHEGADA_1]
✈️ Volta: [DATA_VOLTA_1] - [AEROPORTO_DESTINO_VOLTA_1] [HORA_SAIDA_VOLTA_1] / [AEROPORTO_ORIGEM_VOLTA_1] [HORA_CHEGADA_VOLTA_1]
💰 R$ [VALOR_TOTAL_1] para [COMPOSICAO_PASSAGEIROS_1]
💳 [FORMA_PAGAMENTO_1]
🔗 [LINK_CVC_1]

📋 *OPÇÃO 2: [COMPANHIA_2]*
🗓️ [DATA_IDA_2] a [DATA_VOLTA_2] ([DURACAO_2])
✈️ Ida: [DATA_IDA_2] - [AEROPORTO_ORIGEM_2] [HORA_IDA_2] / [AEROPORTO_DESTINO_2] [HORA_CHEGADA_2]
✈️ Volta: [DATA_VOLTA_2] - [AEROPORTO_DESTINO_VOLTA_2] [HORA_SAIDA_VOLTA_2] / [AEROPORTO_ORIGEM_VOLTA_2] [HORA_CHEGADA_VOLTA_2]
💰 R$ [VALOR_TOTAL_2] para [COMPOSICAO_PASSAGEIROS_2]
💳 [FORMA_PAGAMENTO_2]
🔗 [LINK_CVC_2]

📋 *OPÇÃO 3: [COMPANHIA_3]*
🗓️ [DATA_IDA_3] a [DATA_VOLTA_3] ([DURACAO_3])
✈️ Ida: [DATA_IDA_3] - [AEROPORTO_ORIGEM_3] [HORA_IDA_3] / [AEROPORTO_DESTINO_3] [HORA_CHEGADA_3]
✈️ Volta: [DATA_VOLTA_3] - [AEROPORTO_DESTINO_VOLTA_3] [HORA_SAIDA_VOLTA_3] / [AEROPORTO_ORIGEM_VOLTA_3] [HORA_CHEGADA_VOLTA_3]
💰 R$ [VALOR_TOTAL_3] para [COMPOSICAO_PASSAGEIROS_3]
💳 [FORMA_PAGAMENTO_3]
🔗 [LINK_CVC_3]

⚠️ Valores sujeitos a alteração e disponibilidade! A melhor forma de garantir o preço é efetuando a compra.

📞 Dúvidas? Estamos aqui para ajudar você a escolher a melhor opção!`,

  'Aéreo Facial': `*Passagem Aérea*
[COMPANHIA_AEREA] 
[DATA_IDA] - [AEROPORTO_ORIGEM] [HORA_SAIDA] / [AEROPORTO_DESTINO] [HORA_CHEGADA]
[DATA_VOLTA] - [AEROPORTO_DESTINO_VOLTA] [HORA_SAIDA_VOLTA] / [AEROPORTO_ORIGEM_VOLTA] [HORA_CHEGADA_VOLTA]

💰 R$ [VALOR_TOTAL] para [COMPOSICAO_PASSAGEIROS]
💳 [FORMA_PAGAMENTO]
🔗 [LINK_CVC]

⚠️ Valores sujeitos a alteração e disponibilidade! A melhor forma de garantir o preço é efetuando a compra.`,

  'Aéreo VBI/Fácil': `*Passagem Aérea VBI - Venda Bem Informada*
[COMPANHIA_AEREA]
[DATA_IDA] - [AEROPORTO_ORIGEM] [HORA_SAIDA] / [AEROPORTO_DESTINO] [HORA_CHEGADA]
[DATA_VOLTA] - [AEROPORTO_DESTINO_VOLTA] [HORA_SAIDA_VOLTA] / [AEROPORTO_ORIGEM_VOLTA] [HORA_CHEGADA_VOLTA]

✅ *O que inclui:*
• Taxas de embarque
• Bagagem de mão [PESO_BAGAGEM_MAO]kg
• Item pessoal
• [OUTROS_INCLUSOS]

💰 R$ [VALOR_TOTAL] para [COMPOSICAO_PASSAGEIROS]
💳 Parcelamento: até [QTDE_PARCELAS]x no cartão de crédito

📋 *Documentação necessária:*
• RG ou CNH dentro da validade
• [DOCUMENTOS_ADICIONAIS]

⚠️ Preços sujeitos à disponibilidade. Garantimos o valor apenas na finalização da compra.`,

  'Hotel': `*Hospedagem*
🏨 [NOME_HOTEL] - [CATEGORIA_ESTRELAS]⭐
📍 [LOCALIZACAO_HOTEL]
🗓️ [DATA_CHECK_IN] a [DATA_CHECK_OUT] ([QTDE_NOITES] noites)
👥 [QTDE_ADULTOS] adultos[QTDE_CRIANCAS_TEXTO]

🏠 *Acomodação:*
[TIPO_QUARTO] com [REGIME_ALIMENTACAO]

✅ *Inclui:*
• [TIPO_CAFE]
• [WIFI_INCLUSO]
• [SERVICOS_INCLUSOS]

💰 R$ [VALOR_TOTAL_HOSPEDAGEM] para toda a estadia
💳 Parcelamento: [QTDE_PARCELAS]x de R$ [VALOR_PARCELA_HOTEL]

🌟 *Destaques do hotel:*
• [DESTAQUE_1]
• [DESTAQUE_2]
• [DESTAQUE_3]

⚠️ Tarifas sujeitas à disponibilidade no momento da reserva.`,

  'default': `*Orçamento CVC Itaqua*
📍 Destino: [DESTINO]
🗓️ Período: [PERIODO_VIAGEM]
👥 Passageiros: [PASSAGEIROS]

💰 Valor: R$ [VALOR_ORCAMENTO]
💳 Formas de pagamento: [OPCOES_PAGAMENTO]

📋 *Serviços inclusos:*
[SERVICOS_DETALHADOS]

⚠️ Valores sujeitos a alteração conforme disponibilidade no momento da reserva.

📞 CVC Itaqua - Filial 6220
Estamos aqui para ajudar você a realizar essa viagem!`
};

// ✈️ MAPEAMENTO DE AEROPORTOS
const aeroportos = {
  'CGH': 'Congonhas', 'GRU': 'Guarulhos', 'VCP': 'Viracopos',
  'SDU': 'Santos Dumont', 'GIG': 'Galeão',
  'RAO': 'Ribeirão Preto', 'BPS': 'Porto Seguro', 'SSA': 'Salvador', 'IOS': 'Ilhéus',
  'BSB': 'Brasília', 'CNF': 'Confins', 'PLU': 'Pampulha', 'CWB': 'Afonso Pena',
  'IGU': 'Foz do Iguaçu', 'REC': 'Recife', 'FOR': 'Fortaleza', 'MAO': 'Manaus',
  'BEL': 'Belém', 'CGB': 'Cuiabá', 'CGR': 'Campo Grande', 'AJU': 'Aracaju',
  'MCZ': 'Maceió', 'JPA': 'João Pessoa', 'NAT': 'Natal', 'THE': 'Teresina',
  'SLZ': 'São Luís', 'VIX': 'Vitória', 'FLN': 'Florianópolis', 'POA': 'Porto Alegre'
};

// 💰 PREÇOS MODELOS OPENAI (USD por 1K tokens)
const PRECOS_MODELOS = {
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 }
};

// 💱 Taxa de conversão USD para BRL (atualizar periodicamente)
const USD_TO_BRL = 5.2;

export default async function handler(req, res) {
  try {
    console.log('🚀 [CVC] API otimizada iniciada');
    console.log('🚀 [CVC] Método:', req.method);
    
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    // OPTIONS
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ message: 'CORS OK' });
    }

    // GET - Endpoint de status com métricas
    if (req.method === 'GET') {
      return res.status(200).json({ 
        message: 'CVC Itaqua API Otimizada',
        version: '3.0.0-optimized',
        timestamp: new Date().toISOString(),
        features: [
          'GPT-4o-mini para texto (92% economia)',
          'GPT-4o para imagens',
          'Medidor de custo em tempo real',
          'Templates múltiplas opções',
          'Aeroportos por extenso'
        ],
        models: {
          text_only: 'gpt-4o-mini',
          with_image: 'gpt-4o'
        },
        pricing: PRECOS_MODELOS
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' });
    }

    // Validações
    if (!req.body) {
      return res.status(400).json({ error: 'Body obrigatório' });
    }
    
    const { prompt, tipo, destino, tipos, temImagem, arquivo } = req.body;
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Prompt obrigatório',
        received: { prompt: typeof prompt, length: prompt?.length || 0 }
      });
    }
    
    console.log('✅ [CVC] Dados válidos recebidos');
    console.log('📊 [CVC] Prompt length:', prompt.length);
    console.log('📊 [CVC] Tem imagem:', temImagem);

    // 🧮 CONTADOR DE TOKENS (estimativa)
    const tokensInput = Math.ceil(prompt.length / 4); // Estimativa: 4 chars = 1 token
    const tokensEstimadosOutput = 800; // Estimativa baseada em orçamentos típicos

    // 🎯 SELEÇÃO INTELIGENTE DE MODELO
    const modeloEscolhido = temImagem ? 'gpt-4o' : 'gpt-4o-mini';
    const precoModelo = PRECOS_MODELOS[modeloEscolhido];
    
    // 💰 CÁLCULO DE CUSTO ESTIMADO
    const custoInput = (tokensInput / 1000) * precoModelo.input;
    const custoOutput = (tokensEstimadosOutput / 1000) * precoModelo.output;
    const custoTotalUSD = custoInput + custoOutput;
    const custoTotalBRL = custoTotalUSD * USD_TO_BRL;

    console.log('💰 [CUSTO] Modelo:', modeloEscolhido);
    console.log('💰 [CUSTO] Tokens input:', tokensInput);
    console.log('💰 [CUSTO] Custo estimado: $', custoTotalUSD.toFixed(6), '(R$', custoTotalBRL.toFixed(4), ')');

    // Seleção de template
    const template = selecionarTemplate(tipos, tipo, prompt);
    
    // Construir prompt otimizado
    const promptFinal = construirPromptOtimizado(prompt, template, { destino, tipos, temImagem, tipo });
    
    // 🤖 CHAMAR IA COM MODELO OTIMIZADO
    const resultado = await chamarIAOtimizada(promptFinal, temImagem, arquivo, modeloEscolhido);
    
    console.log('✅ [CVC] IA respondeu');
    
    // Processar resposta
    const responseProcessada = processarResposta(resultado.content);
    
    // 💰 CÁLCULO REAL DE CUSTO (se disponível)
    const tokensReaisInput = resultado.usage?.prompt_tokens || tokensInput;
    const tokensReaisOutput = resultado.usage?.completion_tokens || tokensEstimadosOutput;
    const custoRealUSD = ((tokensReaisInput / 1000) * precoModelo.input) + ((tokensReaisOutput / 1000) * precoModelo.output);
    const custoRealBRL = custoRealUSD * USD_TO_BRL;

    // 📊 MÉTRICAS DETALHADAS
    const metricas = {
      modelo_usado: modeloEscolhido,
      tokens: {
        input: tokensReaisInput,
        output: tokensReaisOutput,
        total: tokensReaisInput + tokensReaisOutput
      },
      custo: {
        usd: custoRealUSD,
        brl: custoRealBRL,
        input_usd: (tokensReaisInput / 1000) * precoModelo.input,
        output_usd: (tokensReaisOutput / 1000) * precoModelo.output
      },
      economia: {
        vs_gpt4o: temImagem ? 0 : calculateEconomia(tokensReaisInput, tokensReaisOutput),
        percentual: temImagem ? 0 : 92
      },
      timestamp: new Date().toISOString()
    };

    console.log('💰 [CUSTO REAL]', metricas.custo);

    // Resposta final com métricas completas
    return res.status(200).json({
      success: true,
      choices: [{
        message: { content: responseProcessada }
      }],
      metricas: metricas,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '3.0.0-optimized',
        template_usado: template.substring(0, 50) + '...',
        tipos: tipos || [],
        temImagem: !!temImagem
      }
    });

  } catch (error) {
    console.error('💥 [CVC] Erro:', error);
    
    return res.status(500).json({
      success: false,
      error: {
        message: error.message,
        timestamp: new Date().toISOString()
      },
      debug: {
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 5)
      }
    });
  }
}

// 🧮 Calcular economia vs GPT-4o
function calculateEconomia(tokensInput, tokensOutput) {
  const custoGPT4o = ((tokensInput / 1000) * PRECOS_MODELOS['gpt-4o'].input) + 
                     ((tokensOutput / 1000) * PRECOS_MODELOS['gpt-4o'].output);
  const custoMini = ((tokensInput / 1000) * PRECOS_MODELOS['gpt-4o-mini'].input) + 
                    ((tokensOutput / 1000) * PRECOS_MODELOS['gpt-4o-mini'].output);
  return (custoGPT4o - custoMini) * USD_TO_BRL;
}

// 🎯 Seleção de template (mantida igual)
function selecionarTemplate(tipos, tipoEspecifico, prompt) {
  try {
    const temMultiplasOpcoes = detectarMultiplasOpcoes(prompt);
    
    if (temMultiplasOpcoes && (tipos?.includes('Aéreo Facial') || tipos?.includes('Aéreo VBI/Fácil'))) {
      return templates['Aéreo Múltiplas Opções'];
    }
    
    if (tipoEspecifico && templates[tipoEspecifico]) {
      return templates[tipoEspecifico];
    }
    
    if (tipos && Array.isArray(tipos) && tipos.length > 0) {
      for (const tipo of tipos) {
        if (templates[tipo]) return templates[tipo];
      }
    }
    
    return templates['Aéreo Facial'] || templates.default;
  } catch (error) {
    console.error('❌ [TEMPLATE]:', error);
    return templates.default;
  }
}

// 🔍 Detecção múltiplas opções (mantida igual)
function detectarMultiplasOpcoes(prompt) {
  if (!prompt || typeof prompt !== 'string') return false;
  
  try {
    const texto = prompt.toLowerCase();
    const indicadores = [
      { regex: /total.*\d+.*adult/gi, minimo: 2 },
      { regex: /r\$.*\d{1,3}[\.,]\d{3}/gi, minimo: 2 },
      { regex: /(gol|latam|azul|avianca|tap)/gi, minimo: 2 },
      { regex: /\d{2}:\d{2}/g, minimo: 4 }
    ];
    
    return indicadores.some(ind => (texto.match(ind.regex) || []).length >= ind.minimo);
  } catch (error) {
    return false;
  }
}

// 🏗️ PROMPT OTIMIZADO para melhor processamento de imagens
function construirPromptOtimizado(promptBase, template, context) {
  try {
    const { destino, tipos, temImagem, tipo } = context;
    
    if (tipo === 'analise') {
      return `Você é um analista da CVC Itaqua. ${promptBase}`;
    }
    
    if (tipo === 'destino' || tipo === 'ranking') {
      return promptBase;
    }
    
    const isMultipleTemplate = template.includes('*OPÇÃO 1:*');
    
    // 🖼️ PROMPT ESPECIAL PARA IMAGENS
    if (temImagem) {
      return `Você é uma atendente especializada da CVC Itaqua (filial 6220) com expertise em análise de orçamentos visuais.

TAREFA: Analise a imagem fornecida e extraia TODAS as informações de passagens aéreas para formatar no padrão WhatsApp.

FORMATO EXATO A SEGUIR:
${template}

DADOS ADICIONAIS DO CLIENTE:
${promptBase}

INSTRUÇÕES PARA ANÁLISE DE IMAGEM:
1. Examine CUIDADOSAMENTE toda a imagem
2. Identifique TODAS as opções de passagens mostradas
3. Extraia: companhias, datas, horários, aeroportos, valores, formas de pagamento, links
4. Use nomes COMPLETOS dos aeroportos (CGH=Congonhas, GRU=Guarulhos, BPS=Porto Seguro)
5. Mantenha valores exatos em Real (R$)
6. Inclua formas de pagamento específicas de cada opção
7. Inclua links da CVC quando visíveis

${isMultipleTemplate ? `
MÚLTIPLAS OPÇÕES NA IMAGEM:
- Identifique CADA opção separadamente
- Preencha OPÇÃO 1, OPÇÃO 2, etc. com dados específicos
- Use valores TOTAIS de cada opção
- Remova seções vazias se houver menos de 3 opções
` : ''}

CONVERSÃO DE AEROPORTOS:
CGH=Congonhas, GRU=Guarulhos, BPS=Porto Seguro, RAO=Ribeirão Preto, SDU=Santos Dumont

RESULTADO: Formate APENAS o orçamento final, pronto para WhatsApp, sem explicações.`;
    }
    
    // 📝 PROMPT PARA TEXTO (igual ao anterior)
    return `Você é uma atendente experiente da CVC Itaqua (filial 6220).

Formate este orçamento seguindo EXATAMENTE o modelo:

${template}

DADOS DO CLIENTE:
${promptBase}

REGRAS:
1. Use EXATAMENTE o formato mostrado
2. Substitua [COLCHETES] pelos dados reais
3. Nomes completos de aeroportos (CGH=Congonhas, GRU=Guarulhos, BPS=Porto Seguro)
4. Inclua formas de pagamento e links CVC
5. Resultado pronto para WhatsApp

${isMultipleTemplate ? `
MÚLTIPLAS OPÇÕES:
- Identifique TODAS as opções no texto
- Preencha cada OPÇÃO com dados específicos
- Inclua formas de pagamento e links de cada opção
` : ''}

Gere APENAS o orçamento formatado.`;
    
  } catch (error) {
    console.error('❌ [PROMPT]:', error);
    return `Formate este orçamento: ${promptBase}`;
  }
}

// 🤖 CHAMADA IA OTIMIZADA (híbrida)
async function chamarIAOtimizada(prompt, temImagem, arquivo, modelo) {
  try {
    const temOpenAI = !!process.env.OPENAI_API_KEY;
    const temClaude = !!process.env.ANTHROPIC_API_KEY;
    
    console.log('🤖 [IA] Modelo selecionado:', modelo);
    console.log('🤖 [IA] APIs disponíveis - OpenAI:', temOpenAI, 'Claude:', temClaude);
    
    if (!temOpenAI && !temClaude) {
      throw new Error('Nenhuma API Key configurada');
    }
    
    if (temOpenAI) {
      return await chamarOpenAIOtimizada(prompt, temImagem, arquivo, modelo);
    } else {
      return await chamarClaude(prompt, temImagem, arquivo);
    }
    
  } catch (error) {
    console.error('❌ [IA]:', error);
    throw new Error(`Erro na IA: ${error.message}`);
  }
}

// 🔵 OPENAI OTIMIZADA com seleção de modelo
async function chamarOpenAIOtimizada(prompt, temImagem, arquivo, modelo) {
  try {
    let messages;
    
    if (temImagem && arquivo) {
      console.log('🖼️ [OPENAI] Processando com imagem usando', modelo);
      messages = [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: arquivo, detail: "high" } }
        ]
      }];
    } else {
      console.log('📝 [OPENAI] Processando texto usando', modelo);
      messages = [{ role: "user", content: prompt }];
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelo,  // 🎯 Modelo dinâmico
        messages,
        max_tokens: 2500,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [OPENAI]:', response.status, errorText);
      throw new Error(`OpenAI Error ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('OpenAI resposta inválida');
    }

    // Retornar com usage data para cálculo preciso de custo
    return {
      content: data.choices[0].message.content,
      usage: data.usage
    };
    
  } catch (error) {
    console.error('❌ [OPENAI]:', error);
    throw error;
  }
}

// 🟠 Claude (mantida igual, para fallback)
async function chamarClaude(prompt, temImagem, arquivo) {
  try {
    let content;
    
    if (temImagem && arquivo) {
      const base64Match = arquivo.match(/data:image\/[^;]+;base64,(.+)/);
      if (!base64Match) throw new Error('Formato de imagem inválido');
      
      const base64Data = base64Match[1];
      const mimeType = arquivo.match(/data:(image\/[^;]+)/)?.[1] || 'image/jpeg';
      
      content = [
        { type: "text", text: prompt },
        { type: "image", source: { type: "base64", media_type: mimeType, data: base64Data } }
      ];
    } else {
      content = prompt;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2500,
        temperature: 0.2,
        messages: [{ role: 'user', content: content }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude Error ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    
    if (!data.content?.[0]?.text) {
      throw new Error('Claude resposta inválida');
    }

    return {
      content: data.content[0].text,
      usage: data.usage
    };
    
  } catch (error) {
    console.error('❌ [CLAUDE]:', error);
    throw error;
  }
}

// 🔧 Processar resposta (mantida igual + melhorias)
function processarResposta(response) {
  try {
    let processada = response;
    
    // Remover marcações
    processada = processada.replace(/=== TEMPLATE ===/g, '');
    processada = processada.replace(/=== FIM TEMPLATE ===/g, '');
    
    // Corrigir formatação
    processada = processada.replace(/^\*([^*])/gm, '$1');
    processada = processada.replace(/([^*])\*$/gm, '$1');
    
    // Converter aeroportos
    Object.entries(aeroportos).forEach(([sigla, nome]) => {
      const regex = new RegExp(`\\b${sigla}\\b`, 'gi');
      processada = processada.replace(regex, nome);
    });
    
    // Limpar espaços
    processada = processada.replace(/\n\s*\n\s*\n/g, '\n\n');
    processada = processada.trim();
    
    return processada;
  } catch (error) {
    console.error('❌ [PROCESSAMENTO]:', error);
    return response;
  }
}

console.log('✅ [CVC] API Otimizada carregada - GPT-4o-mini + Medidor + Imagens');
