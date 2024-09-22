import OpenAI from 'openai';
import { GeminiModels, OpenAImodels, voices } from './constants'
import { ChatCompletion, ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs';
import { SpeechCreateParams } from 'openai/resources/audio/speech.mjs';
import { Transcription, TranscriptionCreateParams } from 'openai/resources/audio/transcriptions.mjs';
import { GenerateContentRequest, GoogleGenerativeAI } from '@google/generative-ai';
import { IGooglePromptProps, IOpenAIPromptProps, IPromptProps } from '@types';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const openAiTypes = {
  completions: client.chat.completions,
  audio: client.audio.speech,
  transcription: client.audio.transcriptions,
}
export type promptResult = {
  usage: {
    inputToken: number;
    outputToken: number;
    totalToken: number;
    totalCharacters: number;
    minutesUsed: 0;
  },
  message?: string;
  audio?: Buffer;
}

const openAiHandler = async ({ type = 'completions', messages, format, language, file, requestUuid }: IOpenAIPromptProps & IPromptProps) => {
  const method = openAiTypes[type];
  const model = OpenAImodels[type];

  let payload;
  let totalCharacters = 0;

  if (type === 'completions') {
    payload = {
      messages,
      model,
      ...(format !== null ? {
        response_format: { type: format }
      } : {})
    } as ChatCompletionCreateParamsNonStreaming
    totalCharacters = (messages as ChatCompletionMessageParam[]).reduce(
      (acc, curr) => acc + (
        typeof (curr.content) === 'string' ? curr.content.length :
          curr.content?.reduce((innerAcc, innerCurr) => innerAcc + (innerCurr.type === 'text' ? innerCurr.text?.length || 0 : 0), 0) || 0
      )
      , 0);
  }

  if (type === 'audio') {
    payload = {
      model,
      voice: voices[language ?? 'ptBr'],
      input: messages
    } as SpeechCreateParams
    totalCharacters = messages?.length || 0;
  }

  if (type === 'transcription') {
    payload = {
      model,
      file,
      response_format: "verbose_json"
    } as TranscriptionCreateParams;
  }
  // @ts-ignore
  const response = await method.create(payload);

  try {
    // @ts-ignore
    console.table(response?.usage)
    // save to db
  } catch (error) {
    console.error("error storing AI usage into DB");
  }

  return {
    usage: {
      inputToken: (response as ChatCompletion)?.usage?.prompt_tokens || 0,
      outputToken: (response as ChatCompletion)?.usage?.completion_tokens || 0,
      totalToken: (response as ChatCompletion)?.usage?.total_tokens || 0,
      totalCharacters, // @ts-ignore
      minutesUsed: (response as Transcription)?.duration || 0
    },
    ...(type === 'audio' ? {
      audio: response
    } : {
      message: (response as Transcription)?.text ?? (response as ChatCompletion)?.choices[0].message?.content
    }),
  } as promptResult;

  // if(type === 'completions') return response as ChatCompletion;
  // if(type === 'audio') return response as Response
  // if(type === 'transcription') return response as Transcription;

  // return response;
}

const GoogleHandler = async ({ type = 'completions', userPrompts, history }: IGooglePromptProps & IPromptProps) => {
  const model = GeminiModels[type];
  const googleModel = genAI.getGenerativeModel({ model, systemInstruction: history as string });

  // const chat = googleModel.startChat({
  //   history,
  //   generationConfig: {
  //     maxOutputTokens: 100,
  //   },
  // });
  // const result = await chat.sendMessage(userPrompts);
  // googleModel.systemInstruction = history;
  // googleModel.systemInstruction?.parts
  const result = await googleModel.generateContent(userPrompts);
  // const result = await googleModel.generateContent(messages);
  const response = await result.response;
  let message = response.text();
  if (/`{3}/gi.test(message)) message = message.replace(/```(\w+)?/gi, '');
  const usage = response.usageMetadata;

  return {
    usage: {
      inputToken: usage?.promptTokenCount,
      minutesUsed: 0,
      outputToken: usage?.candidatesTokenCount,
      totalToken: usage?.totalTokenCount,
      totalCharacters: userPrompts.filter((element) => typeof (element) === 'string').reduce((acc, curr) => acc + curr.length, 0)
    },
    message,
  } as promptResult;
}

export const prompt = async (props: IPromptProps) => {
  if (props.provider === 'openai') return await openAiHandler(props);
  if (props.provider === 'google') return await GoogleHandler(props);
  return await openAiHandler(props);
}

export default {
  prompt
}
