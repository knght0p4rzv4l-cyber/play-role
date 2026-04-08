/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Character, ResponseStyle } from "../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CharacterEditorProps {
  character?: Character;
  onSave: (character: Character) => void;
  onCancel: () => void;
}

export function CharacterEditor({ character, onSave, onCancel }: CharacterEditorProps) {
  const [name, setName] = useState(character?.name || "");
  const [avatar, setAvatar] = useState(character?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`);
  const [description, setDescription] = useState(character?.description || "");
  const [personality, setPersonality] = useState(character?.personality || "");
  const [responseStyle, setResponseStyle] = useState<ResponseStyle>(character?.responseStyle || "whatsapp");

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: character?.id || `char-${Date.now()}`,
      name,
      avatar,
      description,
      personality,
      responseStyle,
      isAI: true,
      isSuspended: character?.isSuspended || false
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black">
      <header className="px-4 pt-12 pb-4 flex justify-between items-center border-b dark:border-[#222]">
        <button onClick={onCancel} className="text-[#007AFF]">Cancelar</button>
        <h1 className="font-bold">{character ? 'Editar Personaje' : 'Nuevo Personaje'}</h1>
        <button onClick={handleSave} className="text-[#007AFF] font-bold">Guardar</button>
      </header>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatar} />
              <AvatarFallback>P</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" onClick={() => setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`)}>
              Cambiar Avatar
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del personaje" />
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="¿Quién es este personaje?" />
          </div>

          <div className="space-y-2">
            <Label>Personalidad</Label>
            <Textarea value={personality} onChange={(e) => setPersonality(e.target.value)} placeholder="¿Cómo se comporta?" />
          </div>

          <div className="space-y-3">
            <Label>Estilo de Respuesta</Label>
            <RadioGroup value={responseStyle} onValueChange={(v) => setResponseStyle(v as ResponseStyle)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="whatsapp" id="r1" />
                <Label htmlFor="r1">WhatsApp (Natural)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="classic" id="r2" />
                <Label htmlFor="r2">Clásico Roleplay (*acciones*)</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
