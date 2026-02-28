"use client";

import React, { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { generateId } from '@/lib/utils';
import {
  PlusCircle, Users, Mail, Phone, Eye, EyeOff,
  Trash2, Edit, CheckCircle2, XCircle, Shield,
} from 'lucide-react';

export default function AccountsPage() {
  const { accounts, addAccount, updateAccount, deleteAccount } = useStore();
  const [showDialog, setShowDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', phone: '', hidePhone: false });

  const handleAdd = () => {
    addAccount({
      id: generateId(),
      email: form.email,
      password: form.password,
      phone: form.phone,
      hidePhone: form.hidePhone,
      isActive: true,
      lastVerifiedAt: null,
      createdAt: new Date().toISOString(),
    });
    setForm({ email: '', password: '', phone: '', hidePhone: false });
    setShowDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Comptes Leboncoin</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{accounts.length} compte{accounts.length > 1 ? 's' : ''} connecté{accounts.length > 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />Ajouter un compte
        </Button>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Sécurité des identifiants</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Vos identifiants Leboncoin sont chiffrés avec AES-256 et ne sont jamais stockés en clair.</p>
        </div>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun compte connecté</h3>
            <p className="text-gray-500 mb-4">Ajoutez un compte Leboncoin pour commencer à publier</p>
            <Button onClick={() => setShowDialog(true)}>Ajouter un compte</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{account.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={account.isActive ? 'success' : 'destructive'}>
                          {account.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => deleteAccount(account.id)} className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4" />
                    <span>{account.hidePhone ? '***' : account.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Shield className="h-4 w-4" />
                    <span>Mot de passe chiffré</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un compte Leboncoin</DialogTitle>
            <DialogDescription>Entrez vos identifiants Leboncoin. Ils seront chiffrés de manière sécurisée.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label required>Email Leboncoin</Label>
              <Input type="email" placeholder="votre@email.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label required>Mot de passe</Label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} placeholder="Mot de passe" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input type="tel" placeholder="06 12 34 56 78" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Masquer le numéro</Label>
              <Switch checked={form.hidePhone} onCheckedChange={(v) => setForm({...form, hidePhone: v})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
            <Button onClick={handleAdd} disabled={!form.email || !form.password}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
