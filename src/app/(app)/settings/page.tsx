"use client";

import React from 'react';
import { useStore } from '@/hooks/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, User, Bell, Palette, Save } from 'lucide-react';

export default function SettingsPage() {
  const { user, theme, setTheme } = useStore();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez votre compte et vos préférences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5 text-orange-500" />Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input defaultValue={user?.name} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={user?.email} type="email" />
            </div>
            <div className="space-y-2">
              <Label>Ville par défaut</Label>
              <Input defaultValue={user?.defaultCity} placeholder="Paris" />
            </div>
          </div>
          <Button><Save className="mr-2 h-4 w-4" />Sauvegarder</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Palette className="h-5 w-5 text-orange-500" />Apparence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Thème sombre</p>
              <p className="text-sm text-gray-500">Activer le mode sombre</p>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5 text-orange-500" />Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifications par email</p>
              <p className="text-sm text-gray-500">Recevoir les alertes par email</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertes crédits faibles</p>
              <p className="text-sm text-gray-500">Notification quand les crédits sont bas</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
