import type { Product } from '../api/types';

const CATEGORY_FALLBACK: Record<string, string> = {
  Electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
  Fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
  Beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&q=80',
  Sports: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
  Home: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
};

export function getProductImageUri(product: Pick<Product, 'primary_image' | 'category_name' | 'id'>): string {
  if (product.primary_image) return product.primary_image;
  return CATEGORY_FALLBACK[product.category_name] ?? `https://picsum.photos/seed/luxe-${product.id}/800/800`;
}

export function getProductGallery(product: Product): string[] {
  const fromApi = product.images?.map((i) => i.url).filter(Boolean) as string[] | undefined;
  if (fromApi?.length) return fromApi;
  const primary = getProductImageUri(product);
  return [primary];
}
