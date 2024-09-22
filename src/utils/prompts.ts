import { ChatCompletionContentPart, ChatCompletionMessageParam } from "openai/resources/index.mjs";
import {prompts, AIName} from './constants';
import { ChatCompletionContentPartImage, ChatCompletionContentPartText, ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam } from "openai/src/resources/chat/completions.js";

export const getExamOverviewPrompt = ({image, prompt}: {image?: string, prompt?: string}) : Array<ChatCompletionMessageParam> => {
  if (!prompt && !image) throw new Error('no prompt and no image provided')
  const promptWindow: ChatCompletionMessageParam[] = [
    {
      name: AIName,
      role: 'system',
      content: prompts.examAnalysisSystemPrompt(image, prompt)
    },
  ];
  let image_url;
  if (image && /^(http|www)/.test(image)) image_url = image;
  if (image && !image_url) image_url = image.includes('base64,') ? image : `data:image/jpeg;base64,${image}`;

  const content: ChatCompletionContentPart[] = [];
  if (prompt) content.push({type: "text", text: prompt});
  if (image_url) content.push({type: "image_url", image_url: {url: image_url, }})
  promptWindow.push({
    name: "Medico",
    role: 'user',
    content
  });
  return promptWindow;
};


export default {
  getExamOverviewPrompt
}