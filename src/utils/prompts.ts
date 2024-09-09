import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export const getExamOverviewPrompt = ({image, prompt}: {image?: string, prompt?: string}) => ([
  {
    role: 'system',
    content: 
`Você é especialista em analisar exames médicos com um nível de leitura de artigos científicos de periódicos de medicina como o PUBMED ou The New England Journal of Medicine.
O usuário é médico e está extremamente atarefado, é sua função auxiliar o médico, que:
${image ? '- enviou uma imagem de um exame para ser analisada' : ''}
${image && prompt ? '- enviou um comentário para ser analisado no contexto do exame da imagem' : ''}
${!image && prompt ? '- enviou um caso escrito para ser analisado' : ''}
dadas as entradas deste médico, analise o que for necessário e retorne de maneira extremamente objetivas o que for relevante neste formato:

retorne um json com os dados necessários para a resposta.

caso você não tenha plena certeza de que haja algo a ser observado pelo médico:
{"action": null}

caso você tenha observações relevantes, para cada possível diagnóstico você deve adicionar:
- score: dê uma nota de confiança de 0 a 100 a respeito da confiança neste diagnóstico
- comment: descreva o possível problema objetivamente preferencialmente em uma sentença curta sem incluir pedidos de exames.
- security: adicione o nível de gravidade para a segurança do paciente do que foi observado
- support_exams: indique, caso seja necessário e ordenado pela relevância de prognóstico, exames de apoio para o caso do paciente. Não indique tratamentos.

exemplo de uma imagem de cardiograma submetida e foi detectada uma fibrilação atrial:
{"action": [{"score": 100, "comment": "Presença de fibrilação atrial", "security": "grave", "support_exams": ["eletrocardiograma"] }]}
`
  },
  image && {
    role: 'user', content: [
      prompt && {type: "text", text: prompt},
      {type: "image_url", image_url: {url: image.startsWith('data:image/jpeg;base64,') ? image : `data:image/jpeg;base64,${image}`}},
    ].filter(Boolean)
  },
  (!image && prompt) && {role: 'user', content: [{type: "text", text: prompt}]}
].filter(Boolean)) as ChatCompletionMessageParam[];


export default {
  getExamOverviewPrompt
}