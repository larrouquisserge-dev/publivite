"use client";

import React, { useMemo } from 'react';
import { FormField, FieldOption } from '@/data/categories';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Search, Info } from 'lucide-react';

interface DynamicFieldProps {
  field: FormField;
  value: string | string[];
  onChange: (name: string, value: string | string[]) => void;
  /** Valeurs de tous les champs (pour les dépendances) */
  allValues?: Record<string, string | string[]>;
  /** Afficher une erreur de validation */
  error?: string;
}

/**
 * Composant de champ dynamique qui s'adapte au type de champ défini
 * Gère tous les types: text, number, select, multi-select, date, toggle, textarea
 */
export function DynamicField({ field, value, onChange, allValues, error }: DynamicFieldProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleChange = (newValue: string | string[]) => {
    onChange(field.name, newValue);
  };

  // Filtrer les options pour les selects avec beaucoup d'options
  const filteredOptions = useMemo(() => {
    if (!field.options) return [];
    if (!searchTerm) return field.options;
    
    const search = searchTerm.toLowerCase();
    return field.options.filter(opt => 
      opt.label.toLowerCase().includes(search) ||
      opt.value.toLowerCase().includes(search)
    );
  }, [field.options, searchTerm]);

  // Vérifier si le champ a beaucoup d'options (nécessite une recherche)
  const hasSearchableOptions = field.options && field.options.length > 15;

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            type="text"
            placeholder={field.placeholder || ''}
            value={(value as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={field.placeholder || ''}
            value={(value as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'date':
        return (
          <Input
            type="text"
            placeholder={field.placeholder || 'MM / AAAA'}
            value={(value as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder || ''}
            value={(value as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            rows={4}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'select':
        // Pour les selects avec beaucoup d'options, utiliser une recherche
        if (hasSearchableOptions) {
          return (
            <div className="space-y-2">
              <Select value={(value as string) || ''} onValueChange={(v) => handleChange(v)}>
                <SelectTrigger className={error ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 h-8"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <ScrollArea className="h-[200px]">
                    {filteredOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                    {filteredOptions.length === 0 && (
                      <div className="py-4 text-center text-sm text-gray-500">
                        Aucun résultat
                      </div>
                    )}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
          );
        }

        return (
          <Select value={(value as string) || ''} onValueChange={(v) => handleChange(v)}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multi-select':
        const selectedValues = Array.isArray(value) ? value : [];
        const selectedLabels = selectedValues
          .map(v => field.options?.find(o => o.value === v)?.label || v)
          .slice(0, 3);
        
        return (
          <div className="space-y-2">
            {/* Afficher les sélections actuelles */}
            {selectedValues.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedValues.map((v) => {
                  const opt = field.options?.find(o => o.value === v);
                  return (
                    <Badge key={v} variant="secondary" className="gap-1 text-xs">
                      {opt?.label || v}
                      <button
                        type="button"
                        onClick={() => handleChange(selectedValues.filter(sv => sv !== v))}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
            
            {/* Liste des options avec recherche pour beaucoup d'options */}
            {hasSearchableOptions && (
              <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8"
                />
              </div>
            )}
            
            <ScrollArea className={`rounded-lg border border-gray-200 dark:border-gray-700 ${error ? 'border-red-500' : ''}`}>
              <div className="p-3 space-y-1 max-h-48">
                {filteredOptions.map((opt) => (
                  <label 
                    key={opt.value} 
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 py-1.5"
                  >
                    <Checkbox
                      checked={selectedValues.includes(opt.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleChange([...selectedValues, opt.value]);
                        } else {
                          handleChange(selectedValues.filter((v) => v !== opt.value));
                        }
                      }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                  </label>
                ))}
                {filteredOptions.length === 0 && (
                  <div className="py-4 text-center text-sm text-gray-500">
                    Aucun résultat
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        );

      case 'toggle':
        return (
          <div className="flex items-center gap-3">
            <Switch
              checked={value === 'true'}
              onCheckedChange={(checked) => handleChange(checked ? 'true' : 'false')}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {value === 'true' ? 'Oui' : 'Non'}
            </span>
          </div>
        );

      default:
        return (
          <Input
            value={(value as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={error ? 'border-red-500' : ''}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className={field.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ''}>
          {field.label}
        </Label>
        {field.notes && (
          <div className="relative group">
            <Info className="h-4 w-4 text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 text-center z-50">
              {field.notes}
            </div>
          </div>
        )}
      </div>
      {renderField()}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
