import { ChatCompletionContentPart, ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { prompts, AIName } from './constants';

const getImageForGooglePrompt = async (image: string) => {
  let data;
  let mimeType;
  // https://cloud.google.com/vertex-ai/docs/samples/aiplatform-gemini-get-started?hl=pt-br
  // For images, the SDK supports both Google Cloud Storage URI and base64 strings
  if (/^(http|www)/gi.test(image)) {
    const request = await fetch(image);
    mimeType = request.headers.get('content-type');
    data = Buffer.from(await request.arrayBuffer()).toString('base64');
  }
  if (!data && typeof (image) === 'string') data = image;
  if (!data && Buffer.isBuffer(image)) data = image.toString('base64');
  if (!mimeType) mimeType = 'image/png';
  if (!data) throw new Error(`image couldn't be converted\n${image}`);
  return {
    inlineData: {
      data,
      mimeType
    },
  };
}

export const getOpenAIExamOverviewPrompt = async ({ image, prompt }: { image?: string, prompt?: string }): Promise<Array<ChatCompletionMessageParam>> => {
  if (!prompt && !image) throw new Error('no prompt and no image provided')
  const promptWindow: ChatCompletionMessageParam[] = [
    {
      name: AIName,
      role: 'system',
      content: prompts.examAnalysisSystemPrompt(image, prompt)
    },
  ];
  let image_url;
  if (image && /^(http|www)/gi.test(image)) image_url = image;
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

export const getGoogleExamOverviewPrompt = async ({ image, prompt }: { image?: string, prompt?: string }) => {
  if (!prompt && !image) throw new Error('no prompt and no image provided')
  // const history = [
  //   {
  //     role: 'user',
  //     parts: [{ text: prompts.examAnalysisSystemPrompt(image, prompt, true) }]
  //   },
  // ];
  const history = prompts.examAnalysisSystemPrompt(image, prompt, true);
  const userPrompts = []
  if (prompt) userPrompts.push(prompt);
  if (image) userPrompts.push(await getImageForGooglePrompt(image))
  return {
    history,
    userPrompts
  };
};


export default {
  getOpenAIExamOverviewPrompt
}