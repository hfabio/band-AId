import { getGoogleExamOverviewPrompt, getOpenAIExamOverviewPrompt } from "../utils/prompts";
import { validateVerifyExamPayload } from "./validators";
import { prompt } from "../utils/AdapterAi";
import { ChatCompletion } from "openai/resources/index.mjs";
import { Request, Response, NextFunction } from "express";

export default {
  verifyExam: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {data, error} = validateVerifyExamPayload.safeParse({
        image: req.body.image,
        prompt: req.body.prompt,
      });
      if(error) throw new Error(error.toString());
      let result;
      if (process.env.PROVIDER === 'openai') {
        const messages = await getOpenAIExamOverviewPrompt(data);
        result = await prompt({
          provider: 'openai',
          format: "json_object",
          messages,
        });
      } else {
        const { history, userPrompts } = await getGoogleExamOverviewPrompt(data);
        result = await prompt({
          provider: 'google',
          history,
          userPrompts
        });
      }
      console.table(result.usage);
      if (result.message) {
        try {
          const parsed = JSON.parse(result.message);
          return res.json(parsed);
        } catch {
          return res.send(result.message);
        }
      }
      res.json({ error: true, result });
    } catch (error) {
      next(error);
    }
  }
}