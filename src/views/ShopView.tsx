import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { ProductCategory } from '../types';
import { Filter, SlidersHorizontal, RotateCcw, Search, ChevronRight, Camera } from 'lucide-react';

interface ShopViewProps {
  initialCategory?: ProductCategory | null;
}

export const ShopView: React.FC<ShopViewProps> = ({ initialCategory }) => {
  const {
    products,
    categories,
    activeCategoryFilter,
    activeSubcategoryFilter,
    searchQuery,
    setSearchQuery,
    navigateTo,
    openVisualSearch,
  } = useApp();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || activeCategoryFilter || 'all'
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(
    activeSubcategoryFilter || 'all'
  );
  const [selectedFabric, setSelectedFabric] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(35000);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Available subcategories based on selected category
  const availableSubcategories = useMemo(() => {
    if (selectedCategory === 'all') {
      const allSubs = new Set<string>();
      categories.forEach((cat) => cat.subcategories.forEach((sub) => allSubs.add(sub)));
      return Array.from(allSubs);
    }
    const found = categories.find((c) => c.id === selectedCategory);
    return found ? found.subcategories : [];
  }, [selectedCategory, categories]);

  // Synchronize initialCategory prop changes
  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
      setSelectedSubcategory('all');
      setSelectedFabric('all');
    }
  }, [initialCategory]);

  // Synchronize activeCategoryFilter and activeSubcategoryFilter from context
  React.useEffect(() => {
    if (activeCategoryFilter) {
      setSelectedCategory(activeCategoryFilter);
    }
    if (activeSubcategoryFilter) {
      setSelectedSubcategory(activeSubcategoryFilter);
    }
  }, [activeCategoryFilter, activeSubcategoryFilter]);

  // When selectedCategory changes, automatically reset subcategory if it is not valid for this category
  React.useEffect(() => {
    if (selectedCategory !== 'all') {
      const found = categories.find((c) => c.id === selectedCategory);
      if (found && selectedSubcategory !== 'all' && !found.subcategories.includes(selectedSubcategory)) {
        setSelectedSubcategory('all');
      }
    }
  }, [selectedCategory, categories, selectedSubcategory]);

  // Reset filters
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedFabric('all');
    setSelectedGender('all');
    setMaxPrice(35000);
    setMinRating(0);
    setOnlyInStock(false);
    setSearchQuery('');
    setSortBy('featured');
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category filter
        if (selectedCategory !== 'all' && product.category !== selectedCategory) {
          return false;
        }
        // Subcategory filter
        if (selectedSubcategory !== 'all' && product.subcategory !== selectedSubcategory) {
          return false;
        }
        // Fabric Type filter
        if (selectedFabric !== 'all') {
          const sf = selectedFabric.toLowerCase();
          const matchFabric =
            product.fabricType?.toLowerCase().includes(sf) ||
            product.material.toLowerCase().includes(sf) ||
            product.subcategory.toLowerCase().includes(sf) ||
            product.name.toLowerCase().includes(sf);
          if (!matchFabric) return false;
        }
        // Gender filter
        if (
          selectedGender !== 'all' &&
          product.gender !== selectedGender &&
          product.gender !== 'unisex'
        ) {
          return false;
        }
        // Price filter
        if (product.price > maxPrice) {
          return false;
        }
        // Rating filter
        if (minRating > 0 && product.rating < minRating) {
          return false;
        }
        // In-stock
        if (onlyInStock && product.stock <= 0) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = product.name.toLowerCase().includes(q);
          const matchSub = product.subcategory.toLowerCase().includes(q);
          const matchMaterial = product.material.toLowerCase().includes(q);
          const matchDesc = product.description.toLowerCase().includes(q);
          if (!matchName && !matchSub && !matchMaterial && !matchDesc) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest')
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        // default: featured or popularity
        return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
      });
  }, [
    products,
    selectedCategory,
    selectedSubcategory,
    selectedFabric,
    selectedGender,
    maxPrice,
    minRating,
    onlyInStock,
    searchQuery,
    sortBy,
  ]);

  // Fallback products when an over-constrained filter combination has no exact matches
  const fallbackProducts = useMemo(() => {
    if (selectedCategory !== 'all') {
      const inCat = products.filter((p) => p.category === selectedCategory);
      if (inCat.length > 0) return inCat;
    }
    return products.slice(0, 9);
  }, [products, selectedCategory]);

  const hasExactMatches = filteredProducts.length > 0;
  const productsToRender = hasExactMatches ? filteredProducts : fallbackProducts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 text-xs text-[#718096] mb-6">
        <button
          onClick={() => navigateTo('home')}
          className="hover:text-[#0C2B4E] cursor-pointer"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#0C2B4E] font-medium">Collections</span>
        {selectedCategory !== 'all' && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#0C2B4E] font-semibold capitalize">
              {categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}
            </span>
          </>
        )}
      </div>

      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D9] mb-8">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#0C2B4E]">
            {selectedCategory === 'all'
              ? 'All Sacred Collections'
              : categories.find((c) => c.id === selectedCategory)?.name || 'Collections'}
          </h1>
          <p className="text-xs text-[#718096] mt-1">
            Displaying <span className="font-semibold text-[#0C2B4E] font-mono">{filteredProducts.length}</span> handcrafted artisan masterpieces
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Visual Search Button */}
          <button
            onClick={() => openVisualSearch()}
            className="px-3.5 py-2 text-xs font-semibold text-[#0C2B4E] bg-[#FAF5E8] hover:bg-[#F3EFE9] border border-[#D4AF37] rounded-md flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Upload photo to search"
          >
            <Camera className="w-3.5 h-3.5 text-[#0C2B4E]" />
            <span>Shop by Photo</span>
          </button>

          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden px-3 py-2 text-xs font-medium text-[#0C2B4E] bg-white border border-[#D9D0C3] rounded-md flex items-center gap-2"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#718096] whitespace-nowrap hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-white border border-[#D9D0C3] rounded-md px-3 py-2 text-[#0C2B4E] focus:outline-hidden focus:border-[#0C2B4E] font-medium"
            >
              <option value="featured">Featured & Curated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters Desktop (and mobile slideout) */}
        <aside
          className={`lg:block ${
            isMobileFilterOpen
              ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto block'
              : 'hidden'
          }`}
        >
          {isMobileFilterOpen && (
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E8E2D9]">
              <h3 className="font-heading text-lg font-bold text-[#0C2B4E]">Filter Creations</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-xs font-semibold text-rose-600"
              >
                Done
              </button>
            </div>
          )}

          <div className="space-y-6 text-xs text-[#2D3748]">
            {/* Reset Button */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9]">
              <span className="font-heading font-semibold text-sm text-[#0C2B4E]">Filters</span>
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-[#8C7A58] hover:text-[#0C2B4E] flex items-center gap-1 font-medium cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            </div>

            {/* Collection Category */}
            <div>
              <label className="font-semibold text-xs text-[#0C2B4E] block mb-2 uppercase tracking-wider">
                Category
              </label>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubcategory('all');
                  }}
                  className={`w-full text-left py-1.5 px-2 rounded-md transition-colors cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-[#0C2B4E] text-[#D4AF37] font-semibold'
                      : 'hover:bg-[#EFEAE2] text-[#4A5568]'
                  }`}
                >
                  All Collections
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedSubcategory('all');
                    }}
                    className={`w-full text-left py-1.5 px-2 rounded-md transition-colors cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#0C2B4E] text-[#D4AF37] font-semibold'
                        : 'hover:bg-[#EFEAE2] text-[#4A5568]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategory */}
            {availableSubcategories.length > 0 && (
              <div className="pt-3 border-t border-[#E8E2D9]">
                <label className="font-semibold text-xs text-[#0C2B4E] block mb-2 uppercase tracking-wider">
                  Subcategory
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedSubcategory('all')}
                    className={`w-full text-left py-1 px-2 rounded text-[11px] ${
                      selectedSubcategory === 'all'
                        ? 'font-semibold text-[#0C2B4E] bg-[#EFEAE2]'
                        : 'text-[#718096] hover:text-[#0C2B4E]'
                    }`}
                  >
                    All Subcategories
                  </button>
                  {availableSubcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubcategory(sub)}
                      className={`w-full text-left py-1 px-2 rounded text-[11px] ${
                        selectedSubcategory === sub
                          ? 'font-semibold text-[#0C2B4E] bg-[#EFEAE2]'
                          : 'text-[#718096] hover:text-[#0C2B4E]'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fabric Type Filter */}
            <div className="pt-3 border-t border-[#E8E2D9]">
              <label className="font-semibold text-xs text-[#0C2B4E] block mb-2 uppercase tracking-wider">
                Weave & Fabric Type
              </label>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'All Fabrics' },
                  { id: 'kora', label: 'Banarasi Kora Silk (Organza)' },
                  { id: 'tissue', label: 'Metallic Gold Tissue Silk' },
                  { id: 'chanderi', label: 'Pure Chanderi Silk' },
                  { id: 'kanchipuram', label: 'Kanchipuram Silk' },
                  { id: 'katan', label: 'Banarasi Katan Silk' },
                  { id: 'tussar', label: 'Tussar Wild Silk' },
                  { id: 'raw silk', label: 'Handwoven Raw Silk' },
                ].map((fab) => (
                  <button
                    key={fab.id}
                    onClick={() => setSelectedFabric(fab.id)}
                    className={`w-full text-left py-1 px-2 rounded text-[11px] transition-colors cursor-pointer ${
                      selectedFabric === fab.id
                        ? 'font-semibold text-[#0C2B4E] bg-[#EFEAE2]'
                        : 'text-[#718096] hover:text-[#0C2B4E]'
                    }`}
                  >
                    {fab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="pt-3 border-t border-[#E8E2D9]">
              <div className="flex justify-between items-center mb-2">
                <label className="font-semibold text-xs text-[#0C2B4E] uppercase tracking-wider">
                  Max Price
                </label>
                <span className="font-mono font-bold text-[#0C2B4E]">
                  ₹{maxPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="35000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#0C2B4E] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#A0AEC0] mt-1 font-mono">
                <span>₹1,000</span>
                <span>₹35,000+</span>
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="pt-3 border-t border-[#E8E2D9]">
              <label className="font-semibold text-xs text-[#0C2B4E] block mb-2 uppercase tracking-wider">
                Minimum Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[0, 4, 4.5, 4.8].map((rat) => (
                  <button
                    key={rat}
                    onClick={() => setMinRating(rat)}
                    className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer ${
                      minRating === rat
                        ? 'bg-[#0C2B4E] text-[#D4AF37] border-[#0C2B4E] font-semibold'
                        : 'bg-white text-[#718096] border-[#D9D0C3] hover:text-[#0C2B4E]'
                    }`}
                  >
                    {rat === 0 ? 'All' : `${rat}★+`}
                  </button>
                ))}
              </div>
            </div>

            {/* In-Stock Only */}
            <div className="pt-3 border-t border-[#E8E2D9]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-[#0C2B4E] focus:ring-[#0C2B4E]"
                />
                <span className="text-xs text-[#4A5568]">Show in-stock creations only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Products Grid (3 Columns on desktop) */}
        <main className="lg:col-span-3">
          {/* Quick Category & Fabric Explorer Chips */}
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 text-xs">
            <span className="text-[#8C7A58] font-semibold text-[11px] shrink-0">Explore:</span>
            {[
              { label: 'All Items', cat: 'all', sub: 'all', fab: 'all' },
              { label: 'Kanchipuram Silk', cat: 'women', sub: 'Kanchipuram Sarees', fab: 'kanchipuram' },
              { label: 'Banarasi Sarees', cat: 'women', sub: 'Banarasi Sarees', fab: 'banarasi' },
              { label: 'Metallic Tissue', cat: 'women', sub: 'Tissue Sarees', fab: 'tissue' },
              { label: 'Kora Organza', cat: 'women', sub: 'Kora Silk Sarees', fab: 'kora' },
              { label: 'Chanderi Sarees', cat: 'women', sub: 'Chanderi Sarees', fab: 'chanderi' },
              { label: 'Royal Sherwanis', cat: 'men', sub: 'Royal Sherwanis', fab: 'all' },
              { label: 'Silk Mojaris & Juttis', cat: 'men', sub: 'Handcrafted Silk Mojaris', fab: 'all' },
              { label: 'Temple Jewelry Sets', cat: 'jewelry', sub: 'Temple Necklaces & Chokers', fab: 'all' },
              { label: 'Bridal Chuda & Kadas', cat: 'jewelry', sub: 'Bridal Chuda & Meenakari Bangles', fab: 'all' },
              { label: 'Silver Ghungroo Payal', cat: 'jewelry', sub: 'Silver Ghungroo Payal & Anklets', fab: 'all' },
              { label: 'Radha-Krishna Pendants', cat: 'spiritual', sub: 'Radha-Krishna Pendants', fab: 'all' },
              { label: 'Vrindavan Pooja Sets', cat: 'spiritual', sub: 'Vrindavan Sandalwood & Pooja Sets', fab: 'all' },
            ].map((chip) => {
              const isSelected =
                (chip.fab !== 'all' && selectedFabric === chip.fab) ||
                (chip.sub !== 'all' && selectedSubcategory === chip.sub);
              return (
                <button
                  key={chip.label}
                  onClick={() => {
                    setSelectedCategory(chip.cat);
                    setSelectedSubcategory(chip.sub);
                    setSelectedFabric(chip.fab);
                  }}
                  className={`px-3 py-1.5 rounded-md whitespace-nowrap text-xs font-medium border transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#0C2B4E] text-[#D4AF37] border-[#0C2B4E] font-semibold shadow-xs'
                      : 'bg-white text-[#4A5568] border-[#D9D0C3] hover:border-[#0C2B4E] hover:text-[#0C2B4E]'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Graceful Notice if Filter Had No Exact Matches */}
          {!hasExactMatches && (
            <div className="mb-6 p-4 bg-[#FAF5E8] border border-[#D4AF37]/50 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-[#D4AF37] text-base">✦</span>
                <p className="text-xs text-[#0C2B4E] font-medium leading-relaxed">
                  Showing all {productsToRender.length} authentic creations available in this collection (no items matched that specific narrow filter):
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0C2B4E] hover:bg-[#07172C] rounded-md transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsToRender.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};
