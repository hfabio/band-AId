import { Uploadable } from 'openai/uploads.mjs';
import { Response } from 'openai/core.mjs';
import { openAiTypes } from '../src/utils/AdapterAi';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { voices } from '../src/utils/constants';

export type googleImagePrompt = { inlineData: { data: string; mimeType: string; } };
export type provider = 'openai' | 'google';
export type IPromptProps = {
  requestUuid?: string;
} & (IOpenAIPromptProps | IGooglePromptProps)
export type IOpenAIPromptProps = {
  provider: 'openai';
  type?: keyof typeof openAiTypes;
  messages?: ChatCompletionMessageParam[] | string;
  format: null | 'text' | 'json_object' | 'json_schema';
  language?: keyof typeof voices;
  file?: Uploadable;
}
export type IGooglePromptProps = {
  provider: 'google';
  type?: 'completions' | 'audio';
  history?: string | { role: string; parts: Array<{ text: string } | googleImagePrompt> }[];
  userPrompts: Array<string | googleImagePrompt>
}