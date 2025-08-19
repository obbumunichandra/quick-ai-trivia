import { GoogleGenAI, Type } from "@google/genai";

import type { TriviaQuestion } from '../types';

// Assume process.env.API_KEY is available
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const triviaSchema = {
  type: Type.OBJECT,
  properties: {
    question: {
      type: Type.STRING,
      description: "The trivia question text.",
    },
    options: {
      type: Type.ARRAY,
      description: "An array of exactly 4 multiple-choice answers.",
      items: { type: Type.STRING },
    },
    correctAnswer: {
      type: Type.STRING,
      description: "The correct answer, which must be one of the strings from the 'options' array.",
    },
    explanation: {
      type: Type.STRING,
      description: "A brief and interesting explanation of why the answer is correct.",
    },
  },
  required: ["question", "options", "correctAnswer", "explanation"],
};

type Difficulty = 'basic' | 'medium' | 'advanced';

export const generateTriviaQuestion = async (topic: string, difficulty: Difficulty, previousQuestions: string[]): Promise<TriviaQuestion> => {
  try {
    let prompt = `Generate a unique, fun, and educational multiple-choice trivia question about "${topic}". The difficulty of the question should be ${difficulty}. Provide four distinct options. Ensure one option is the correct answer. Also provide a brief, interesting explanation for the correct answer.`;

    if (previousQuestions.length > 0) {
      const exclusionList = previousQuestions.map(q => `- "${q}"`).join('\n');
      prompt += `\n\nIMPORTANT: Do not generate a question that is the same as any of the following previously asked questions:\n${exclusionList}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: triviaSchema,
        temperature: 1,
      },
    });

    const jsonText = response.text.trim();
    const triviaData: TriviaQuestion = JSON.parse(jsonText);
    
    if (!triviaData.question || !triviaData.options || triviaData.options.length !== 4 || !triviaData.correctAnswer || !triviaData.explanation) {
        throw new Error("Invalid trivia data format from API.");
    }

    if (!triviaData.options.includes(triviaData.correctAnswer)) {
        throw new Error("The correct answer provided by the AI is not in the options list. Please try again.");
    }

    return triviaData;

  } catch (error) {
    console.error("Error generating trivia question:", error);
    if (error instanceof Error) {
        if (error.message.includes("429")) {
            throw new Error("API rate limit exceeded. Please wait a moment and try again.");
        }
        if (error.message.includes("Invalid") || error instanceof SyntaxError) {
             throw new Error("The AI generated an invalid response. Please try generating a new question.");
        }
    }
    throw new Error("Failed to generate a trivia question. Please check your connection or API key and try again.");
  }
};