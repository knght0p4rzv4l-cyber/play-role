/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppSettings, Character } from "./types";

export const DEFAULT_SETTINGS: AppSettings = {
  nsfwMode: false,
  superNsfwMode: false,
  shortWritingMode: false,
  aiImagesEnabled: true,
  imageAnalysisEnabled: true,
  autoMessagingEnabled: false,
  darkMode: true,
  chatBackground: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop',
  superImagesEnabled: false,
  superImagesApiKey: '',
  deepseekApiKey: process.env.CLAVE_API_DE_DEEPSEEK || 'sk-9f8b3831f1254e3cbc03a53ab2f43659',
};

export const INITIAL_USER: Character = {
  id: 'user',
  name: 'Tú',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
  description: 'El protagonista del roleplay.',
  personality: 'Valiente y curioso.',
  responseStyle: 'whatsapp',
  isAI: false,
};

export const INITIAL_CHARACTERS: Character[] = [
  {
    id: 'char-1',
    name: 'Elena',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    description: 'Una maga misteriosa de un reino lejano.',
    personality: 'Seria, sabia y un poco sarcástica.',
    responseStyle: 'classic',
    isAI: true,
  },
  {
    id: 'char-2',
    name: 'Marcus',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    description: 'Un guerrero veterano que busca redención.',
    personality: 'Protector, fuerte y de pocas palabras.',
    responseStyle: 'whatsapp',
    isAI: true,
  }
];
