'use server';

import fs from 'fs';
import path from 'path';

export async function getCatalogFiles(folder: string): Promise<string[]> {
  try {
    const safeFolder = folder.replace(/[^a-zA-Z0-9-]/g, '');
    const dirPath = path.join(process.cwd(), 'public', 'catalogo', safeFolder);
    
    if (!fs.existsSync(dirPath)) {
      console.warn(`[Catalog] Directory does not exist: ${dirPath}`);
      return [];
    }
    
    const files = fs.readdirSync(dirPath);
    // Filter only images and remove extension for the ID
    const imageFiles = files
      .filter(file => /\.(jpg|jpeg|png|webp|avif)$/i.test(file))
      .map(file => file.replace(/\.[^/.]+$/, '')); // Remove extension
      
    // Sort naturally (e.g. ref-2 before ref-10)
    return imageFiles.sort((a, b) => {
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });
  } catch (error) {
    console.error('Error reading catalog:', error);
    return [];
  }
}
