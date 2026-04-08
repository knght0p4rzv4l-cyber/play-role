/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Character, Group, ChatState } from "../types";
import { Search, Edit, Plus, Users, UserPlus, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface ChatListProps {
  characters: Character[];
  groups: Group[];
  chatStates: Record<string, ChatState>;
  onChatSelect: (id: string) => void;
  onEditCharacter: (id: string) => void;
  onEditGroup: (id: string) => void;
  onCreateCharacter: () => void;
  onCreateGroup: () => void;
}

export function ChatList({ 
  characters, 
  groups, 
  chatStates, 
  onChatSelect, 
  onEditCharacter, 
  onEditGroup,
  onCreateCharacter,
  onCreateGroup
}: ChatListProps) {
  const allItems = [
    ...characters.filter(c => c.isAI).map(c => ({ ...c, type: 'character' as const })),
    ...groups.map(g => ({ ...g, type: 'group' as const }))
  ].sort((a, b) => {
    const lastA = chatStates[a.id]?.messages.slice(-1)[0]?.timestamp || 0;
    const lastB = chatStates[b.id]?.messages.slice(-1)[0]?.timestamp || 0;
    return lastB - lastA;
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black">
      {/* Header */}
      <header className="px-4 pt-12 pb-2 flex justify-between items-center">
        <button className="text-[#007AFF] text-lg font-medium">Editar</button>
        <h1 className="text-lg font-bold">Chats</h1>
        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-[#007AFF]">
                <Edit size={22} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={onCreateCharacter}>
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Nuevo Personaje</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCreateGroup}>
                <Users className="mr-2 h-4 w-4" />
                <span>Nuevo Grupo</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar" 
            className="w-full bg-[#E9E9EB] dark:bg-[#1C1C1E] rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-gray-100 dark:divide-[#222]">
          {allItems.map((item) => {
            const chatState = chatStates[item.id];
            const lastMessage = chatState?.messages.slice(-1)[0];
            const unreadCount = chatState?.messages.filter(m => m.isUnread).length || 0;

            return (
              <div 
                key={item.id}
                onClick={() => onChatSelect(item.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (item.type === 'character') onEditCharacter(item.id);
                  else onEditGroup(item.id);
                }}
                className="flex items-center gap-3 px-4 py-3 active:bg-gray-100 dark:active:bg-[#1C1C1E] cursor-pointer transition-colors"
              >
                <Avatar className="h-14 w-14 border dark:border-[#333]">
                  <AvatarImage src={item.avatar} />
                  <AvatarFallback>{item.name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold truncate text-[17px]">{item.name}</h3>
                    {lastMessage && (
                      <span className="text-xs text-gray-500">
                        {format(lastMessage.timestamp, 'HH:mm', { locale: es })}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <p className="text-sm text-gray-500 truncate pr-4">
                      {lastMessage ? (
                        <>
                          {item.type === 'group' && <span className="font-medium">{lastMessage.senderName}: </span>}
                          {lastMessage.text}
                        </>
                      ) : (
                        'Sin mensajes'
                      )}
                    </p>
                    {unreadCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                        <div className="bg-[#007AFF] text-white text-[10px] font-bold h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center">
                          {unreadCount}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
