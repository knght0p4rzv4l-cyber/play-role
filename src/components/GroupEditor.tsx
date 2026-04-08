/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Group, Character } from "../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

interface GroupEditorProps {
  group?: Group;
  characters: Character[];
  onSave: (group: Group) => void;
  onCancel: () => void;
}

export function GroupEditor({ group, characters, onSave, onCancel }: GroupEditorProps) {
  const [name, setName] = useState(group?.name || "");
  const [avatar, setAvatar] = useState(group?.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${Date.now()}`);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(group?.memberIds || []);

  const handleSave = () => {
    if (!name.trim() || selectedMembers.length === 0) return;
    onSave({
      id: group?.id || `group-${Date.now()}`,
      name,
      avatar,
      memberIds: selectedMembers,
      isSuspended: group?.isSuspended || false
    });
  };

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black">
      <header className="px-4 pt-12 pb-4 flex justify-between items-center border-b dark:border-[#222]">
        <button onClick={onCancel} className="text-[#007AFF]">Cancelar</button>
        <h1 className="font-bold">{group ? 'Editar Grupo' : 'Nuevo Grupo'}</h1>
        <button onClick={handleSave} className="text-[#007AFF] font-bold">Guardar</button>
      </header>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatar} />
              <AvatarFallback>G</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" onClick={() => setAvatar(`https://api.dicebear.com/7.x/shapes/svg?seed=${Date.now()}`)}>
              Cambiar Avatar
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Nombre del Grupo</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Los Aventureros" />
          </div>

          <div className="space-y-3">
            <Label>Seleccionar Integrantes</Label>
            <div className="space-y-2">
              {characters.filter(c => c.isAI).map(char => (
                <div key={char.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={char.avatar} />
                      <AvatarFallback>{char.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{char.name}</span>
                  </div>
                  <Checkbox 
                    checked={selectedMembers.includes(char.id)} 
                    onCheckedChange={() => toggleMember(char.id)} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
