// /api/ai.js - API atualizada para múltiplas opções

import { templates } from './templates.js';

export default async function handler(req, res) {
  // CORS para permitir requisições do frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Responder a OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Apenas POST permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    console.log('📥 Requisição recebida:', req.body);
    
    const { prompt, tipo, destino, tipos, temImagem, arquivo } = req.body;
    
    // Validação básica
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt é obrigatório' });
    }
    
    // Selecionar template baseado no tipo e conteúdo
    const template = selecionarTemplate(tipos, tipo, prompt);
    console.log('📝 Template selecionado para:', tipos, tipo);
    
    // Construir prompt final com template
    const promptFinal = construirPrompt(prompt, template, { 
      destino, 
      tipos, 
      temImagem,
      tipo 
    });
    
    console.log('🤖 Enviando para IA...');
    
    // Chamar IA
    const response = await chamarIA(promptFinal, temImagem, arquivo);
    
    console.log('✅ Resposta da IA recebida');
    
    // Retornar no formato esperado pelo frontend
    res.status(200).json({ 
      success: true,
      choices: [{ 
        message: { 
          content: response 
        } 
      }]
    });

  } catch (error) {
    console.error('❌ Erro na API:', error);
    res.status(500).json({ 
      error: 'Erro interno: ' + error.message,
      details: error.stack
    });
  }
}

// 🎯 Selecionar template baseado nos tipos selecionados E conteúdo
function selecionarTemplate(tipos, tipoEspecifico, prompt) {
  console.log('🔍 Selecionando template para:', { tipos, tipoEspecifico });
  
  // Detectar se há múltiplas opções no prompt/observações
  const temMultiplasOpcoes = detectarMultiplasOpcoes(prompt);
  
  if (temMultiplasOpcoes && (tipos?.includes('Aéreo Facial') || tipos?.includes('Aéreo VBI/Fácil'))) {
    console.log('✅ Múltiplas opções detectadas - usando template especial');
    return templates['Aéreo Múltiplas Opções'];
  }
  
  // Se tipo específico existe no templates
  if (tipoEspecifico && templates[tipoEspecifico]) {
    console.log('✅ Template encontrado:', tipoEspecifico);
    return templates[tipoEspecifico];
  }
  
  // Se tem tipos selecionados, pegar o primeiro válido
  if (tipos && Array.isArray(tipos) && tipos.length > 0) {
    for (const tipo of tipos) {
      if (templates[tipo]) {
        console.log('✅ Template encontrado para tipo:', tipo);
        return templates[tipo];
      }
    }
  }
  
  // Fallback para template padrão
  console.log('⚠️ Usando template padrão');
  return templates['Aéreo Facial'] || templates.default;
}

// 🔍 DETECÇÃO CORRIGIDA - Detectar múltiplas opções de passagem no texto
function detectarMultiplasOpcoes(prompt) {
  if (!prompt) return false;
  
  const texto = prompt.toLowerCase();
  
  // ✅ INDICADORES MELHORADOS COM REGEX
  const indicadores = [
    /total.*\d+.*adult/gi,  // "Total (2 Adultos)" "Total 2 adultos" etc
    /r\$.*\d{1,3}[\.,]\d{3}/gi,  // Preços brasileiros R$ 1.234,56
    /(gol|latam|azul|avianca|tap|american|united|delta)/gi,  // Companhias aéreas
    /\d{2}:\d{2}/g,  // Horários 08:05, 19:40 etc
    /(ida|volta).*\d{2} de \w+/gi,  // "ida 30 de julho" "volta 01 de agosto"
    /https:\/\/www\.cvc\.com\.br\/carrinho-dinamico/gi,  // Links CVC
    /classe.*econômica/gi,  // Classe de voo
    /voo direto/gi  // Tipo de voo
  ];
  
  let contadores = {};
  let detalhes = {};
  
  indicadores.forEach((regex, index) => {
    const matches = (texto.match(regex) || []);
    contadores[`indicador_${index}`] = matches.length;
    detalhes[`indicador_${index}`] = matches;
  });
  
  // ✅ CRITÉRIOS MELHORADOS
  const temMultiplosPrecos = contadores.indicador_1 >= 2;  // 2+ preços
  const temMultiplasCias = contadores.indicador_2 >= 2;    // 2+ companhias
  const temMultiplosHorarios = contadores.indicador_3 >= 4; // 4+ horários (ida+volta = 2 opções)
  const temMultiplasDatas = contadores.indicador_4 >= 2;   // 2+ datas ida/volta
  const temMultiplosLinks = contadores.indicador_5 >= 2;   // 2+ links CVC
  const temMultiplosTotais = contadores.indicador_0 >= 2;  // 2+ totais
  
  const resultado = temMultiplosPrecos || temMultiplasCias || temMultiplosHorarios || 
                   temMultiplasDatas || temMultiplosLinks || temMultiplosTotais;
  
  console.log('🔍 Detecção múltiplas opções MELHORADA:', {
    resultado,
    contadores,
    criterios: {
      multiplosPrecos: temMultiplosPrecos,
      multiplasCias: temMultiplasCias, 
      multiplosHorarios: temMultiplosHorarios,
      multiplasDatas: temMultiplasDatas,
      multiplosLinks: temMultiplosLinks,
      multiplosTotais: temMultiplosTotais
    }
  });
  
  return resultado;
}

// 🏗️ Construir prompt final
function construirPrompt(promptBase, template, context) {
  const { destino, tipos, temImagem, tipo } = context;
  
  // Para análise (PDF/relatórios), não usar template
  if (tipo === 'analise') {
    return `Você é um analista da CVC Itaqua. ${promptBase}`;
  }
  
  // Para destino, usar prompt específico
  if (tipo === 'destino') {
    return promptBase; // Já vem formatado
  }
  
  // Para ranking, usar prompt específico  
  if (tipo === 'ranking') {
    return promptBase; // Já vem formatado
  }
  
  // Verificar se é template de múltiplas opções
  const isMultipleTemplate = template.includes('*OPÇÃO 1:*');
  
  // Para orçamentos, usar template
  let promptFinal = `Você é uma atendente da CVC Itaqua (filial 6220). 

IMPORTANTE: Use EXATAMENTE o template abaixo como base, substituindo os valores entre [COLCHETES] pelos dados reais:

=== TEMPLATE ===
${template}
=== FIM TEMPLATE ===

DADOS FORNECIDOS:
${promptBase}

INSTRUÇÕES GERAIS:
1. Use EXATAMENTE o formato do template acima
2. Substitua TODOS os valores [ENTRE_COLCHETES] pelos dados reais extraídos
3. Mantenha TODOS os emojis e formatação
4. Use valores em Real (R$) sempre
5. O resultado deve estar pronto para copiar e colar no WhatsApp
6. Não adicione explicações, apenas o orçamento formatado
7. NÃO inclua as marcações de template (=== TEMPLATE ===, etc)

${isMultipleTemplate ? `
INSTRUÇÕES ESPECÍFICAS PARA MÚLTIPLAS OPÇÕES:
8. IMPORTANTE: Identifique TODAS as opções de passagens disponíveis no texto
9. Preencha TODAS as opções encontradas (OPÇÃO 1, OPÇÃO 2, OPÇÃO 3, etc.)
10. Para cada opção, extraia: datas, horários, valores TOTAIS e companhias específicas
11. VALORES: Use sempre o valor TOTAL informado para cada opção
12. Se houver menos de 3 opções, remova as seções vazias do template
13. Cada opção deve mostrar a companhia aérea correspondente
` : `
INSTRUÇÕES ESPECÍFICAS PARA OPÇÃO ÚNICA:
8. Se encontrar múltiplas opções no texto, use apenas a primeira/melhor opção
9. Calcule corretamente o valor por pessoa baseado no total informado
`}

${temImagem ? 'ATENÇÃO: Há uma imagem anexada. Extraia informações específicas (preços, datas, companhias, horários) da imagem para preencher o template.' : ''}

Contexto adicional:
- Destino: ${destino || 'Não especificado'}
- Tipos de serviço: ${tipos?.join(', ') || 'Não especificado'}`;

  return promptFinal;
}

// 🤖 Chamar IA (OpenAI ou Claude)
async function chamarIA(prompt, temImagem, arquivo) {
  // Verificar qual API usar
  if (process.env.OPENAI_API_KEY) {
    console.log('🔵 Usando OpenAI');
    return chamarOpenAI(prompt, temImagem, arquivo);
  } else if (process.env.ANTHROPIC_API_KEY) {
    console.log('🟠 Usando Claude');
    return chamarClaude(prompt, temImagem, arquivo);
  } else {
    throw new Error('Nenhuma API Key configurada (OPENAI_API_KEY ou ANTHROPIC_API_KEY)');
  }
}

// 🔵 OpenAI API - SEMPRE USA GPT-4o
async function chamarOpenAI(prompt, temImagem, arquivo) {
  let messages;
  
  if (temImagem && arquivo) {
    // Com imagem
    messages = [{
      role: "user",
      content: [
        { type: "text", text: prompt },
        { 
          type: "image_url", 
          image_url: { 
            url: arquivo
          } 
        }
      ]
    }];
  } else {
    // Só texto
    messages = [{
      role: "user",
      content: prompt
    }];
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',  // ✅ SEMPRE USA GPT-4o
      messages,
      max_tokens: 2000,  // Aumentado para múltiplas opções
      temperature: 0.5   // ✅ REDUZIDO para mais consistência
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro OpenAI:', errorText);
    throw new Error(`OpenAI API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// 🟠 Claude API  
async function chamarClaude(prompt, temImagem, arquivo) {
  let content;
  
  if (temImagem && arquivo) {
    // Extrair base64 da string data:image
    const base64Match = arquivo.match(/data:image\/[^;]+;base64,(.+)/);
    if (!base64Match) {
      throw new Error('Formato de imagem inválido');
    }
    
    const base64Data = base64Match[1];
    const mimeType = arquivo.match(/data:(image\/[^;]+)/)?.[1] || 'image/jpeg';
    
    content = [
      { type: "text", text: prompt },
      {
        type: "image",
        source: {
          type: "base64",
          media_type: mimeType,
          data: base64Data
        }
      }
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
      max_tokens: 2000,  // Aumentado para múltiplas opções
      messages: [
        {
          role: 'user',
          content: content
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro Claude:', errorText);
    throw new Error(`Claude API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}
