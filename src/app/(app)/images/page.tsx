"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image, Upload } from 'lucide-react';

export default function ImagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Galerie d&apos;images</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Bibliothèque centralisée de vos photos</p>
        </div>
        <Button><Upload className="mr-2 h-4 w-4" />Uploader des images</Button>
      </div>

      <Card>
        <CardContent className="py-16 text-center">
          <Image className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune image</h3>
          <p className="text-gray-500 mb-4">Uploadez vos premières images pour les réutiliser dans vos annonces</p>
          <Button><Upload className="mr-2 h-4 w-4" />Uploader</Button>
        </CardContent>
      </Card>
    </div>
  );
}
