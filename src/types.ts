/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ResponseStyle = 'whatsapp' | 'classic';

export interface Character {
  id: string;
  name: string;
  avatar: string;
  description: string;
  personality: string;
  responseStyle: ResponseStyle;
  isAI: boolean;
  isSuspended?: boolean;
}

export interface Group {
  id: string;
  name: string;
  avatar: string;
  memberIds: string[];
  isSuspended?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: number;
  type: 'text' | 'image' | 'system';
  imageUrl?: string;
  isUnread?: boolean;
}

export interface ChatState {
  id: string; // characterId or groupId
  messages: Message[];
  lastReadTimestamp: number;
}

export interface AppSettings {
  nsfwMode: boolean;
  superNsfwMode: boolean;
  shortWritingMode: boolean;
  aiImagesEnabled: boolean;
  imageAnalysisEnabled: boolean;
  autoMessagingEnabled: boolean;
  darkMode: boolean;
  chatBackground: string;
  superImagesEnabled: boolean;
  superImagesApiKey: string;
  deepseekApiKey: string;
}

export type View = 'chats' | 'settings' | 'chat-detail' | 'edit-character' | 'edit-group' | 'user-profile';
