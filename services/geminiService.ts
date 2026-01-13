
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

let ai: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!ai) {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      throw new Error("A variável de ambiente API_KEY não está configurada.");
    }
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    itemA: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "O nome ou resumo da primeira opção." },
        pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de pontos positivos da primeira opção." },
        cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de pontos negativos da primeira opção." },
      },
    },
    itemB: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "O nome ou resumo da segunda opção." },
        pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de pontos positivos da segunda opção." },
        cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de pontos negativos da segunda opção." },
      },
    },
    conclusion: { type: Type.STRING, description: "Uma conclusão final equilibrada, resumindo a comparação e sugerindo qual opção pode ser melhor e em que contexto." },
  },
};

export const fetchComparison = async (itemA: string, itemB: string): Promise<AnalysisResult> => {
  try {
    const genAI = getAiClient();
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Compare de forma detalhada as seguintes duas opções: \n\nOpção A: "${itemA}"\n\nOpção B: "${itemB}"`,
      config: {
        systemInstruction: "Você é um analista imparcial e especialista em comparações. Sua tarefa é analisar duas opções fornecidas pelo usuário, listar os prós e contras de cada uma de forma concisa em formato de lista (bullet points), e ao final, fornecer uma conclusão equilibrada. Identifique e nomeie claramente cada opção na sua resposta.",
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (!response.text) {
      throw new Error("A API não retornou uma resposta de texto.");
    }
    
    const jsonText = response.text.trim();
    const result: AnalysisResult = JSON.parse(jsonText);
    return result;

  } catch (error) {
    console.error("Erro ao chamar a API Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Não foi possível obter a análise: ${error.message}`);
    }
    throw new Error("Não foi possível obter a análise. Verifique sua conexão ou tente novamente mais tarde.");
  }
};
