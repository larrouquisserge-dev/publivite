"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { CATEGORIES, CATEGORY_GROUPS, getCategoryByValue, getAllFields, getConditionalFields, type Category, type FormField } from '@/data/categories';
import { DynamicField } from './DynamicField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useStore, type Ad } from '@/hooks/useStore';
import { generateId } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  Save, Sparkles, Eye, X, Search, ChevronRight,
  ImagePlus, Tag, Euro,
} from 'lucide-react';

interface AdFormProps {
  initialAd?: Ad;
  mode?: 'create' | 'edit';
}

export function AdForm({ initialAd, mode = 'create' }: AdFormProps) {
  const router = useRouter();
  const { addAd, updateAd } = useStore();

  // Form state
  const [title, setTitle] = useState(initialAd?.title || '');
  const [description, setDescription] = useState(initialAd?.description || '');
  const [price, setPrice] = useState<string>(initialAd?.price?.toString() || '');
  const [category, setCategory] = useState(initialAd?.category || '');
  const [subCategory, setSubCategory] = useState(initialAd?.subCategory || '');
  const [adType, setAdType] = useState<'particulier' | 'pro'>(initialAd?.type || 'particulier');
  const [tags, setTags] = useState<string[]>(initialAd?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [shipping, setShipping] = useState(initialAd?.shipping || false);
  const [attributes, setAttributes] = useState<Record<string, string | string[]>>(initialAd?.attributes || {});
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Get current category
  const currentCategory = useMemo(() => getCategoryByValue(category), [category]);

  // Get fields for current category + subcategory
  const categoryFields = useMemo(() => {
    if (!currentCategory) return [];
    return getAllFields(currentCategory, subCategory);
  }, [currentCategory, subCategory]);

  // Get conditional fields based on current attribute values
  const conditionalFields = useMemo(() => {
    return getConditionalFields(categoryFields, attributes as Record<string, string>);
  }, [categoryFields, attributes]);

  // All visible fields
  const allVisibleFields = useMemo(() => {
    return [...categoryFields, ...conditionalFields];
  }, [categoryFields, conditionalFields]);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return CATEGORIES;
    const search = categorySearch.toLowerCase();
    return CATEGORIES.filter(c => c.label.toLowerCase().includes(search));
  }, [categorySearch]);

  // Group filtered categories
  const groupedCategories = useMemo(() => {
    const groups: Record<string, Category[]> = {};
    for (const cat of filteredCategories) {
      if (!groups[cat.group]) groups[cat.group] = [];
      groups[cat.group].push(cat);
    }
    return groups;
  }, [filteredCategories]);

  const handleAttributeChange = useCallback((name: string, value: string | string[]) => {
    setAttributes(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCategorySelect = (catValue: string) => {
    setCategory(catValue);
    setSubCategory('');
    setAttributes({});
    setShowCategoryPicker(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = (status: 'draft' | 'published' = 'draft') => {
    const adData: Ad = {
      id: initialAd?.id || generateId(),
      title,
      description,
      price: price ? parseFloat(price) : null,
      category,
      subCategory: subCategory || undefined,
      type: adType,
      tags,
      images: initialAd?.images || [],
      attributes,
      status,
      shipping,
      createdAt: initialAd?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (mode === 'edit' && initialAd) {
      updateAd(initialAd.id, adData);
    } else {
      addAd(adData);
    }

    router.push('/ads');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'edit' ? 'Modifier l\'annonce' : 'Créer une annonce'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Remplissez les informations de votre annonce
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push('/ads')}>
            Annuler
          </Button>
          <Button variant="secondary" onClick={() => handleSave('draft')}>
            <Save className="mr-2 h-4 w-4" />
            Brouillon
          </Button>
          <Button onClick={() => handleSave('draft')}>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="h-5 w-5 text-orange-500" />
                Catégorie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  {currentCategory ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-sm py-1 px-3">
                        {currentCategory.label}
                      </Badge>
                      {subCategory && (
                        <>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                          <Badge variant="secondary" className="text-sm py-1 px-3">
                            {currentCategory.subCategories?.find(sc => sc.value === subCategory)?.label}
                          </Badge>
                        </>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setShowCategoryPicker(true)}>
                        Changer
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={() => setShowCategoryPicker(true)} className="w-full justify-start text-gray-500">
                      Sélectionner une catégorie...
                    </Button>
                  )}
                </div>
              </div>

              {/* Category Picker */}
              {showCategoryPicker && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Rechercher une catégorie..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <ScrollArea className="h-64">
                    <div className="p-2">
                      {Object.entries(groupedCategories).map(([group, cats]) => (
                        <div key={group} className="mb-3">
                          <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {CATEGORY_GROUPS[group as keyof typeof CATEGORY_GROUPS]?.label || group}
                          </p>
                          {cats.map((cat) => (
                            <button
                              key={cat.value}
                              onClick={() => handleCategorySelect(cat.value)}
                              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <span className="text-gray-700 dark:text-gray-300">{cat.label}</span>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Sub-category */}
              {currentCategory?.subCategories && currentCategory.subCategories.length > 0 && (
                <div className="space-y-2">
                  <Label required>Type de bien</Label>
                  <Select value={subCategory} onValueChange={setSubCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {currentCategory.subCategories.map((sc) => (
                        <SelectItem key={sc.value} value={sc.value}>{sc.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Pro/Particulier */}
              {currentCategory?.hasProMode && (
                <div className="flex items-center gap-4">
                  <Label>Type d&apos;annonceur</Label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAdType('particulier')}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        adType === 'particulier'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Particulier
                    </button>
                    <button
                      onClick={() => setAdType('pro')}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        adType === 'pro'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Professionnel
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category-specific fields */}
          {allVisibleFields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Détails {currentCategory?.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {allVisibleFields.map((field) => (
                    <div key={field.name} className={field.type === 'multi-select' || field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                      <DynamicField
                        field={field}
                        value={attributes[field.name] || (field.type === 'multi-select' ? [] : '')}
                        onChange={handleAttributeChange}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Title & Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Titre & Description</span>
                <Button variant="outline" size="sm" className="text-purple-600">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Générer avec l&apos;IA
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label required>Titre</Label>
                <Input
                  placeholder="Titre de votre annonce..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={70}
                />
                <p className="text-xs text-gray-500 text-right">{title.length}/70</p>
              </div>
              <div className="space-y-2">
                <Label required>Description</Label>
                <Textarea
                  placeholder="Décrivez votre annonce en détail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  maxLength={4000}
                />
                <p className="text-xs text-gray-500 text-right">{description.length}/4000</p>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImagePlus className="h-5 w-5 text-orange-500" />
                Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-orange-400 transition-colors cursor-pointer">
                <ImagePlus className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Glissez vos photos ici ou cliquez pour parcourir
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG ou WEBP • Max 10 photos • Max 5 Mo par photo
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Euro className="h-5 w-5 text-orange-500" />
                Prix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pr-8 text-lg font-semibold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">€</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping */}
          {currentCategory?.hasShipping && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Livraison</p>
                    <p className="text-xs text-gray-500">Activer la livraison</p>
                  </div>
                  <Switch checked={shipping} onCheckedChange={setShipping} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="h-5 w-5 text-orange-500" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter un tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button variant="outline" size="icon" onClick={handleAddTag}>
                  +
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-orange-500" />
                Aperçu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-2">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {title || 'Titre de l\'annonce'}
                </p>
                <p className="text-lg font-bold text-orange-500">
                  {price ? `${price} €` : 'Prix non défini'}
                </p>
                <p className="text-sm text-gray-500 line-clamp-3">
                  {description || 'Description de l\'annonce...'}
                </p>
                {currentCategory && (
                  <Badge variant="secondary">{currentCategory.label}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
