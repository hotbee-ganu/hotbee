import { Product } from './types';

/**
 * Category defaults so publishing a design needs a title + price only.
 * Everything else (fabric, print method, sizes, colourways, shipping copy)
 * is filled in from the preset rather than typed by the admin.
 */

export interface CategoryPreset {
  collection: string;
  material: string;
  printType: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  description: string;
  suggestedPrice: number;
  suggestedMrp: number;
  /** Typical Qikink SKU prefix, shown as a hint in the publish form. */
  skuHint: string;
}

export const CATEGORY_PRESETS: Record<string, CategoryPreset> = {
  'Oversized Tees': {
    collection: 'Cyberpunk Honey Drop',
    material: '240 GSM 100% Combed Cotton',
    printType: 'Qikink Premium DTF Print',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Obsidian Black', hex: '#0a0c10' },
      { name: 'Bone White', hex: '#f3efe6' },
    ],
    description:
      'Heavyweight 240 GSM combed cotton oversized tee with a drop-shoulder cut and a high-density DTF print that survives 30+ washes.',
    suggestedPrice: 1199,
    suggestedMrp: 1999,
    skuHint: 'e.g. MRnHs-Bk',
  },
  'Premium Hoodies': {
    collection: 'Onyx Fleece Series',
    material: '380 GSM Fleece-Lined Cotton Blend',
    printType: 'Qikink Premium DTF Print',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Obsidian Black', hex: '#0a0c10' },
      { name: 'Charcoal Grey', hex: '#3a3f47' },
    ],
    description:
      'Fleece-lined premium hoodie in a heavyweight 380 GSM cotton blend, with ribbed cuffs, a double-layer hood and a durable DTF print.',
    suggestedPrice: 1899,
    suggestedMrp: 2999,
    skuHint: 'e.g. HdUn-Bk',
  },
  'Acid Wash Drop': {
    collection: 'Acid Wash Limited Drop',
    material: '240 GSM Acid-Washed Combed Cotton',
    printType: 'Qikink Premium DTF Print',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Acid Black', hex: '#1b1b1f' },
      { name: 'Acid Blue', hex: '#2f4a63' },
    ],
    description:
      'Individually acid-washed heavyweight tee - every piece has a unique fade. Garment-dyed for zero shrinkage.',
    suggestedPrice: 1399,
    suggestedMrp: 2299,
    skuHint: 'e.g. AwTs-Bk',
  },
  'Accessories & Mugs': {
    collection: 'HOTBEE Everyday Carry',
    material: 'Ceramic / Canvas',
    printType: 'Qikink Sublimation Print',
    sizes: ['Standard'],
    colors: [{ name: 'Classic White', hex: '#ffffff' }],
    description:
      'Sublimation-printed accessory with a scratch-resistant finish. Dishwasher and microwave safe where applicable.',
    suggestedPrice: 499,
    suggestedMrp: 899,
    skuHint: 'e.g. Mug-Wh',
  },
};

export const DEFAULT_CATEGORY = 'Oversized Tees';

export const CATEGORY_NAMES = Object.keys(CATEGORY_PRESETS);

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

export const buildProductFromDesign = (input: {
  imageUrl?: string;
  images?: string[];
  title: string;
  category?: string;
  price: number;
  originalPrice?: number;
  qikinkSku?: string;
  collection?: string;
  description?: string;
  id?: string;
}): Product => {
  const category = input.category && CATEGORY_PRESETS[input.category] ? input.category : DEFAULT_CATEGORY;
  const preset = CATEGORY_PRESETS[category];

  const price = Math.max(1, Math.round(input.price));
  const originalPrice = Math.max(price, Math.round(input.originalPrice ?? preset.suggestedMrp));
  const discountPercentage =
    originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const rawImages = Array.isArray(input.images) && input.images.length > 0
    ? input.images
    : input.imageUrl
      ? [input.imageUrl]
      : [];
  const images = rawImages.filter((img): img is string => typeof img === 'string' && img.trim().length > 0);

  return {
    id: input.id || `hb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    qikink_id: input.qikinkSku?.trim() || undefined,
    title: input.title.trim(),
    slug: `${slugify(input.title)}-${Math.random().toString(36).slice(2, 6)}`,
    description: input.description?.trim() || preset.description,
    price,
    originalPrice,
    discountPercentage,
    rating: 5,
    reviewsCount: 0,
    category,
    collection: input.collection?.trim() || preset.collection,
    images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=900&auto=format&fit=crop&q=80'],
    colors: preset.colors,
    sizes: preset.sizes,
    inStock: true,
    isTrending: false,
    isNew: true,
    material: preset.material,
    printType: preset.printType,
    shippingInfo: 'Dispatched within 24 hours via Qikink POD',
  };
};
