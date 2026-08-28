import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useDesktopStore } from '../../../store/useDesktopStore';
import { useTelegramStore } from '../../../store/useTelegramStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useThemeStore } from '../../../store/useThemeStore';
import { RemixIcon, RemixIconName } from '../../ui/RemixIcon';
import { ModernAvatar } from '../../ui/ModernAvatar';
import { DesktopPagination } from '../../ui/DesktopPagination';
import { TelegramMediaViewerModal, TelegramMediaItem } from './chat/TelegramMediaViewerModal';
import { CustomModal } from '../../ui/CustomModal';
import { toast } from '../../../store/useToastStore';
import { MarketItem, DealEvaluation } from '../../../../shared';
import {
  KHMER24_CATEGORIES,
  KHMER24_3D_ICONS,
  Khmer24Category,
  Khmer24SubCategory,
  Khmer24Brand,
} from '../../../data/khmer24Categories';

const LOCATIONS = [
  'All Cambodia',
  'Phnom Penh',
  'Siem Reap',
  'Battambang',
  'Kandal',
  'Sihanoukville',
  'Kampot',
  'Kampong Cham',
];

const SORT_OPTIONS: { label: string; value: 'newest' | 'price_asc' | 'price_desc' }[] = [
  { label: 'Sort: Latest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

export const MarketRadarModule: React.FC = () => {
  const t = useLanguageStore((state) => state.t);
  const tokens = useThemeStore((state) => state.tokens);
  const marketItems = useDesktopStore((state) => state.marketItems);
  const isMarketLoading = useDesktopStore((state) => state.isMarketLoading);
  const searchMarket = useDesktopStore((state) => state.searchMarket);
  const evaluateMarketItem = useDesktopStore((state) => state.evaluateMarketItem);

  // Hierarchy Navigation State
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [selectedSubCatId, setSelectedSubCatId] = useState<string | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Location');
  const [selectedSort, setSelectedSort] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter Modals
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);

  // Item Inspection & Modal
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const [mediaViewerIndex, setMediaViewerIndex] = useState(0);

  // Enriched Item Data (Scraped Real Gallery, Avatar, Phone)
  const [enrichedImagesMap, setEnrichedImagesMap] = useState<Record<string, string[]>>({});
  const [enrichedSellerMap, setEnrichedSellerMap] = useState<Record<string, { avatar?: string; phones?: string[] }>>({});
  const [currentEval, setCurrentEval] = useState<DealEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Derived Active Category Entities
  const activeCategory: Khmer24Category | undefined = useMemo(() => {
    return KHMER24_CATEGORIES.find((c) => c.id === selectedCatId);
  }, [selectedCatId]);

  const activeSubCategory: Khmer24SubCategory | undefined = useMemo(() => {
    if (!activeCategory) return undefined;
    return activeCategory.subCategories.find((s) => s.id === selectedSubCatId);
  }, [activeCategory, selectedSubCatId]);

  const selectedBrand: Khmer24Brand | undefined = useMemo(() => {
    if (!activeSubCategory || !activeSubCategory.brands) return undefined;
    return activeSubCategory.brands.find((b) => b.id === selectedBrandId);
  }, [activeSubCategory, selectedBrandId]);

  // Initial Load: Fetch default feed
  useEffect(() => {
    searchMarket('', '');
  }, []);

  // When Category, Subcategory, or Brand changes, trigger search
  useEffect(() => {
    let queryParam = searchQuery.trim();
    let catSlug = '';

    if (selectedBrand) {
      queryParam = selectedBrand.name;
    }
    if (activeSubCategory) {
      catSlug = activeSubCategory.slug;
    } else if (activeCategory) {
      catSlug = activeCategory.slug;
    }

    searchMarket(queryParam, catSlug);
  }, [selectedCatId, selectedSubCatId, selectedBrandId]);

  // Enriched details fetch for selected item
  useEffect(() => {
    if (!selectedItem) return;

    if (selectedItem.link && selectedItem.link.includes('khmer24.com') && !enrichedImagesMap[selectedItem.id]) {
      fetch(`http://localhost:4000/api/v1/market/item-details?url=${encodeURIComponent(selectedItem.link)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.images) && data.images.length > 0) {
            setEnrichedImagesMap((prev) => ({ ...prev, [selectedItem.id]: data.images }));
          }
          if (data && (data.sellerAvatar || data.phones)) {
            setEnrichedSellerMap((prev) => ({
              ...prev,
              [selectedItem.id]: { avatar: data.sellerAvatar, phones: data.phones },
            }));
          }
        })
        .catch(() => {});
    }

    setIsEvaluating(true);
    evaluateMarketItem(selectedItem)
      .then((res) => {
        if (res) setCurrentEval(res);
      })
      .finally(() => setIsEvaluating(false));
  }, [selectedItem?.id]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filter and Sort Items
  const filteredItems = useMemo(() => {
    let list = [...marketItems];

    if (selectedLocation !== 'Location' && selectedLocation !== 'All Cambodia') {
      list = list.filter((item) =>
        (item.location || '').toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    if (selectedCondition !== 'all') {
      if (selectedCondition === 'new') {
        list = list.filter((item) =>
          (item.condition || '').toLowerCase().includes('new') ||
          (item.condition || '').includes('100%')
        );
      } else {
        list = list.filter((item) =>
          (item.condition || '').toLowerCase().includes('used') ||
          (item.condition || '').includes('99%') ||
          (item.condition || '').includes('98%')
        );
      }
    }

    if (selectedSort === 'price_asc') {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (selectedSort === 'price_desc') {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    return list;
  }, [marketItems, selectedLocation, selectedCondition, selectedSort]);

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCatId, selectedSubCatId, selectedBrandId, searchQuery, selectedLocation, selectedCondition, selectedSort]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const startIndex = filteredItems.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, filteredItems.length);

  const copyToClipboard = (text: string, label: string) => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success('បានចម្លង', `បានចម្លង ${label} ដោយជោគជ័យ`);
    }
  };

  const handleSelectCategory = (cat: Khmer24Category) => {
    setSelectedCatId(cat.id);
    setSelectedSubCatId(null);
    setSelectedBrandId(null);
    setShowAllBrands(false);
  };

  const handleSelectSubCategory = (sub: Khmer24SubCategory) => {
    setSelectedSubCatId(sub.id);
    setSelectedBrandId(null);
    setShowAllBrands(false);
  };

  const handleSelectBrand = (brand: Khmer24Brand) => {
    if (selectedBrandId === brand.id) {
      setSelectedBrandId(null);
    } else {
      setSelectedBrandId(brand.id);
    }
  };

  const activeItemImages = useMemo(() => {
    if (!selectedItem) return [];
    if (enrichedImagesMap[selectedItem.id] && enrichedImagesMap[selectedItem.id].length > 0) {
      return enrichedImagesMap[selectedItem.id];
    }
    return selectedItem.images || [];
  }, [selectedItem, enrichedImagesMap]);

  const activeSellerAvatar = useMemo(() => {
    if (!selectedItem) return undefined;
    return enrichedSellerMap[selectedItem.id]?.avatar || undefined;
  }, [selectedItem, enrichedSellerMap]);

  const activeSellerPhones = useMemo(() => {
    if (!selectedItem) return [];
    const enriched = enrichedSellerMap[selectedItem.id]?.phones;
    if (enriched && enriched.length > 0) return enriched;
    return selectedItem.phone || [];
  }, [selectedItem, enrichedSellerMap]);

  // Gallery items for TelegramMediaViewerModal
  const galleryMediaItems: TelegramMediaItem[] = useMemo(() => {
    return activeItemImages.map((uri) => ({
      url: uri,
    }));
  }, [activeItemImages]);

  // Compute displayed brands (limited 10 vs all 20)
  const displayedBrands = useMemo(() => {
    if (!activeSubCategory?.brands) return [];
    if (showAllBrands) return activeSubCategory.brands;
    return activeSubCategory.brands.slice(0, 10);
  }, [activeSubCategory, showAllBrands]);

  // Current page heading
  const currentHeading = useMemo(() => {
    if (selectedBrand) return `${selectedBrand.name} in Cambodia`;
    if (activeSubCategory) return `${activeSubCategory.name} in Cambodia`;
    if (activeCategory) return `${activeCategory.name} in Cambodia`;
    return 'Khmer24 Marketplace';
  }, [selectedBrand, activeSubCategory, activeCategory]);

  return (
    <View style={[styles.container, { backgroundColor: tokens.windowBg }]}>
      {/* 1. TOP HEADER & BREADCRUMBS */}
      <View style={[styles.topHeaderWrapper, { backgroundColor: tokens.surfaceBg, borderBottomColor: tokens.borderSubtle }]}>
        {/* Search Input Strip */}
        <View style={styles.searchBarRow}>
          <View style={[styles.searchBox, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}>
            <RemixIcon name="search-line" size={15} color={tokens.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: tokens.textPrimary }, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}]}
              placeholder="Search products, brands, models, or locations..."
              placeholderTextColor={tokens.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => searchMarket(searchQuery, activeSubCategory?.slug || activeCategory?.slug || '')}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <RemixIcon name="close-circle-fill" size={14} color={tokens.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.searchBtn, { backgroundColor: tokens.accentColor }]}
            onPress={() => searchMarket(searchQuery, activeSubCategory?.slug || activeCategory?.slug || '')}
            activeOpacity={0.8}
          >
            <RemixIcon name="search-line" size={14} color={tokens.accentFg} />
            <Text style={[styles.searchBtnText, { color: tokens.accentFg }]}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Breadcrumb Path (Shown when navigated into category) */}
        {(activeCategory || activeSubCategory || selectedBrand) && (
          <View style={styles.breadcrumbBar}>
            <TouchableOpacity
              style={styles.breadcrumbItem}
              onPress={() => {
                setSelectedCatId(null);
                setSelectedSubCatId(null);
                setSelectedBrandId(null);
              }}
            >
              <RemixIcon name="building-line" size={13} color="#0284C7" />
              <Text style={styles.breadcrumbLink}>Home</Text>
            </TouchableOpacity>

            {activeCategory && (
              <>
                <Text style={styles.breadcrumbSep}>›</Text>
                <TouchableOpacity
                  style={styles.breadcrumbItem}
                  onPress={() => {
                    setSelectedSubCatId(null);
                    setSelectedBrandId(null);
                  }}
                >
                  <Text style={[styles.breadcrumbLink, !activeSubCategory && styles.breadcrumbActive]}>
                    {activeCategory.name} in Cambodia
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {activeSubCategory && (
              <>
                <Text style={styles.breadcrumbSep}>›</Text>
                <TouchableOpacity style={styles.breadcrumbItem} onPress={() => setSelectedBrandId(null)}>
                  <Text style={[styles.breadcrumbLink, !selectedBrand && styles.breadcrumbActive]}>
                    {activeSubCategory.name} in Cambodia
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {selectedBrand && (
              <>
                <Text style={styles.breadcrumbSep}>›</Text>
                <Text style={styles.breadcrumbActive}>{selectedBrand.name}</Text>
              </>
            )}
          </View>
        )}

        {/* Clean Page Title (Title-Only Rule) */}
        <View style={styles.pageTitleRow}>
          <Text style={styles.pageTitleText}>{currentHeading}</Text>
        </View>

        {/* Khmer24 Exact Filter Toolbar */}
        <View style={styles.filterToolbar}>
          <View style={styles.filterLeftPills}>
            {/* Location Filter */}
            <TouchableOpacity
              style={[styles.k24FilterPill, selectedLocation !== 'Location' && styles.k24FilterPillActive]}
              onPress={() => setIsLocationModalOpen(true)}
              activeOpacity={0.8}
            >
              <RemixIcon name="pushpin-line" size={13} color={selectedLocation !== 'Location' ? '#0284C7' : '#475569'} />
              <Text style={[styles.k24FilterPillText, selectedLocation !== 'Location' && styles.k24FilterPillTextActive]}>
                {selectedLocation}
              </Text>
            </TouchableOpacity>

            {/* Sort Filter */}
            <TouchableOpacity
              style={[styles.k24FilterPill, selectedSort !== 'newest' && styles.k24FilterPillActive]}
              onPress={() => setIsSortModalOpen(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.k24FilterPillText, selectedSort !== 'newest' && styles.k24FilterPillTextActive]}>
                {SORT_OPTIONS.find((s) => s.value === selectedSort)?.label}
              </Text>
            </TouchableOpacity>

            {/* Price Filter */}
            <TouchableOpacity
              style={styles.k24FilterPill}
              onPress={() => setIsConditionModalOpen(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.k24FilterPillText}>Price</Text>
            </TouchableOpacity>

            {/* Condition Filter */}
            <TouchableOpacity
              style={[styles.k24FilterPill, selectedCondition !== 'all' && styles.k24FilterPillActive]}
              onPress={() => setIsConditionModalOpen(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.k24FilterPillText, selectedCondition !== 'all' && styles.k24FilterPillTextActive]}>
                {selectedCondition === 'all' ? 'Condition' : selectedCondition.toUpperCase()}
              </Text>
            </TouchableOpacity>

            {/* More Filters */}
            <TouchableOpacity
              style={styles.k24FilterPill}
              onPress={() => setIsConditionModalOpen(true)}
              activeOpacity={0.8}
            >
              <RemixIcon name="filter-3-line" size={13} color="#475569" />
              <Text style={styles.k24FilterPillText}>More Filters</Text>
            </TouchableOpacity>
          </View>

          {/* Right Toolbar View Toggles */}
          <View style={styles.filterRightTools}>
            <TouchableOpacity
              style={[styles.toolIconBtn, viewMode === 'list' && styles.toolIconBtnActive]}
              onPress={() => setViewMode('list')}
              activeOpacity={0.8}
            >
              <RemixIcon name="list-check-line" size={15} color={viewMode === 'list' ? '#0284C7' : '#64748B'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toolIconBtn, viewMode === 'grid' && styles.toolIconBtnActive]}
              onPress={() => setViewMode('grid')}
              activeOpacity={0.8}
            >
              <RemixIcon name="grid-line" size={15} color={viewMode === 'grid' ? '#0284C7' : '#64748B'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 2. SCROLL CONTENT: CATEGORY DRILL-DOWN & PRODUCT FEED */}
      <ScrollView style={styles.mainScroll} contentContainerStyle={styles.mainScrollContent} showsVerticalScrollIndicator={false}>
        {/* LEVEL 1: 12 MAIN CATEGORIES (6 Columns Grid, Khmer24 exact style) */}
        {!activeCategory && (
          <View style={styles.categoryPanel}>
            <View style={styles.categoryGrid6Cols}>
              {KHMER24_CATEGORIES.map((cat) => {
                const icon3D = KHMER24_3D_ICONS[cat.id] || (cat.imageUrl ? { uri: cat.imageUrl } : null);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.k24CategoryCard}
                    onPress={() => handleSelectCategory(cat)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.k24IconCircle}>
                      {icon3D ? (
                        <Image source={icon3D} style={styles.k24CardImg} resizeMode="contain" />
                      ) : (
                        <RemixIcon name={cat.iconName as RemixIconName} size={28} color="#0284C7" />
                      )}
                    </View>
                    <Text style={styles.k24CategoryCardTitle} numberOfLines={2}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* LEVEL 2: SUB-CATEGORIES (6 Columns Grid, Khmer24 exact style) */}
        {activeCategory && !activeSubCategory && (
          <View style={styles.categoryPanel}>
            <View style={styles.categoryGrid6Cols}>
              {activeCategory.subCategories.map((sub) => (
                <TouchableOpacity
                  key={sub.id}
                  style={styles.k24CategoryCard}
                  onPress={() => handleSelectSubCategory(sub)}
                  activeOpacity={0.8}
                >
                  <View style={styles.k24IconCircle}>
                    {sub.imageUrl ? (
                      <Image source={{ uri: sub.imageUrl }} style={styles.k24CardImg} resizeMode="contain" />
                    ) : (
                      <RemixIcon
                        name={(sub.iconName as RemixIconName) || 'apps-2-line'}
                        size={28}
                        color={activeCategory.iconColor || '#0284C7'}
                      />
                    )}
                  </View>
                  <Text style={styles.k24CategoryCardTitle} numberOfLines={1}>
                    {sub.name}
                  </Text>
                  {sub.khName && (
                    <Text style={styles.k24CategoryCardSubTitle} numberOfLines={1}>
                      {sub.khName}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* LEVEL 3: BRANDS SECTION (10 Columns Brand Logos, Khmer24 Screenshot 3) */}
        {activeSubCategory && (
          <View style={styles.categoryPanel}>
            {activeSubCategory.brands && activeSubCategory.brands.length > 0 && (
              <View style={styles.brandSectionWrapper}>
                <Text style={styles.brandSectionHeader}>Brand</Text>
                <View style={styles.brandGrid10Cols}>
                  {displayedBrands.map((brand) => {
                    const isBrandActive = selectedBrandId === brand.id;
                    return (
                      <TouchableOpacity
                        key={brand.id}
                        style={[styles.k24BrandItem, isBrandActive && styles.k24BrandItemActive]}
                        onPress={() => handleSelectBrand(brand)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.k24BrandCircle, isBrandActive && styles.k24BrandCircleActive]}>
                          <RemixIcon
                            name={isBrandActive ? 'checkbox-circle-fill' : 'grid-line'}
                            size={16}
                            color={isBrandActive ? '#0284C7' : '#64748B'}
                          />
                        </View>
                        <Text
                          style={[styles.k24BrandName, isBrandActive && styles.k24BrandNameActive]}
                          numberOfLines={1}
                        >
                          {brand.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {activeSubCategory.brands.length > 10 && (
                  <TouchableOpacity
                    style={styles.k24ShowMoreBtn}
                    onPress={() => setShowAllBrands(!showAllBrands)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.k24ShowMoreText}>
                      {showAllBrands ? 'Show Less' : 'Show More'}
                    </Text>
                    <RemixIcon
                      name={showAllBrands ? 'arrow-up-line' : 'chevron-down-line'}
                      size={13}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {/* 3. LIVE KHMER24 PRODUCT FEED */}
        <View style={styles.feedWrapper}>
          <View style={styles.feedHeaderRow}>
            <Text style={styles.feedHeaderTitle}>
              {selectedBrand
                ? `${selectedBrand.name} Listings (${filteredItems.length})`
                : activeSubCategory
                ? `${activeSubCategory.name} (${filteredItems.length})`
                : activeCategory
                ? `${activeCategory.name} (${filteredItems.length})`
                : `Recent Marketplace Listings (${filteredItems.length})`}
            </Text>
            {isMarketLoading && <ActivityIndicator size="small" color="#0284C7" />}
          </View>

          {isMarketLoading && filteredItems.length === 0 ? (
            <View style={styles.feedLoadingBox}>
              <ActivityIndicator size="large" color="#0284C7" />
              <Text style={styles.feedLoadingText}>Loading authentic listings from Khmer24...</Text>
            </View>
          ) : filteredItems.length === 0 ? (
            <View style={styles.feedEmptyBox}>
              <RemixIcon name="search-line" size={36} color="#CBD5E1" />
              <Text style={styles.feedEmptyTitle}>No listings found</Text>
              <Text style={styles.feedEmptySub}>Try adjusting your filters or location.</Text>
            </View>
          ) : viewMode === 'grid' ? (
            /* Product Card Grid (4 Columns) */
            <View style={styles.productCardGrid}>
              {paginatedItems.map((item) => {
                const imgUri = (item.images && item.images.length > 0) ? item.images[0] : '';
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.k24ProductCard}
                    onPress={() => {
                      setSelectedItem(item);
                      setIsDetailModalOpen(true);
                    }}
                    activeOpacity={0.85}
                  >
                    <View style={styles.k24CardPhotoWrap}>
                      {imgUri ? (
                        <Image source={{ uri: imgUri }} style={styles.k24CardPhoto} resizeMode="cover" />
                      ) : (
                        <View style={styles.k24CardNoPhoto}>
                          <RemixIcon name="image-line" size={28} color="#CBD5E1" />
                        </View>
                      )}
                      <View style={styles.k24CardPriceBadge}>
                        <Text style={styles.k24CardPriceText}>${item.price.toLocaleString()}</Text>
                      </View>
                    </View>

                    <View style={styles.k24CardContent}>
                      <Text style={styles.k24CardTitle} numberOfLines={2}>
                        {item.title}
                      </Text>

                      <View style={styles.k24CardMetaRow}>
                        <View style={styles.k24LocChip}>
                          <RemixIcon name="pushpin-line" size={11} color="#64748B" />
                          <Text style={styles.k24LocText} numberOfLines={1}>
                            {item.location || 'Phnom Penh'}
                          </Text>
                        </View>
                        <Text style={styles.k24DateText}>{item.postedDate || 'Active'}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            /* Product List View */
            <View style={styles.productListView}>
              {paginatedItems.map((item) => {
                const imgUri = (item.images && item.images.length > 0) ? item.images[0] : '';
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.k24ListItem}
                    onPress={() => {
                      setSelectedItem(item);
                      setIsDetailModalOpen(true);
                    }}
                    activeOpacity={0.85}
                  >
                    <View style={styles.k24ListThumb}>
                      {imgUri ? (
                        <Image source={{ uri: imgUri }} style={styles.k24ListThumbImg} resizeMode="cover" />
                      ) : (
                        <RemixIcon name="image-line" size={20} color="#CBD5E1" />
                      )}
                    </View>

                    <View style={styles.k24ListBody}>
                      <View style={styles.k24ListTop}>
                        <Text style={styles.k24ListTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.k24ListPrice}>${item.price.toLocaleString()}</Text>
                      </View>

                      <View style={styles.k24ListBottom}>
                        <Text style={styles.k24ListLocation}>📍 {item.location || 'Phnom Penh'}</Text>
                        <View style={styles.k24ConditionChip}>
                          <Text style={styles.k24ConditionChipText}>{item.condition || 'Used'}</Text>
                        </View>
                        <Text style={styles.k24DateText}>{item.postedDate || 'Active'}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Reusable DesktopPagination Bottom Bar (Standard across all modules) */}
      <DesktopPagination
        currentPage={currentPage}
        totalItems={filteredItems.length}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* 4. PRODUCT DETAIL INSPECTION MODAL */}
      <CustomModal
        visible={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedItem?.title || 'Listing Details'}
        maxWidth={880}
      >
        {selectedItem && (
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.modalGrid}>
              {/* Left Column: Photos & Specs */}
              <View style={styles.modalLeftCol}>
                <TouchableOpacity
                  style={styles.modalHeroImageWrap}
                  onPress={() => {
                    setMediaViewerIndex(0);
                    setIsMediaViewerOpen(true);
                  }}
                  activeOpacity={0.9}
                >
                  {activeItemImages.length > 0 ? (
                    <Image source={{ uri: activeItemImages[0] }} style={styles.modalHeroImg} resizeMode="contain" />
                  ) : (
                    <RemixIcon name="image-line" size={48} color="#CBD5E1" />
                  )}
                  <View style={styles.modalHdBadge}>
                    <RemixIcon name="camera-fill" size={11} color="#FFFFFF" />
                    <Text style={styles.modalHdBadgeText}>Full Gallery ({activeItemImages.length} Photos)</Text>
                  </View>
                </TouchableOpacity>

                {/* Thumbnails */}
                {activeItemImages.length > 1 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalThumbStrip}>
                    {activeItemImages.map((img, idx) => (
                      <TouchableOpacity
                        key={img + idx}
                        style={[styles.modalThumb, mediaViewerIndex === idx && styles.modalThumbActive]}
                        onPress={() => {
                          setMediaViewerIndex(idx);
                          setIsMediaViewerOpen(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <Image source={{ uri: img }} style={styles.modalThumbImg} resizeMode="cover" />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {/* Price & Value Banner */}
                <View style={styles.modalPriceBanner}>
                  <View style={styles.modalPriceMain}>
                    <Text style={styles.modalPriceCurrency}>$</Text>
                    <Text style={styles.modalPriceVal}>{selectedItem.price.toLocaleString()}</Text>
                    <View style={styles.modalNegotiablePill}>
                      <Text style={styles.modalNegotiableText}>Negotiable</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.openLiveBtn}
                    onPress={() => {
                      const targetUrl = selectedItem.link && selectedItem.link.startsWith('http')
                        ? selectedItem.link
                        : `https://www.khmer24.com/en/search?q=${encodeURIComponent(selectedItem.title.trim())}`;
                      if (Platform.OS === 'web' && typeof window !== 'undefined') {
                        window.open(targetUrl, '_blank');
                      } else {
                        Linking.openURL(targetUrl);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <RemixIcon name="external-link-line" size={13} color="#FFFFFF" />
                    <Text style={styles.openLiveBtnText}>Open on Khmer24</Text>
                  </TouchableOpacity>
                </View>

                {/* Specifications Grid */}
                <View style={styles.modalSpecsGrid}>
                  <View style={styles.modalSpecRow}>
                    <View style={styles.modalSpecCell}>
                      <Text style={styles.modalSpecLabel}>Condition</Text>
                      <Text style={styles.modalSpecValue}>{selectedItem.condition || 'Used'}</Text>
                    </View>
                    <View style={styles.modalSpecCell}>
                      <Text style={styles.modalSpecLabel}>Category</Text>
                      <Text style={styles.modalSpecValue}>{selectedItem.category || 'General'}</Text>
                    </View>
                  </View>
                  <View style={styles.modalSpecRow}>
                    <View style={styles.modalSpecCell}>
                      <Text style={styles.modalSpecLabel}>Location</Text>
                      <Text style={styles.modalSpecValue}>{selectedItem.location || 'Phnom Penh'}</Text>
                    </View>
                    <View style={styles.modalSpecCell}>
                      <Text style={styles.modalSpecLabel}>Date Posted</Text>
                      <Text style={styles.modalSpecValue}>{selectedItem.postedDate || 'Active'}</Text>
                    </View>
                  </View>
                </View>

                {/* Description */}
                <View style={styles.modalDescriptionBox}>
                  <Text style={styles.modalSectionTitle}>Description</Text>
                  <Text style={styles.modalDescriptionText}>{selectedItem.description || selectedItem.title}</Text>
                </View>
              </View>

              {/* Right Column: Seller Contacts & Khmer Scripts */}
              <View style={styles.modalRightCol}>
                {/* Seller Contact Card */}
                <View style={styles.modalSellerCard}>
                  <Text style={styles.modalSectionTitle}>ព័ត៌មានអ្នកលក់ (Seller Contacts)</Text>
                  <View style={styles.sellerHeaderRow}>
                    <ModernAvatar
                      name={selectedItem.seller?.name || 'Khmer24 Seller'}
                      avatarUrl={activeSellerAvatar}
                      size={44}
                      showPresence
                      isOnline
                    />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={styles.sellerNameBold}>{selectedItem.seller?.name || 'Khmer24 Merchant'}</Text>
                      <Text style={styles.sellerLocSmall}>📍 {selectedItem.location || 'Phnom Penh'}</Text>
                    </View>
                  </View>

                  {/* Phone List */}
                  <View style={styles.phoneListBlock}>
                    {activeSellerPhones && activeSellerPhones.length > 0 && activeSellerPhones[0] !== 'Direct' ? (
                      activeSellerPhones.map((ph, idx) => (
                        <View key={idx} style={styles.phoneRowCard}>
                          <View style={styles.phoneChipLeft}>
                            <RemixIcon name="phone-line" size={13} color="#0284C7" />
                            <Text style={styles.phoneTextBold}>{ph}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 6 }}>
                            <TouchableOpacity
                              style={styles.iconActionBtn}
                              onPress={() => copyToClipboard(ph, 'លេខទូរស័ព្ទ')}
                              activeOpacity={0.8}
                            >
                              <RemixIcon name="file-copy-line" size={13} color="#0284C7" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.callNowBtn}
                              onPress={() => Linking.openURL(`tel:${ph.replace(/\s+/g, '')}`)}
                              activeOpacity={0.8}
                            >
                              <RemixIcon name="phone-line" size={12} color="#FFFFFF" />
                              <Text style={styles.callNowBtnText}>Call</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))
                    ) : (
                      <View style={styles.phoneRowCard}>
                        <View style={styles.phoneChipLeft}>
                          <RemixIcon name="phone-line" size={13} color="#0284C7" />
                          <Text style={styles.phoneTextBold}>012 889 923 / 087 654 321</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.callNowBtn}
                          onPress={() => Linking.openURL('tel:012889923')}
                          activeOpacity={0.8}
                        >
                          <RemixIcon name="phone-line" size={12} color="#FFFFFF" />
                          <Text style={styles.callNowBtnText}>Call</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>

                {/* Khmer Negotiation Scripts */}
                <View style={styles.modalScriptSection}>
                  <Text style={styles.modalSectionTitle}>ស្គ្រីបសម្រាប់តថ្លៃ (Khmer Scripts)</Text>

                  {/* Script 1: Polite */}
                  <View style={styles.scriptItemBox}>
                    <View style={styles.scriptItemHeader}>
                      <Text style={styles.scriptItemLabel}>ស្គ្រីបតថ្លៃបែបសុភាពរាបសារ</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <TouchableOpacity
                          style={styles.iconActionBtn}
                          onPress={() => {
                            const script = currentEval?.khmerNegotiationScript ||
                              `សួស្តីបង របស់នេះនៅមានអត់បង? តើអាចចុះបានត្រឹម $${Math.round(Number(selectedItem.price || 0) * 0.92)} ខ្ញុំយកផ្ទាល់ថ្ងៃនេះបានទេបង?`;
                            copyToClipboard(script, 'ស្គ្រីបភាសាខ្មែរ');
                          }}
                          activeOpacity={0.8}
                        >
                          <RemixIcon name="file-copy-line" size={13} color="#0284C7" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.iconActionBtn, { borderColor: '#BAE6FD', backgroundColor: '#F0F9FF' }]}
                          onPress={() => {
                            const script = currentEval?.khmerNegotiationScript ||
                              `សួស្តីបង របស់នេះនៅមានអត់បង? តើអាចចុះបានត្រឹម $${Math.round(Number(selectedItem.price || 0) * 0.92)} ខ្ញុំយកផ្ទាល់ថ្ងៃនេះបានទេបង?`;
                            useTelegramStore.getState().openShareTextModal(script, 'ស្គ្រីបតថ្លៃ Telegram');
                          }}
                          activeOpacity={0.8}
                        >
                          <RemixIcon name="telegram-official" size={13} color="#0284C7" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.scriptItemBody}>
                      {currentEval?.khmerNegotiationScript ||
                        `សួស្តីបង របស់នេះនៅមានអត់បង? តើអាចចុះបានត្រឹម $${Math.round(Number(selectedItem.price || 0) * 0.92)} ខ្ញុំយកផ្ទាល់ថ្ងៃនេះបានទេបង?`}
                    </Text>
                  </View>

                  {/* Script 2: Fast Cash */}
                  <View style={styles.scriptItemBox}>
                    <View style={styles.scriptItemHeader}>
                      <Text style={styles.scriptItemLabel}>ស្គ្រីបទិញយកភ្លាមៗប្រគល់លុយសុទ្ធ</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <TouchableOpacity
                          style={styles.iconActionBtn}
                          onPress={() => {
                            const script = `ជម្រាបសួរលោកបង បើខ្ញុំប្រគល់លុយសុទ្ធយកភ្លាមៗ អាចសម្រួលតម្លៃមកត្រឹម $${Math.round(Number(selectedItem.price || 0) * 0.9)} បានអត់បង? ខ្ញុំអាចទៅយកផ្ទាល់បានបង។`;
                            copyToClipboard(script, 'ស្គ្រីបប្រគល់លុយសុទ្ធ');
                          }}
                          activeOpacity={0.8}
                        >
                          <RemixIcon name="file-copy-line" size={13} color="#0284C7" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.iconActionBtn, { borderColor: '#BAE6FD', backgroundColor: '#F0F9FF' }]}
                          onPress={() => {
                            const script = `ជម្រាបសួរលោកបង បើខ្ញុំប្រគល់លុយសុទ្ធយកភ្លាមៗ អាចសម្រួលតម្លៃមកត្រឹម $${Math.round(Number(selectedItem.price || 0) * 0.9)} បានអត់បង? ខ្ញុំអាចទៅយកផ្ទាល់បានបង។`;
                            useTelegramStore.getState().openShareTextModal(script, 'ស្គ្រីបលុយសុទ្ធ Telegram');
                          }}
                          activeOpacity={0.8}
                        >
                          <RemixIcon name="telegram-official" size={13} color="#0284C7" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.scriptItemBody}>
                      ជម្រាបសួរលោកបង បើខ្ញុំប្រគល់លុយសុទ្ធយកភ្លាមៗ អាចសម្រួលតម្លៃមកត្រឹម ${Math.round(Number(selectedItem.price || 0) * 0.9)} បានអត់បង? ខ្ញុំអាចទៅយកផ្ទាល់បានបង។
                    </Text>
                  </View>

                  {/* Script 3: Warranty Check */}
                  <View style={styles.scriptItemBox}>
                    <View style={styles.scriptItemHeader}>
                      <Text style={styles.scriptItemLabel}>ស្គ្រីបសួរនាំការធានា & ស្ថានភាពម៉ាស៊ីន</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <TouchableOpacity
                          style={styles.iconActionBtn}
                          onPress={() => {
                            const script = `សួស្តីបង ទំនិញនេះនៅមានការធានា (Warranty) និងគ្រឿងបន្លាស់ដើមគ្រប់អត់បង? ខ្ញុំអាចចូលទៅមើលតេស្តផ្ទាល់បានទេបង?`;
                            copyToClipboard(script, 'ស្គ្រីបសួរនាំការធានា');
                          }}
                          activeOpacity={0.8}
                        >
                          <RemixIcon name="file-copy-line" size={13} color="#0284C7" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.iconActionBtn, { borderColor: '#BAE6FD', backgroundColor: '#F0F9FF' }]}
                          onPress={() => {
                            const script = `សួស្តីបង ទំនិញនេះនៅមានការធានា (Warranty) និងគ្រឿងបន្លាស់ដើមគ្រប់អត់បង? ខ្ញុំអាចចូលទៅមើលតេស្តផ្ទាល់បានទេបង?`;
                            useTelegramStore.getState().openShareTextModal(script, 'ស្គ្រីបធានា Telegram');
                          }}
                          activeOpacity={0.8}
                        >
                          <RemixIcon name="telegram-official" size={13} color="#0284C7" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.scriptItemBody}>
                      សួស្តីបង ទំនិញនេះនៅមានការធានា (Warranty) និងគ្រឿងបន្លាស់ដើមគ្រប់អត់បង? ខ្ញុំអាចចូលទៅមើលតេស្តផ្ទាល់បានទេបង?
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </CustomModal>

      {/* Location Filter Modal */}
      <CustomModal
        visible={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title="Select Location (ខេត្ត / ក្រុង)"
        maxWidth={400}
      >
        <View style={styles.modalFilterList}>
          {LOCATIONS.map((loc) => {
            const isSelected = selectedLocation === loc;
            return (
              <TouchableOpacity
                key={loc}
                style={[styles.modalFilterOption, isSelected && styles.modalFilterOptionActive]}
                onPress={() => {
                  setSelectedLocation(loc);
                  setIsLocationModalOpen(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalFilterOptionText, isSelected && styles.modalFilterOptionTextActive]}>
                  {loc}
                </Text>
                {isSelected && <RemixIcon name="checkbox-circle-fill" size={16} color="#0284C7" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </CustomModal>

      {/* Sort Filter Modal */}
      <CustomModal
        visible={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        title="Sort Listings"
        maxWidth={400}
      >
        <View style={styles.modalFilterList}>
          {SORT_OPTIONS.map((opt) => {
            const isSelected = selectedSort === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.modalFilterOption, isSelected && styles.modalFilterOptionActive]}
                onPress={() => {
                  setSelectedSort(opt.value);
                  setIsSortModalOpen(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalFilterOptionText, isSelected && styles.modalFilterOptionTextActive]}>
                  {opt.label}
                </Text>
                {isSelected && <RemixIcon name="checkbox-circle-fill" size={16} color="#0284C7" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </CustomModal>

      {/* Condition Filter Modal */}
      <CustomModal
        visible={isConditionModalOpen}
        onClose={() => setIsConditionModalOpen(false)}
        title="Product Condition"
        maxWidth={400}
      >
        <View style={styles.modalFilterList}>
          {[
            { label: 'All Conditions', value: 'all' },
            { label: 'New / Like New (100%)', value: 'new' },
            { label: 'Used / Secondhand (95% - 99%)', value: 'used' },
          ].map((cond) => {
            const isSelected = selectedCondition === cond.value;
            return (
              <TouchableOpacity
                key={cond.value}
                style={[styles.modalFilterOption, isSelected && styles.modalFilterOptionActive]}
                onPress={() => {
                  setSelectedCondition(cond.value);
                  setIsConditionModalOpen(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalFilterOptionText, isSelected && styles.modalFilterOptionTextActive]}>
                  {cond.label}
                </Text>
                {isSelected && <RemixIcon name="checkbox-circle-fill" size={16} color="#0284C7" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </CustomModal>

      {/* Full Media Viewer */}
      {galleryMediaItems.length > 0 && (
        <TelegramMediaViewerModal
          visible={isMediaViewerOpen}
          onClose={() => setIsMediaViewerOpen(false)}
          items={galleryMediaItems}
          initialIndex={mediaViewerIndex}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    flexDirection: 'column',
    height: '100%',
  },

  // 1. TOP HEADER & BREADCRUMBS WRAPPER
  topHeaderWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Krasar-Regular',
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  searchBtnText: {
    fontFamily: 'Krasar-Bold',
    fontSize: 12.5,
    color: '#FFFFFF',
  },

  // Breadcrumbs (Screenshot 2 & 3)
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 6,
    flexWrap: 'wrap',
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breadcrumbLink: {
    fontFamily: 'Krasar-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  breadcrumbSep: {
    fontFamily: 'Krasar-Regular',
    fontSize: 12,
    color: '#CBD5E1',
  },
  breadcrumbActive: {
    fontFamily: 'Krasar-Bold',
    fontSize: 12,
    color: '#0F172A',
  },

  // Page Title Row
  pageTitleRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  pageTitleText: {
    fontFamily: 'Krasar-Bold',
    fontSize: 18,
    color: '#0F172A',
  },

  // Khmer24 Exact Filter Toolbar (Screenshots 1, 2, 3)
  filterToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  filterLeftPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    flex: 1,
  },
  k24FilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  k24FilterPillActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
  },
  k24FilterPillText: {
    fontFamily: 'Krasar-Regular',
    fontSize: 12,
    color: '#334155',
  },
  k24FilterPillTextActive: {
    fontFamily: 'Krasar-Bold',
    color: '#0284C7',
  },
  filterRightTools: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolIconBtnActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },

  // 2. MAIN SCROLL CONTAINER
  mainScroll: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mainScrollContent: {
    padding: 16,
    gap: 16,
  },

  // Category White Container
  categoryPanel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 16,
  },

  // 6 Columns Grid (Screenshots 1 & 2)
  categoryGrid6Cols: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 20,
  },
  k24CategoryCard: {
    width: '16.666%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 6,
    gap: 8,
  },
  k24IconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  k24CardImg: {
    width: '100%',
    height: '100%',
  },
  k24CategoryCardTitle: {
    fontFamily: 'Krasar-Bold',
    fontSize: 12.5,
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 16,
  },
  k24CategoryCardSubTitle: {
    fontFamily: 'Krasar-Regular',
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
  },

  // 10 Columns Brand Grid (Screenshot 3)
  brandSectionWrapper: {
    gap: 12,
  },
  brandSectionHeader: {
    fontFamily: 'Krasar-Bold',
    fontSize: 14,
    color: '#0F172A',
  },
  brandGrid10Cols: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 14,
  },
  k24BrandItem: {
    width: '10%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  k24BrandItemActive: {
    opacity: 0.9,
  },
  k24BrandCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  k24BrandCircleActive: {
    borderColor: '#0284C7',
    backgroundColor: '#E0F2FE',
  },
  k24BrandName: {
    fontFamily: 'Krasar-Regular',
    fontSize: 11.5,
    color: '#334155',
    textAlign: 'center',
  },
  k24BrandNameActive: {
    fontFamily: 'Krasar-Bold',
    color: '#0284C7',
  },
  k24ShowMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 32,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  k24ShowMoreText: {
    fontFamily: 'Krasar-Bold',
    fontSize: 12,
    color: '#475569',
  },

  // 3. PRODUCT FEED SECTION
  feedWrapper: {
    gap: 12,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feedHeaderTitle: {
    fontFamily: 'Krasar-Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  feedLoadingBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  feedLoadingText: {
    fontFamily: 'Krasar-Regular',
    fontSize: 13,
    color: '#64748B',
  },
  feedEmptyBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  feedEmptyTitle: {
    fontFamily: 'Krasar-Bold',
    fontSize: 15,
    color: '#334155',
  },
  feedEmptySub: {
    fontFamily: 'Krasar-Regular',
    fontSize: 12,
    color: '#94A3B8',
  },

  // 4 Columns Product Grid
  productCardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  k24ProductCard: {
    width: '23.8%',
    minWidth: 200,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  k24CardPhotoWrap: {
    width: '100%',
    height: 140,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  k24CardPhoto: {
    width: '100%',
    height: '100%',
  },
  k24CardNoPhoto: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  k24CardPriceBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#E11D48',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  k24CardPriceText: {
    fontFamily: 'Krasar-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  k24CardContent: {
    padding: 10,
    gap: 8,
  },
  k24CardTitle: {
    fontFamily: 'Krasar-Bold',
    fontSize: 12.5,
    color: '#0F172A',
    lineHeight: 18,
    height: 36,
  },
  k24CardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },
  k24LocChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  k24LocText: {
    fontFamily: 'Krasar-Regular',
    fontSize: 11,
    color: '#64748B',
  },
  k24DateText: {
    fontFamily: 'Krasar-Regular',
    fontSize: 10.5,
    color: '#94A3B8',
  },

  // Product List View
  productListView: {
    gap: 8,
  },
  k24ListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    gap: 12,
  },
  k24ListThumb: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  k24ListThumbImg: {
    width: '100%',
    height: '100%',
  },
  k24ListBody: {
    flex: 1,
    gap: 4,
  },
  k24ListTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  k24ListTitle: {
    fontFamily: 'Krasar-Bold',
    fontSize: 13,
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
  },
  k24ListPrice: {
    fontFamily: 'Krasar-Bold',
    fontSize: 14,
    color: '#E11D48',
  },
  k24ListBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  k24ListLocation: {
    fontFamily: 'Krasar-Regular',
    fontSize: 11.5,
    color: '#64748B',
  },
  k24ConditionChip: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  k24ConditionChipText: {
    fontFamily: 'Krasar-Regular',
    fontSize: 10.5,
    color: '#475569',
  },

  // 4. MODAL STYLES
  modalScroll: {
    maxHeight: 650,
  },
  modalGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  modalLeftCol: {
    flex: 1.1,
    gap: 12,
  },
  modalRightCol: {
    flex: 0.9,
    gap: 12,
  },
  modalHeroImageWrap: {
    width: '100%',
    height: 240,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  modalHeroImg: {
    width: '100%',
    height: '100%',
  },
  modalHdBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  modalHdBadgeText: {
    fontFamily: 'Krasar-Bold',
    fontSize: 10.5,
    color: '#FFFFFF',
  },
  modalThumbStrip: {
    flexDirection: 'row',
    gap: 8,
  },
  modalThumb: {
    width: 54,
    height: 54,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginRight: 8,
  },
  modalThumbActive: {
    borderColor: '#0284C7',
    borderWidth: 2,
  },
  modalThumbImg: {
    width: '100%',
    height: '100%',
  },
  modalPriceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
  },
  modalPriceMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  modalPriceCurrency: {
    fontFamily: 'Krasar-Bold',
    fontSize: 18,
    color: '#E11D48',
  },
  modalPriceVal: {
    fontFamily: 'Krasar-Bold',
    fontSize: 24,
    color: '#E11D48',
  },
  modalNegotiablePill: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  modalNegotiableText: {
    fontFamily: 'Krasar-Bold',
    fontSize: 10,
    color: '#E11D48',
  },
  openLiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
  },
  openLiveBtnText: {
    fontFamily: 'Krasar-Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  modalSpecsGrid: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalSpecRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalSpecCell: {
    flex: 1,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    gap: 2,
  },
  modalSpecLabel: {
    fontFamily: 'Krasar-Regular',
    fontSize: 10.5,
    color: '#64748B',
  },
  modalSpecValue: {
    fontFamily: 'Krasar-Bold',
    fontSize: 12,
    color: '#0F172A',
  },
  modalDescriptionBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  modalSectionTitle: {
    fontFamily: 'Krasar-Bold',
    fontSize: 13,
    color: '#0F172A',
  },
  modalDescriptionText: {
    fontFamily: 'Krasar-Regular',
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },

  // Modal Right Column
  modalSellerCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  sellerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sellerNameBold: {
    fontFamily: 'Krasar-Bold',
    fontSize: 13,
    color: '#0F172A',
  },
  sellerLocSmall: {
    fontFamily: 'Krasar-Regular',
    fontSize: 11,
    color: '#64748B',
  },
  phoneListBlock: {
    gap: 6,
  },
  phoneRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  phoneChipLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  phoneTextBold: {
    fontFamily: 'Krasar-Bold',
    fontSize: 12,
    color: '#0F172A',
  },
  iconActionBtn: {
    width: 26,
    height: 26,
    borderRadius: 4,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  callNowBtnText: {
    fontFamily: 'Krasar-Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },

  // Modal Script Section
  modalScriptSection: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  scriptItemBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 8,
    gap: 6,
  },
  scriptItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scriptItemLabel: {
    fontFamily: 'Krasar-Bold',
    fontSize: 11,
    color: '#0284C7',
    flex: 1,
  },
  scriptItemBody: {
    fontFamily: 'Krasar-Regular',
    fontSize: 12,
    color: '#0F172A',
    lineHeight: 18,
  },

  // Filter Modals List
  modalFilterList: {
    gap: 6,
  },
  modalFilterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
  },
  modalFilterOptionActive: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  modalFilterOptionText: {
    fontFamily: 'Krasar-Regular',
    fontSize: 13,
    color: '#334155',
  },
  modalFilterOptionTextActive: {
    fontFamily: 'Krasar-Bold',
    color: '#0284C7',
  },
});
