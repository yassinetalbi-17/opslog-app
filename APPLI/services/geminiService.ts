import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Safely initialize API
const getAIClient = () => {
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const enhanceDescription = async (text: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return text; // Fallback if no key

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Tu es un assistant technique industriel. Réécris et corrige cette description d'intervention pour qu'elle soit professionnelle, concise et claire pour un rapport technique. Ne change pas le sens technique. Texte: "${text}"`,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return text;
  }
};

export const analyzeTrends = async (dataSummary: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "Clé API non configurée.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Tu es un expert en maintenance industrielle (TPM/Lean). 
      Analyse ces données d'interventions pour proposer une stratégie de MAINTENANCE PRÉVENTIVE.
      
      Données résumées (JSON): ${dataSummary}

      Tes objectifs:
      1. Identifier les machines les plus critiques (Top Pannes).
      2. Repérer des patterns temporels (ex: est-ce que ça casse souvent le Lundi ?).
      3. Proposer 3 actions concrètes pour passer du curatif au préventif.
      
      Format: Utilise du Markdown, sois concis et direct.`,
    });
    return response.text;
  } catch (error) {
    return "Analyse indisponible.";
  }
};