/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Character } from "../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfileEditorProps {
  user: Character;
  onSave: (user: Character) => void;
  onCancel: () => void;
}

export function UserProfileEditor({ user, onSave, onCancel }: UserProfileEditorProps) {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [description, setDescription] = useState(user.description);
  const [personality, setPersonality] = useState(user.personality);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      ...user,
      name,
      avatar,
      description,
      personality
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black">
      <header className="px-4 pt-12 pb-4 flex justify-between items-center border-b dark:border-[#222]">
        <button onClick={onCancel} className="text-[#007AFF]">Cancelar</button>
        <h1 className="font-bold">Mi Perfil</h1>
        <button onClick={handleSave} className="text-[#007AFF] font-bold">Guardar</button>
      </header>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatar} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" onClick={() => setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`)}>
              Cambiar Avatar
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Tu Nombre</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
          </div>

          <div className="space-y-2">
            <Label>Tu Descripción (Roleplay)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="¿Quién eres en la historia?" />
          </div>

          <div className="space-y-2">
            <Label>Tu Personalidad</Label>
            <Textarea value={personality} onChange={(e) => setPersonality(e.target.value)} placeholder="¿Cómo actúas?" />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
