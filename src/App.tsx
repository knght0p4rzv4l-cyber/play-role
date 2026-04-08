/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Character, 
  Group, 
  Message, 
  ChatState, 
  AppSettings, 
  View 
} from './types';
import { 
  DEFAULT_SETTINGS, 
  INITIAL_CHARACTERS, 
  INITIAL_USER 
} from './constants';
import { aiService } from './services/aiService';
import { ChatList } from './components/ChatList';
import { ChatRoom } from './components/ChatRoom';
import { SettingsView } from './components/SettingsView';
import { CharacterEditor } from './components/CharacterEditor';
import { GroupEditor } from './components/GroupEditor';
import { UserProfileEditor } from './components/UserProfileEditor';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Settings, Users, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // State
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('rp_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [characters, setCharacters] = useState<Character[]>(() => {
    const saved = localStorage.getItem('rp_characters');
    return saved ? JSON.parse(saved) : INITIAL_CHARACTERS;
  });

  const [userProfile, setUserProfile] = useState<Character>(() => {
    const saved = localStorage.getItem('rp_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('rp_groups');
    return saved ? JSON.parse(saved) : [];
  });

  const [chatStates, setChatStates] = useState<Record<string, ChatState>>(() => {
    const saved = localStorage.getItem('rp_chats');
    return saved ? JSON.parse(saved) : {};
  });

  const [currentView, setCurrentView] = useState<View>('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('rp_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('rp_characters', JSON.stringify(characters));
  }, [characters]);

  useEffect(() => {
    localStorage.setItem('rp_user', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('rp_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('rp_chats', JSON.stringify(chatStates));
  }, [chatStates]);

  // Actions
  const sendMessage = useCallback(async (chatId: string, text: string, type: 'text' | 'image' | 'system' = 'text', imageUrl?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'user',
      senderName: userProfile.name,
      senderAvatar: userProfile.avatar,
      text,
      timestamp: Date.now(),
      type,
      imageUrl,
    };

    setChatStates(prev => {
      const chat = prev[chatId] || { id: chatId, messages: [], lastReadTimestamp: 0 };
      return {
        ...prev,
        [chatId]: {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastReadTimestamp: Date.now()
        }
      };
    });

    // AI Response logic
    const group = groups.find(g => g.id === chatId);
    const character = characters.find(c => c.id === chatId);

    if (group) {
      if (group.isSuspended) return;
      // All AI members respond
      for (const memberId of group.memberIds) {
        const member = characters.find(c => c.id === memberId);
        if (member && member.isAI && !member.isSuspended) {
          // Simulate typing delay
          setTimeout(async () => {
            const history = chatStates[chatId]?.messages || [];
            const responseText = await aiService.generateText(text, member, history, settings, userProfile);
            
            const aiMessage: Message = {
              id: (Date.now() + Math.random()).toString(),
              senderId: member.id,
              senderName: member.name,
              senderAvatar: member.avatar,
              text: responseText,
              timestamp: Date.now(),
              type: 'text',
              isUnread: true,
            };

            setChatStates(prev => {
              const chat = prev[chatId];
              return {
                ...prev,
                [chatId]: {
                  ...chat,
                  messages: [...chat.messages, aiMessage]
                }
              };
            });
          }, 1000 + Math.random() * 2000);
        }
      }
    } else if (character && character.isAI) {
      if (character.isSuspended) return;
      const history = chatStates[chatId]?.messages || [];
      const responseText = await aiService.generateText(text, character, history, settings, userProfile);
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        senderId: character.id,
        senderName: character.name,
        senderAvatar: character.avatar,
        text: responseText,
        timestamp: Date.now(),
        type: 'text',
        isUnread: true,
      };

      setChatStates(prev => {
        const chat = prev[chatId];
        return {
          ...prev,
          [chatId]: {
            ...chat,
            messages: [...chat.messages, aiMessage]
          }
        };
      });
    }
  }, [userProfile, characters, groups, settings, chatStates]);

  // Simulated auto-messaging
  useEffect(() => {
    if (!settings.autoMessagingEnabled) return;

    const interval = setInterval(() => {
      // Pick a random chat
      const chatIds = Object.keys(chatStates);
      if (chatIds.length === 0) return;
      
      const randomChatId = chatIds[Math.floor(Math.random() * chatIds.length)];
      const character = characters.find(c => c.id === randomChatId);
      const group = groups.find(g => g.id === randomChatId);

      if ((character && character.isAI && !character.isSuspended) || (group && !group.isSuspended)) {
        // 5% chance of spontaneous message every 30 seconds
        if (Math.random() < 0.05) {
          const targetChar = character || characters.find(c => group?.memberIds.includes(c.id));
          if (targetChar) {
            sendMessage(randomChatId, "¡Hola! ¿Estás ahí?", 'text');
          }
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [settings.autoMessagingEnabled, chatStates, characters, groups, sendMessage]);

  const markAsRead = (chatId: string) => {
    setChatStates(prev => {
      const chat = prev[chatId];
      if (!chat) return prev;
      return {
        ...prev,
        [chatId]: {
          ...chat,
          lastReadTimestamp: Date.now(),
          messages: chat.messages.map(m => ({ ...m, isUnread: false }))
        }
      };
    });
  };

  const renderView = () => {
    switch (currentView) {
      case 'chats':
        return (
          <ChatList 
            characters={characters}
            groups={groups}
            chatStates={chatStates}
            onChatSelect={(id) => {
              setActiveChatId(id);
              setCurrentView('chat-detail');
              markAsRead(id);
            }}
            onEditCharacter={(id) => {
              setEditingCharacterId(id);
              setCurrentView('edit-character');
            }}
            onEditGroup={(id) => {
              setEditingGroupId(id);
              setCurrentView('edit-group');
            }}
            onCreateCharacter={() => {
              setEditingCharacterId(null);
              setCurrentView('edit-character');
            }}
            onCreateGroup={() => {
              setEditingGroupId(null);
              setCurrentView('edit-group');
            }}
          />
        );
      case 'chat-detail':
        if (!activeChatId) return null;
        const char = characters.find(c => c.id === activeChatId);
        const group = groups.find(g => g.id === activeChatId);
        return (
          <ChatRoom 
            chatId={activeChatId}
            target={char || group!}
            messages={chatStates[activeChatId]?.messages || []}
            settings={settings}
            onBack={() => setCurrentView('chats')}
            onSendMessage={(text, type, url) => sendMessage(activeChatId, text, type, url)}
            onToggleSuspension={(id) => {
              if (group) {
                setGroups(prev => prev.map(g => g.id === id ? { ...g, isSuspended: !g.isSuspended } : g));
              } else {
                setCharacters(prev => prev.map(c => c.id === id ? { ...c, isSuspended: !c.isSuspended } : c));
              }
            }}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            settings={settings}
            onUpdateSettings={setSettings}
          />
        );
      case 'edit-character':
        return (
          <CharacterEditor 
            character={characters.find(c => c.id === editingCharacterId)}
            onSave={(char) => {
              setCharacters(prev => {
                const exists = prev.find(c => c.id === char.id);
                if (exists) return prev.map(c => c.id === char.id ? char : c);
                return [...prev, char];
              });
              setCurrentView('chats');
            }}
            onCancel={() => setCurrentView('chats')}
          />
        );
      case 'edit-group':
        return (
          <GroupEditor 
            group={groups.find(g => g.id === editingGroupId)}
            characters={characters}
            onSave={(group) => {
              setGroups(prev => {
                const exists = prev.find(g => g.id === group.id);
                if (exists) return prev.map(g => g.id === group.id ? group : g);
                return [...prev, group];
              });
              setCurrentView('chats');
            }}
            onCancel={() => setCurrentView('chats')}
          />
        );
      case 'user-profile':
        return (
          <UserProfileEditor 
            user={userProfile}
            onSave={(user) => {
              setUserProfile(user);
              setCurrentView('settings');
            }}
            onCancel={() => setCurrentView('settings')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col h-screen w-full max-w-md mx-auto overflow-hidden shadow-2xl transition-colors duration-300 ${settings.darkMode ? 'dark bg-black text-white' : 'bg-[#F2F2F7] text-black'}`}>
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView + (activeChatId || '')}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar (WhatsApp style) */}
      {['chats', 'settings'].includes(currentView) && (
        <nav className={`h-20 border-t flex items-center justify-around px-2 pb-6 ${settings.darkMode ? 'bg-[#121212] border-[#222]' : 'bg-[#F9F9F9] border-[#DDD]'}`}>
          <button 
            onClick={() => setCurrentView('chats')}
            className={`flex flex-col items-center gap-1 ${currentView === 'chats' ? 'text-[#007AFF]' : 'text-gray-500'}`}
          >
            <MessageCircle size={24} />
            <span className="text-[10px]">Chats</span>
          </button>
          <button 
            onClick={() => setCurrentView('user-profile')}
            className={`flex flex-col items-center gap-1 ${currentView === 'user-profile' ? 'text-[#007AFF]' : 'text-gray-500'}`}
          >
            <User size={24} />
            <span className="text-[10px]">Perfil</span>
          </button>
          <button 
            onClick={() => setCurrentView('settings')}
            className={`flex flex-col items-center gap-1 ${currentView === 'settings' ? 'text-[#007AFF]' : 'text-gray-500'}`}
          >
            <Settings size={24} />
            <span className="text-[10px]">Configuración</span>
          </button>
        </nav>
      )}
    </div>
  );
}
