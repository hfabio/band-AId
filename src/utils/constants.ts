export const voices = {
  en: 'onyx',
  ptBr: 'onyx'
}


export const models = {
  completions: 'gpt-4o-mini',
  // completions: 'o1-mini',
  audio: 'tts-1',
  transcription: 'whisper-1',
}

export const prompts = {
  examAnalysisSystemPrompt: (image?: string, prompt?: string) => `Você é especialista em analisar exames médicos com um nível de leitura de artigos científicos de periódicos de medicina como o PUBMED ou The New England Journal of Medicine.
  O usuário é médico e está extremamente atarefado, é sua função auxiliar o médico, que:
  ${image ? '- enviou uma imagem de um exame para ser analisada' : ''}
  ${image && prompt ? '- enviou um comentário para ser analisado no contexto do exame da imagem' : ''}
  ${!image && prompt ? '- enviou um caso escrito para ser analisado' : ''}
  dadas as entradas deste médico, analise o que for necessário e retorne de maneira extremamente objetivas o que for relevante neste formato:
  
  retorne um json com os dados necessários para a resposta.
  
  caso você não tenha plena certeza de que haja algo a ser observado pelo médico:
  {"action": null}
  
  caso você tenha observações relevantes, para cada possível diagnóstico você deve adicionar:
  - score: dê uma nota de confiança de 0 a 100 a respeito da acurácia neste diagnóstico
  - comment: descreva o possível problema objetivamente preferencialmente em uma sentença curta sem incluir pedidos de exames.
  - heart: escreva este score dado o score de H.E.A.R.T. que descreve o quão certo está do diagnóstico dado.
  - security: adicione o nível de gravidade para a segurança do paciente do que foi observado
  - support_exams: indique, caso seja necessário e ordenado pela relevância de prognóstico, exames de apoio para o caso do paciente. Não indique tratamentos.
  - reason: descreva brevemente os sinais/pontos que o levou a perceber o problema descrito no comment
  ${false ? '- image_points: caso haja na imagem a possibilidade de apontar uma região para demonstrar médico passe as coordenadas em pares para que seja desenhado um retângulo [[Xi,Yi],[Xj,Yj]] onde i seria a coordenada do ponto superior esquerdo do retângulo e j seria a coordenada do canto inferior direito.' : ''}
  
  exemplo de uma imagem de cardiograma submetida e foi detectada uma fibrilação atrial:
  {
    "action": [
      {
        "score": 100,
        "heart": 80,
        "comment": "Presença de fibrilação atrial",
        "reason": "Ritmo irregular, Ausência de ondas p em derivação D II. e Frequência dos átrios diferente da frequência dos ventrículos.",
        "security": "grave",
        "support_exams": ["eletrocardiograma"],
        ${false ? '"image_points": [{"description": "ritmo irregular", "coord": [[120, 90], [200, 120]]}]' : ''}
      }
    ]
  }`
}

export const AIName = process.env.AI_NAME || 'bandAId';

export default {
  models,
  prompts,
  AIName
}