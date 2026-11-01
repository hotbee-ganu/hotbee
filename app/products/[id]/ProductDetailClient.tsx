'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Star, ShieldCheck, Heart, ShoppingBag, Truck, RotateCcw, Zap, Plus, Minus, Check, Ruler, X, ArrowRight, Sparkles, Camera } from 'lucide-react';
import { useStore } from '@/lib/store';

const ThreeProductStage = dynamic(() => import('@/components/ThreeProductStage'), {
  ssr: false,
  loading: () => (
    <div className="relative aspect-[4/5] rounded-3xl overflow-hidden glass-panel border border-hotbee-500/30 flex flex-col items-center justify-center p-6 text-center space-y-3">
      <div className="w-10 h-10 border-2 border-hotbee-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold text-hotbee-500 tracking-wider uppercase">Loading 3D Studio Model...</span>
    </div>
  ),
});

export default function ProductDetailClient({ productId }: { productId: string }) {
  const router = useRouter();
  const { products, reviews, addToCart, toggleWishlist, isInWishlist, addReview } = useStore();

  const product = products.find((p) => p.id === productId) || products[0];
  const isWished = isInWishlist(product.id);

  const [viewMode, setViewMode] = useState<'photos' | '3d'>('3d');
  const [selectedImage, setSelectedImage] = useState<string>(product?.images[0] || '');
  const [selectedColor, setSelectedColor] = useState<string>(product?.colors[0]?.name || 'Default');
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes[0] || 'M');
  const [quantity, setQuantity] = useState<number>(1);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'shipping' | 'reviews'>('specs');

  // Immediately synchronize when a new product is loaded
  React.useEffect(() => {
    if (product) {
      setSelectedImage(product.images[0] || '');
      setSelectedColor(product.colors[0]?.name || 'Default');
      setSelectedSize(product.sizes[0] || 'M');
      setQuantity(1);
    }
  }, [productId, product]);

  // Review Form state
  const [newReview, setNewReview] = useState({ author: '', rating: 5, title: '', comment: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const productReviews = reviews.filter((r) => r.productId === product.id);

  const handleBuyNow = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
    router.push('/checkout');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.author || !newReview.comment) return;
    addReview({
      productId: product.id,
      author: newReview.author,
      rating: newReview.rating,
      title: newReview.title || 'Great product!',
      comment: newReview.comment,
      verifiedPurchase: true
    });
    setReviewSubmitted(true);
    setNewReview({ author: '', rating: 5, title: '', comment: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400">
        <Link href="/" className="hover:text-hotbee-500">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-hotbee-500">Catalog</Link>
        <span>/</span>
        <span className="text-gray-200 font-semibold">{product.title}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left: 3D Hologram / Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Mode Switcher Pills */}
          <div className="flex items-center gap-2 bg-hotbee-darker/80 p-1.5 rounded-2xl border border-hotbee-500/20 w-fit">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                viewMode === '3d'
                  ? 'bg-hotbee-500 text-black shadow-glow-gold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D Live Model ⚡</span>
            </button>
            <button
              onClick={() => setViewMode('photos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                viewMode === 'photos'
                  ? 'bg-hotbee-500 text-black shadow-glow-gold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Photo Gallery</span>
            </button>
          </div>

          {viewMode === '3d' ? (
            <div className="space-y-3">
              <ThreeProductStage
                imageUrl={selectedImage || product.images[0]}
                secondaryImageUrl={product.images[1] || product.images[0]}
                title={product.title}
                price={product.price}
                category={product.category}
              />
              <div className="flex flex-wrap items-center justify-between text-xs text-gray-400 px-2 gap-2">
                <span className="flex items-center gap-1.5 text-hotbee-500 font-semibold">
                  <Zap className="w-3.5 h-3.5" /> 360° Real-Time Physical Lighting
                </span>
                <span>Subdivided 240 GSM Fabric Mesh</span>
              </div>
            </div>
          ) : (
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden glass-panel border border-hotbee-500/20 shadow-glow-gold-lg">
              <Image
                src={selectedImage || product.images[0]}
                alt={product.title}
                fill
                unoptimized={(selectedImage || product.images[0]).startsWith('data:')}
                className="object-cover object-center"
                priority
              />
              {product.discountPercentage > 0 && (
                <span className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-xs px-3 py-1 rounded-full shadow-lg">
                  {product.discountPercentage}% OFF
                </span>
              )}
            </div>
          )}

          {/* Thumbnails - Visible in BOTH 3D & Photo modes */}
          {product.images.length > 1 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="font-bold text-gray-200 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-hotbee-500" />
                  Available Angles ({product.images.length} views)
                </span>
                <span className="text-[11px] text-hotbee-400 font-semibold">
                  Front, Back &amp; Sides
                </span>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, i) => {
                  const isSelected = (selectedImage || product.images[0]) === img;
                  const label = i === 0 ? 'Front View' : i === 1 ? 'Back View' : i === 2 ? 'Side View' : `Angle ${i + 1}`;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedImage(img);
                        if (viewMode === '3d') {
                          setViewMode('photos');
                        }
                      }}
                      className={`relative w-20 sm:w-24 aspect-[4/5] rounded-2xl overflow-hidden glass-panel border transition-all shrink-0 group ${
                        isSelected
                          ? 'border-hotbee-500 ring-2 ring-hotbee-500/50 shadow-glow-gold scale-[1.02]'
                          : 'border-white/10 opacity-70 hover:opacity-100 hover:border-hotbee-500/30'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.title} - ${label}`}
                        fill
                        unoptimized={img.startsWith('data:')}
                        className="object-cover"
                      />
                      <span className="absolute bottom-1 inset-x-1 text-center bg-black/85 backdrop-blur-xs text-[9px] font-extrabold uppercase px-1 py-0.5 rounded text-white group-hover:text-hotbee-400 transition-colors">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Product Info & Purchase Form */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-hotbee-500">
              {product.category} • {product.collection}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {product.title}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-white">{product.rating}</span>
              <span className="text-xs text-gray-400">({product.reviewsCount} verified reviews)</span>
            </div>
          </div>

          {/* Price Box */}
          <div className="glass-panel p-4 rounded-2xl border border-hotbee-500/20 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-gradient-gold">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-xs text-amber-400 font-bold ml-auto bg-hotbee-500/10 px-2.5 py-1 rounded-full border border-hotbee-500/30">
              In Stock & Ready for Qikink POD
            </span>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex justify-between">
              <span>Color: <b className="text-hotbee-500">{selectedColor}</b></span>
            </label>
            <div className="flex gap-3">
              {product.colors.map((col) => (
                <button
                  key={col.name}
                  onClick={() => setSelectedColor(col.name)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedColor === col.name
                      ? 'border-hotbee-500 bg-hotbee-500/20 text-white shadow-glow-gold'
                      : 'border-hotbee-500/20 bg-hotbee-darker text-gray-400 hover:text-white'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: col.hex }}
                  />
                  {col.name}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold uppercase tracking-wider text-gray-300">
                Size: <b className="text-hotbee-500">{selectedSize}</b>
              </label>
              <button
                onClick={() => setShowSizeGuide(true)}
                className="text-hotbee-500 hover:underline flex items-center gap-1 font-semibold"
              >
                <Ruler className="w-3.5 h-3.5" /> Size Guide
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                    selectedSize === size
                      ? 'border-hotbee-500 bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-glow-gold'
                      : 'border-hotbee-500/20 bg-hotbee-darker text-gray-300 hover:border-hotbee-500/50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Quantity:
            </label>
            <div className="flex items-center gap-3 bg-hotbee-darker rounded-xl p-1.5 border border-hotbee-500/20">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1.5 text-gray-400 hover:text-white"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-extrabold px-3">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-1.5 text-gray-400 hover:text-white"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => addToCart(product, selectedColor, selectedSize, quantity)}
              className="glass-btn-primary w-full py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <ShoppingBag className="w-5 h-5 text-black" />
              <span>Add to Cart</span>
            </button>

            <div className="grid grid-cols-12 gap-3">
              <button
                onClick={handleBuyNow}
                className="col-span-9 glass-btn-secondary py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Instant Buy Now</span>
                <ArrowRight className="w-4 h-4 text-hotbee-500" />
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`col-span-3 p-3 rounded-2xl border flex items-center justify-center transition-all ${
                  isWished
                    ? 'border-hotbee-500 bg-hotbee-500/20 text-hotbee-500'
                    : 'border-hotbee-500/20 bg-hotbee-darker text-gray-400 hover:text-white'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWished ? 'fill-hotbee-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Value Props List */}
          <div className="border-t border-hotbee-500/15 pt-4 space-y-2 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-hotbee-500 shrink-0" />
              <span>Fulfillment: <b>{product.shippingInfo}</b></span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-hotbee-500 shrink-0" />
              <span>Free Express Delivery on orders above ₹999</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-hotbee-500 shrink-0" />
              <span>Easy 7-day Replacement for size changes</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Section */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-hotbee-500/20 space-y-6">
        <div className="flex border-b border-hotbee-500/15 gap-8">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === 'specs' ? 'text-hotbee-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            Fabric & Specifications
            {activeTab === 'specs' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-hotbee-500" />}
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === 'shipping' ? 'text-hotbee-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            Qikink Shipping & Returns
            {activeTab === 'shipping' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-hotbee-500" />}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === 'reviews' ? 'text-hotbee-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            Customer Reviews ({productReviews.length})
            {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-hotbee-500" />}
          </button>
        </div>

        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-300 leading-relaxed">
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">Material & Construction</h4>
              <p>• <b>Material:</b> {product.material}</p>
              <p>• <b>Print Technology:</b> {product.printType}</p>
              <p>• <b>Fit Type:</b> Streetwear Boxy Drop-Shoulder Fit</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">Care Instructions</h4>
              <p>• Machine wash cold inside-out with gentle cycle.</p>
              <p>• Do not iron directly over the print graphic.</p>
              <p>• Tumble dry low or hang dry in shade for print longevity.</p>
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
            <h4 className="font-bold text-white text-sm">Automated Print-on-Demand Fulfillment</h4>
            <p>Every HOTBEE order is custom printed upon order placement via Qikink API and dispatched within 24–48 hours directly to your door.</p>
            <p>Track your shipment real-time using your <b>Order ID</b> on our <Link href="/track-order" className="text-hotbee-500 hover:underline">Track Order page</Link>.</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-8">
            <div className="space-y-4">
              {productReviews.length === 0 ? (
                <p className="text-xs text-gray-400">Be the first verified buyer to review this piece!</p>
              ) : (
                productReviews.map((rev) => (
                  <div key={rev.id} className="glass-card p-4 rounded-2xl space-y-2 border border-hotbee-500/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-500">{rev.date}</span>
                    </div>
                    <h5 className="font-bold text-white text-xs">{rev.title}</h5>
                    <p className="text-xs text-gray-300">{rev.comment}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 pt-1">
                      <span>By <b>{rev.author}</b></span>
                      {rev.verifiedPurchase && (
                        <span className="text-hotbee-500 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-hotbee-500/15 pt-6 space-y-4">
              <h4 className="font-bold text-white text-sm">Write a Customer Review</h4>
              {reviewSubmitted ? (
                <div className="p-4 rounded-xl bg-hotbee-500/10 border border-hotbee-500/30 text-xs text-hotbee-500 font-bold">
                  🎉 Thank you! Your review has been submitted and added.
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4 max-w-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your Name *"
                      required
                      value={newReview.author}
                      onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                      className="glass-input rounded-xl px-4 py-2.5 text-xs"
                    />
                    <select
                      value={newReview.rating}
                      onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                      className="glass-input rounded-xl px-4 py-2.5 text-xs bg-hotbee-darker cursor-pointer"
                    >
                      <option value={5}>5 Stars (Excellent)</option>
                      <option value={4}>4 Stars (Good)</option>
                      <option value={3}>3 Stars (Average)</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Review Headline *"
                    required
                    value={newReview.title}
                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                    className="glass-input rounded-xl px-4 py-2.5 text-xs w-full"
                  />
                  <textarea
                    placeholder="Write your honest review about print quality, fit, and fabric..."
                    rows={3}
                    required
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="glass-input rounded-xl px-4 py-2.5 text-xs w-full"
                  />
                  <button
                    type="submit"
                    className="glass-btn-primary px-6 py-2.5 rounded-xl text-xs font-bold"
                  >
                    Submit Review
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-3xl relative border border-hotbee-500/30">
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-extrabold text-white mb-2 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-hotbee-500" /> HOTBEE Oversized Fit Size Guide
            </h3>
            <p className="text-xs text-gray-300 mb-4">All measurements in inches (Chest & Length).</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-300 border-collapse">
                <thead>
                  <tr className="border-b border-hotbee-500/20 text-hotbee-500 font-bold">
                    <th className="py-2">Size</th>
                    <th className="py-2">Chest (Inches)</th>
                    <th className="py-2">Length (Inches)</th>
                    <th className="py-2">Shoulder (Inches)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hotbee-500/10">
                  <tr><td className="py-2 font-bold text-white">S</td><td>40&quot;</td><td>27.5&quot;</td><td>20&quot;</td></tr>
                  <tr><td className="py-2 font-bold text-white">M</td><td>42&quot;</td><td>28.5&quot;</td><td>21&quot;</td></tr>
                  <tr><td className="py-2 font-bold text-white">L</td><td>44&quot;</td><td>29.5&quot;</td><td>22&quot;</td></tr>
                  <tr><td className="py-2 font-bold text-white">XL</td><td>46&quot;</td><td>30.5&quot;</td><td>23&quot;</td></tr>
                  <tr><td className="py-2 font-bold text-white">XXL</td><td>48&quot;</td><td>31.5&quot;</td><td>24&quot;</td></tr>
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setShowSizeGuide(false)}
              className="glass-btn-primary w-full py-2.5 rounded-xl text-xs font-bold mt-6"
            >
              Got It
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
