'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { ProductCard } from '@/components/ProductCard';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const { products } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Navbar links change only the URL while this page stays mounted, so follow it.
  useEffect(() => {
    setSelectedCategory(initialCategory);
    setSearchQuery(initialSearch);
  }, [initialCategory, initialSearch]);

  const categories = ['All', 'Oversized Tees', 'Premium Hoodies', 'Acid Wash Drop', 'Accessories & Mugs'];

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSearch =
          searchQuery === '' ||
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-hotbee-500">
          HOTBEE Catalog
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          All Apparel & Accessories
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 font-light">
          Premium 240 GSM Combed Cotton, Heavy Fleece Hoodies & Eco-printed Accessories.
        </p>
      </div>

      {/* Category Pills & Filters */}
      <div className="glass-panel p-4 rounded-2xl border border-hotbee-500/20 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'glass-btn-primary shadow-glow-gold'
                    : 'glass-btn-secondary text-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input & Sort Dropdown */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filter catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-input rounded-full pl-9 pr-8 py-2 text-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 bg-hotbee-darker rounded-full px-3 py-2 border border-hotbee-500/20">
              <ArrowUpDown className="w-3.5 h-3.5 text-hotbee-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="featured" className="bg-hotbee-darker">Featured</option>
                <option value="price-low" className="bg-hotbee-darker">Price: Low to High</option>
                <option value="price-high" className="bg-hotbee-darker">Price: High to Low</option>
                <option value="rating" className="bg-hotbee-darker">Highest Rated</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Active Filter Summary */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <span>Showing <b>{filteredProducts.length}</b> products</span>
        {selectedCategory !== 'All' && (
          <button
            onClick={() => setSelectedCategory('All')}
            className="text-hotbee-500 hover:underline"
          >
            Clear Category Filter
          </button>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl space-y-4">
          <SlidersHorizontal className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No products found</h3>
          <p className="text-xs text-gray-400">Try adjusting your category filter or search keywords.</p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="glass-btn-primary px-6 py-2 rounded-full text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      )}

    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-hotbee-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-400">Loading HOTBEE Catalog...</p>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
