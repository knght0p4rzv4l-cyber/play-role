/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppSettings } from "../types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Shield, ShieldAlert, Type, Image as ImageIcon, Eye, MessageSquare, Moon, Palette, Zap } from "lucide-react";

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export function SettingsView({ settings, onUpdateSettings }: SettingsViewProps) {
  const update = (key: keyof AppSettings, value: any) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F2F7] dark:bg-black">
      <header className="px-4 pt-12 pb-4 bg-white dark:bg-[#121212] border-b dark:border-[#222]">
        <h1 className="text-3xl font-bold">Configuración</h1>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* AI Settings */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase px-2">Inteligencia Artificial</h2>
            <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden divide-y dark:divide-[#333]">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                    <Shield size={20} />
                  </div>
                  <Label htmlFor="nsfw" className="text-[17px]">Modo NSFW</Label>
                </div>
                <Switch 
                  id="nsfw" 
                  checked={settings.nsfwMode} 
                  onCheckedChange={(v) => update('nsfwMode', v)} 
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600">
                    <ShieldAlert size={20} />
                  </div>
                  <Label htmlFor="super-nsfw" className="text-[17px]">Super Modo NSFW</Label>
                </div>
                <Switch 
                  id="super-nsfw" 
                  checked={settings.superNsfwMode} 
                  onCheckedChange={(v) => update('superNsfwMode', v)} 
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
                    <Type size={20} />
                  </div>
                  <Label htmlFor="short-writing" className="text-[17px]">Escritura Corta</Label>
                </div>
                <Switch 
                  id="short-writing" 
                  checked={settings.shortWritingMode} 
                  onCheckedChange={(v) => update('shortWritingMode', v)} 
                />
              </div>
            </div>
          </section>

          {/* Media Settings */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase px-2">Multimedia</h2>
            <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden divide-y dark:divide-[#333]">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                    <ImageIcon size={20} />
                  </div>
                  <Label htmlFor="ai-images" className="text-[17px]">Imágenes IA</Label>
                </div>
                <Switch 
                  id="ai-images" 
                  checked={settings.aiImagesEnabled} 
                  onCheckedChange={(v) => update('aiImagesEnabled', v)} 
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                    <Eye size={20} />
                  </div>
                  <Label htmlFor="img-analysis" className="text-[17px]">Análisis de Fotos</Label>
                </div>
                <Switch 
                  id="img-analysis" 
                  checked={settings.imageAnalysisEnabled} 
                  onCheckedChange={(v) => update('imageAnalysisEnabled', v)} 
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600">
                    <Zap size={20} />
                  </div>
                  <Label htmlFor="super-images" className="text-[17px]">Super Imágenes</Label>
                </div>
                <Switch 
                  id="super-images" 
                  checked={settings.superImagesEnabled} 
                  onCheckedChange={(v) => update('superImagesEnabled', v)} 
                />
              </div>

              {settings.superImagesEnabled && (
                <div className="p-4 space-y-2">
                  <Label className="text-xs text-gray-500">API Key para Super Imágenes</Label>
                  <Input 
                    type="password" 
                    placeholder="Ingrese API Key" 
                    value={settings.superImagesApiKey}
                    onChange={(e) => update('superImagesApiKey', e.target.value)}
                    className="bg-gray-50 dark:bg-black"
                  />
                </div>
              )}
            </div>
          </section>

          {/* App Settings */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase px-2">Aplicación</h2>
            <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden divide-y dark:divide-[#333]">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                    <MessageSquare size={20} />
                  </div>
                  <Label htmlFor="auto-msg" className="text-[17px]">Mensajes Automáticos</Label>
                </div>
                <Switch 
                  id="auto-msg" 
                  checked={settings.autoMessagingEnabled} 
                  onCheckedChange={(v) => update('autoMessagingEnabled', v)} 
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600">
                    <Moon size={20} />
                  </div>
                  <Label htmlFor="dark-mode" className="text-[17px]">Modo Oscuro</Label>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={settings.darkMode} 
                  onCheckedChange={(v) => update('darkMode', v)} 
                />
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-600">
                    <Palette size={20} />
                  </div>
                  <Label className="text-[17px]">Fondo de Chat</Label>
                </div>
                <Input 
                  type="text" 
                  placeholder="URL de la imagen" 
                  value={settings.chatBackground}
                  onChange={(e) => update('chatBackground', e.target.value)}
                  className="bg-gray-50 dark:bg-black"
                />
              </div>
            </div>
          </section>

          {/* API Keys */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase px-2">Conexiones</h2>
            <div className="bg-white dark:bg-[#1C1C1E] rounded-xl p-4 space-y-2">
              <Label className="text-xs text-gray-500">DeepSeek API Key</Label>
              <Input 
                type="password" 
                placeholder="sk-..." 
                value={settings.deepseekApiKey}
                onChange={(e) => update('deepseekApiKey', e.target.value)}
                className="bg-gray-50 dark:bg-black"
              />
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
