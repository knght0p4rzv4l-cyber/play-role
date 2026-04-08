/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { AppSettings, Character, Message } from "../types";

export class AIService {
  private genAI: GoogleGenAI;

  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  }

  async generateText(
    prompt: string,
    character: Character,
    history: Message[],
    settings: AppSettings,
    userProfile: Character
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(character, settings, userProfile);
    
    // Use DeepSeek if available, otherwise fallback to Gemini
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.deepseekApiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.map(m => ({
              role: m.senderId === 'user' ? 'user' : 'assistant',
              content: m.text
            })),
            { role: 'user', content: prompt }
          ],
          max_tokens: settings.shortWritingMode ? 150 : 1000,
          temperature: settings.nsfwMode ? 0.9 : 0.7,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('DeepSeek failed, falling back to Gemini:', error);
      
      // Fallback to Gemini
      const model = this.genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...history.map(m => ({
            role: m.senderId === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: systemPrompt,
          maxOutputTokens: settings.shortWritingMode ? 150 : 1000,
        }
      });
      
      const result = await model;
      return result.text || "Lo siento, no pude generar una respuesta.";
    }
  }

  async generateImage(prompt: string, settings: AppSettings): Promise<string> {
    // If super images enabled, use that API key (mocked for now as we don't know the provider)
    // Otherwise use Gemini
    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `Generate a roleplay image: ${prompt}. ${settings.nsfwMode ? 'Uncensored style.' : ''}` }]
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error('No image generated');
    } catch (error) {
      console.error('Image generation failed:', error);
      return `https://picsum.photos/seed/${Math.random()}/800/600`;
    }
  }

  async analyzeImage(base64Image: string, prompt: string): Promise<string> {
    try {
      const response = await this.genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { data: base64Image.split(',')[1], mimeType: "image/jpeg" } },
            { text: prompt }
          ]
        }
      });
      return response.text || "No pude analizar la imagen.";
    } catch (error) {
      console.error('Image analysis failed:', error);
      return "Error al analizar la imagen.";
    }
  }

  private buildSystemPrompt(character: Character, settings: AppSettings, userProfile: Character): string {
    let prompt = `Eres ${character.name}. 
Descripción: ${character.description}
Personalidad: ${character.personality}
Estás hablando con ${userProfile.name} (${userProfile.description}).

Instrucciones de formato:
${character.responseStyle === 'classic' 
  ? 'Usa el estilo clásico de roleplay: describe tus acciones entre asteriscos, por ejemplo *se ríe suavemente*.' 
  : 'Responde de forma natural, como en un chat de WhatsApp.'}

Configuración de la sesión:
- Modo NSFW: ${settings.nsfwMode ? 'Activado. Puedes ser más explícito y libre en el roleplay.' : 'Desactivado. Mantén un tono apto para todo público.'}
- Modo Super NSFW: ${settings.superNsfwMode ? 'Activado. Sin censura absoluta.' : 'Desactivado.'}
- Longitud: ${settings.shortWritingMode ? 'Escribe respuestas cortas y directas.' : 'Escribe respuestas detalladas.'}
`;
    return prompt;
  }
}

export const aiService = new AIService();
