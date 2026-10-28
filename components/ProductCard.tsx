'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { Product } from '@/lib/types';
import { useStore } from '@/lib/store';
import { Realistic3DCard } from './Realistic3DCard';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';

const CARD_SIZES = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';

interface ProductCardProps {
  product: Product;
  /** Set on the first row so the hero images are not lazy-loaded. */
  priority?: boolean;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const isWished = isInWishlist(product.id);

  const primaryImage = product.images[0] || FALLBACK_IMAGE;
  const secondaryImage = product.images[1];

  return (
    <Realistic3DCard className="h-full">
      <div className="glass-card rounded-2xl overflow-hidden group flex flex-col justify-between relative border border-hotbee-500/15 h-full">
        {/* Badges with 3D Popout */}
        <div
          className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none"
          style={{ transform: 'translateZ(35px)' }}
        >
          {product.discountPercentage > 0 && (
            <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-full shadow-lg">
              {product.discountPercentage}% OFF
            </span>
          )}
          {product.isTrending && (
            <span className="bg-hotbee-darker/90 text-hotbee-500 border border-hotbee-500/30 text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full">
              Hot
            </span>
          )}
        </div>

        <button
          onClick={() => toggleWishlist(product.id)}
          aria-pressed={isWished}
          aria-label={isWished ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
          className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-hotbee-darker/80 border border-hotbee-500/20 text-gray-300 hover:text-hotbee-500 transition-colors"
          style={{ transform: 'translateZ(30px)' }}
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-hotbee-500 text-hotbee-500' : ''}`} />
        </button>

        {/* Image: both frames stacked and crossfaded in CSS */}
        <Link
          href={`/products/${product.id}`}
          className="block relative aspect-[4/5] overflow-hidden bg-hotbee-darker"
          tabIndex={-1}
          aria-hidden="true"
        >
          <Image
            src={primaryImage}
            alt=""
            fill
            sizes={CARD_SIZES}
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt=""
              fill
              sizes={CARD_SIZES}
              loading="lazy"
              className="img-swap-secondary object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-hotbee-darker via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
            <span className="glass-btn-secondary px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xl">
              <Eye className="w-3.5 h-3.5" /> View Details
            </span>
          </div>
        </Link>

        {/* Info */}
        <div className="p-3 sm:p-4 flex flex-col flex-grow justify-between" style={{ transform: 'translateZ(25px)' }}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-hotbee-500/80 truncate">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-xs text-amber-400 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold">{product.rating}</span>
                <span className="text-gray-500 text-[10px]">({product.reviewsCount})</span>
              </div>
            </div>

            <h3 className="font-semibold text-sm text-gray-100 line-clamp-2 sm:line-clamp-1 group-hover:text-hotbee-500 transition-colors">
              <Link href={`/products/${product.id}`}>{product.title}</Link>
            </h3>

            <p className="text-xs text-gray-400 line-clamp-1 mt-1 font-light">{product.material}</p>
          </div>

          <div className="mt-4 pt-3 border-t border-hotbee-500/10 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-sm sm:text-base font-extrabold text-white">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-gray-500 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <button
              onClick={() =>
                addToCart(product, product.colors[0]?.name || 'Standard', product.sizes[0] || 'M')
              }
              aria-label={`Add ${product.title} to cart`}
              className="p-2.5 rounded-xl glass-btn-primary shrink-0 active:scale-95 transition-transform"
              style={{ transform: 'translateZ(30px)' }}
            >
              <ShoppingBag className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      </div>
    </Realistic3DCard>
  );
};

export const ProductCard = memo(ProductCardComponent);
