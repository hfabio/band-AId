import { getExamOverviewPrompt } from "../utils/prompts";
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
      const messages = getExamOverviewPrompt(data);
      const result = await prompt({
        format: "json_object",
        messages,
      });
      const message = (result as ChatCompletion)?.choices?.[0]?.message?.content;
      if(message) return res.json(JSON.parse(message));
      res.json({error: true, result, message})
    } catch (error) {
      next(error);
    }
  }
}