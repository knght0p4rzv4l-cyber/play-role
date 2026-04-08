/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Character, Group, Message, AppSettings } from "../types";
import { ChevronLeft, Plus, Camera, Mic, Send, Info, Pause, Play, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { aiService } from "../services/aiService";

interface ChatRoomProps {
  chatId: string;
  target: Character | Group;
  messages: Message[];
  settings: AppSettings;
  onBack: () => void;
  onSendMessage: (text: string, type?: 'text' | 'image' | 'system', url?: string) => void;
  onToggleSuspension: (id: string) => void;
}

export function ChatRoom({ 
  chatId, 
  target, 
  messages, 
  settings, 
  onBack, 
  onSendMessage,
  onToggleSuspension
}: ChatRoomProps) {
  const [inputText, setInputText] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      onSendMessage("Imagen enviada", 'image', base64);
      
      if (settings.imageAnalysisEnabled) {
        // AI analyzes image
        const analysis = await aiService.analyzeImage(base64, "Describe esta imagen para el roleplay.");
        onSendMessage(`[Análisis de IA]: ${analysis}`, 'system');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateImage = async () => {
    const userPrompt = window.prompt("Describe la imagen que quieres crear:");
    if (!userPrompt) return;
    
    const imageUrl = await aiService.generateImage(userPrompt, settings);
    onSendMessage(`Imagen creada: ${userPrompt}`, 'image', imageUrl);
  };

  const isGroup = 'memberIds' in target;

  return (
    <div className="flex flex-col h-full relative" style={{ 
      backgroundImage: `url(${settings.chatBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/5 pointer-events-none" />

      {/* Header */}
      <header className={`relative z-10 px-2 py-2 flex items-center gap-2 border-b ${settings.darkMode ? 'bg-[#121212]/90 border-[#222]' : 'bg-[#F9F9F9]/90 border-[#DDD]'} backdrop-blur-md`}>
        <button onClick={onBack} className="text-[#007AFF] flex items-center">
          <ChevronLeft size={28} />
          <span className="text-sm -ml-1">Atrás</span>
        </button>
        
        <div className="flex-1 flex items-center gap-2 cursor-pointer" onClick={() => setShowInfo(true)}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={target.avatar} />
            <AvatarFallback>{target.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h2 className="font-bold text-[15px] leading-tight">{target.name}</h2>
            <p className="text-[10px] text-gray-500">
              {target.isSuspended ? 'Suspendido' : 'En línea'}
            </p>
          </div>
        </div>

        <button 
          onClick={() => onToggleSuspension(target.id)}
          className={`p-2 rounded-full ${target.isSuspended ? 'text-green-500' : 'text-red-500'}`}
        >
          {target.isSuspended ? <Play size={20} /> : <Pause size={20} />}
        </button>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 px-3 py-4 relative z-0" viewportRef={scrollRef}>
        <div className="flex flex-col gap-2">
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === 'user';
            const showAvatar = !isMe && isGroup;
            
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-1 mb-1`}>
                {showAvatar && (
                  <Avatar className="h-7 w-7 mb-1">
                    <AvatarImage src={msg.senderAvatar} />
                    <AvatarFallback>{msg.senderName[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[75%] rounded-2xl px-3 py-1.5 shadow-sm relative ${
                  isMe 
                    ? 'bg-[#DCF8C6] dark:bg-[#005C4B] text-black dark:text-white rounded-tr-none' 
                    : 'bg-white dark:bg-[#202C33] text-black dark:text-white rounded-tl-none'
                }`}>
                  {!isMe && isGroup && (
                    <p className="text-[11px] font-bold text-[#007AFF] mb-0.5">{msg.senderName}</p>
                  )}
                  
                  {msg.type === 'image' && msg.imageUrl && (
                    <img src={msg.imageUrl} alt="Sent" className="rounded-lg mb-1 max-w-full h-auto" />
                  )}
                  
                  <p className="text-[15px] leading-snug whitespace-pre-wrap">{msg.text}</p>
                  
                  {!isMe && idx === messages.length - 1 && !settings.autoMessagingEnabled && (
                    <button 
                      onClick={() => onSendMessage("Continúa escribiendo...", 'system')}
                      className="mt-2 text-[11px] text-[#007AFF] font-medium flex items-center gap-1 hover:underline"
                    >
                      <Plus size={12} /> Continuar escribiendo
                    </button>
                  )}
                  
                  <div className="flex justify-end items-center gap-1 mt-0.5">
                    <span className="text-[10px] opacity-50">
                      {format(msg.timestamp, 'HH:mm', { locale: es })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input Bar */}
      <footer className={`relative z-10 p-2 pb-8 flex items-end gap-2 ${settings.darkMode ? 'bg-[#121212]/90' : 'bg-[#F9F9F9]/90'} backdrop-blur-md`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-[#007AFF] p-1.5">
              <Plus size={24} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <Camera className="mr-2 h-4 w-4" />
              <span>Subir Foto</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCreateImage}>
              <ImageIcon className="mr-2 h-4 w-4" />
              <span>Crear Imagen</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileUpload}
        />

        <div className={`flex-1 min-h-[36px] max-h-32 overflow-y-auto rounded-2xl px-3 py-1.5 border ${settings.darkMode ? 'bg-black border-[#333]' : 'bg-white border-[#DDD]'}`}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Mensaje"
            className="w-full bg-transparent resize-none focus:outline-none text-[15px]"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>

        {inputText.trim() ? (
          <button onClick={handleSend} className="bg-[#007AFF] text-white p-2 rounded-full">
            <Send size={20} />
          </button>
        ) : (
          <div className="flex gap-2">
            <button className="text-[#007AFF] p-1.5"><Camera size={24} /></button>
            <button className="text-[#007AFF] p-1.5"><Mic size={24} /></button>
          </div>
        )}
      </footer>

      {/* Info Modal */}
      {showInfo && (
        <div className="absolute inset-0 z-50 bg-white dark:bg-black flex flex-col">
          <header className="p-4 flex items-center border-b dark:border-[#222]">
            <button onClick={() => setShowInfo(false)} className="text-[#007AFF]">Cerrar</button>
            <h2 className="flex-1 text-center font-bold">Información</h2>
          </header>
          <ScrollArea className="flex-1 p-6">
            <div className="flex flex-col items-center gap-4 mb-8">
              <Avatar className="h-32 w-32">
                <AvatarImage src={target.avatar} />
                <AvatarFallback>{target.name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-2xl font-bold">{target.name}</h3>
                <p className="text-gray-500">
                  {'memberIds' in target ? `Grupo • ${target.memberIds.length} miembros` : 'Personaje'}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <section>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Descripción</h4>
                <div className="bg-gray-50 dark:bg-[#1C1C1E] p-4 rounded-xl">
                  <p className="text-sm">{'description' in target ? target.description : 'Un grupo de roleplay.'}</p>
                </div>
              </section>

              {'personality' in target && (
                <section>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Personalidad</h4>
                  <div className="bg-gray-50 dark:bg-[#1C1C1E] p-4 rounded-xl">
                    <p className="text-sm">{target.personality}</p>
                  </div>
                </section>
              )}

              {'memberIds' in target && (
                <section>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Miembros</h4>
                  <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-xl divide-y dark:divide-[#333]">
                    {target.memberIds.map(id => {
                      // This would need characters list passed in, but for now we mock
                      return (
                        <div key={id} className="p-3 flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>M</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">Miembro {id}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
