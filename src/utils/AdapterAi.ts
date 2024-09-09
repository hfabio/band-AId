import OpenAI from 'openai';
import {models, voices} from './constants'
import { ChatCompletion, ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs';
import { SpeechCreateParams, Speech } from 'openai/resources/audio/speech.mjs';
import { Transcription, TranscriptionCreateParams } from 'openai/resources/audio/transcriptions.mjs';
import { Uploadable } from 'openai/uploads.mjs';
import { Response } from 'openai/core.mjs';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

export const types = {
  completions: client.chat.completions,
  audio: client.audio.speech,
  transcription: client.audio.transcriptions,
}

export interface IPromptProps {
  type?: keyof typeof types;
  messages?: ChatCompletionMessageParam[] | string;
  format: null | 'text' | 'json_object' | 'json_schema';
  language?: keyof typeof voices;
  file?: Uploadable;
  requestUuid?: string;
}

export const prompt = async ({type = 'completions', messages, format, language, file, requestUuid}: IPromptProps) => {
  const method = types[type];
  const model = models[type];

  let payload;

  if (type === 'completions') {
    payload = {
      messages,
      model,
      ...(format !== null ? {
        response_format : {type: format}
      } : {})
    } as ChatCompletionCreateParamsNonStreaming
  }

  if(type === 'audio') {
    payload = {
      model,
      voice: voices[language ?? 'ptBr'],
      input: messages
    } as SpeechCreateParams
  }

  if (type === 'transcription'){
    payload = {
      model,
      file,
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

  if(type === 'completions') return response as ChatCompletion;
  if(type === 'audio') return response as Response
  if(type === 'transcription') return response as Transcription;

  return response as ChatCompletion;
}

export default {
  prompt
}
