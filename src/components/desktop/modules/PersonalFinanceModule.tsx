import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useDesktopStore } from '../../../store/useDesktopStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { RemixIcon } from '../../ui/RemixIcon';
import { DesktopPagination } from '../../ui/DesktopPagination';
import { CustomTextInput } from '../../ui/CustomTextInput';
import { CustomModal } from '../../ui/CustomModal';
import { ImportStatementModal } from '../ImportStatementModal';
import { FinanceCalendarPickerModal } from '../FinanceCalendarPickerModal';
import { PersonalFinanceRecord } from '../../../../shared';

// Helper to clean and parse bank statement notes into Title & Sub-metadata
const parseTransactionNote = (rawNote: string) => {
  if (!rawNote) return { title: 'Transaction', sub: '', ref: '' };

  if (rawNote.includes('|')) {
    const parts = rawNote.split('|').map((p) => p.trim());
    let title = parts[0];
    title = title.replace(/\(TID[^\)]*\)/g, '').trim();

    const metaParts: string[] = [];
    let ref = '';

    parts.slice(1).forEach((p) => {
      if (p.startsWith('Ref.')) {
        ref = p.replace('Ref.', 'Ref: ');
      } else if (p.includes('AM') || p.includes('PM')) {
        const timeMatch = p.match(/\d{1,2}:\d{2}\s*(?:AM|PM)/i);
        if (timeMatch) metaParts.push(timeMatch[0]);
      } else if (!p.startsWith('USD') && !p.startsWith('KHR')) {
        metaParts.push(p);
      }
    });

    if (ref) metaParts.push(ref);

    return {
      title,
      sub: metaParts.join(' • '),
      ref,
    };
  }

  return {
    title: rawNote,
    sub: 'Manual Entry',
    ref: '',
  };
};

const getCategoryStyle = (cat: string) => {
  switch (cat) {
    case 'Food & Groceries':
      return { bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B' };
    case 'Transfer & Payments':
      return { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' };
    case 'Transportation':
      return { bg: '#F3E8FF', text: '#6D28D9', dot: '#8B5CF6' };
    case 'Income':
      return { bg: '#ECFDF5', text: '#047857', dot: '#10B981' };
    case 'Utilities & Bills':
      return { bg: '#FFE4E6', text: '#BE123C', dot: '#F43F5E' };
    case 'Healthcare':
      return { bg: '#E0F2FE', text: '#0369A1', dot: '#0EA5E9' };
    default:
      return { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8' };
  }
};

export const PersonalFinanceModule: React.FC = () => {
  const language = useLanguageStore((state) => state.language);
  const t = useLanguageStore((state) => state.t);
  const finances = useDesktopStore((state) => state.finances);
  const logExpenseWithAi = useDesktopStore((state) => state.logExpenseWithAi);
  const deleteFinanceRecord = useDesktopStore((state) => state.deleteFinanceRecord);

  const [aiInput, setAiInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCalendarFilterModal, setShowCalendarFilterModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<PersonalFinanceRecord | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);

const KHMER_MONTH_INDEX_MAP: Record<string, number> = {
  'មករា': 0, 'កុម្ភៈ': 1, 'មីនា': 2, 'មេសា': 3, 'ឧសភា': 4, 'មិថុនា': 5,
  'កក្កដា': 6, 'សីហា': 7, 'កញ្ញា': 8, 'តុលា': 9, 'វិច្ឆិកា': 10, 'ធ្នូ': 11,
};

const parseFinanceTimestamp = (dateStr: string): number => {
  if (!dateStr) return 0;
  if (dateStr.includes('-')) {
    return new Date(dateStr).getTime() || 0;
  }
  const parts = dateStr.trim().split(' ');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = KHMER_MONTH_INDEX_MAP[parts[1]] ?? 0;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day).getTime() || 0;
  }
  return 0;
};

const getCategoryLabel = (cat: string, lang: string) => {
  if (lang !== 'kh') return cat;
  switch (cat) {
    case 'Transfer & Payments':
      return 'ផ្ទេរប្រាក់ & ទូទាត់';
    case 'Transportation':
      return 'ការធ្វើដំណើរ';
    case 'Food & Groceries':
      return 'អាហារ & ភេសជ្ជៈ';
    case 'Income':
      return 'ចំណូល';
    case 'General':
      return 'ទូទៅ';
    case 'Utilities':
      return 'ទឹកភ្លើង & សេវា';
    case 'Entertainment':
      return 'កម្សាន្ត';
    case 'Health':
      return 'សុខភាព & ថ្នាំ';
    default:
      return cat;
  }
};

// Extract distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    finances.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set);
  }, [finances]);

  // Filtered dataset (Sorted Newest to Oldest)
  const filteredFinances = useMemo(() => {
    return finances
      .filter((f) => {
        if (selectedCategory !== 'all') {
          if (f.category !== selectedCategory) return false;
        } else if (filterType !== 'all' && f.type !== filterType) {
          return false;
        }
        if (selectedPeriod !== 'all' && !f.date.includes(selectedPeriod)) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchNote = f.note?.toLowerCase().includes(q);
          const matchCat = f.category?.toLowerCase().includes(q);
          const matchDate = f.date?.toLowerCase().includes(q);
          const matchAmt = f.amount.toString().includes(q);
          if (!matchNote && !matchCat && !matchDate && !matchAmt) return false;
        }
        return true;
      })
      .sort((a, b) => parseFinanceTimestamp(b.date) - parseFinanceTimestamp(a.date));
  }, [finances, filterType, selectedCategory, selectedPeriod, searchQuery]);

  // Live KPI Calculations based on filtered period
  const totalIncome = useMemo(
    () =>
      filteredFinances
        .filter((f) => f.type === 'income')
        .reduce((sum, f) => sum + f.amount, 0),
    [filteredFinances]
  );

  const totalExpense = useMemo(
    () =>
      filteredFinances
        .filter((f) => f.type === 'expense')
        .reduce((sum, f) => sum + f.amount, 0),
    [filteredFinances]
  );

  const netSavings = totalIncome - totalExpense;

  const maxPage = Math.max(1, Math.ceil(filteredFinances.length / pageSize));
  const activePage = Math.min(page, maxPage);
  const paginatedFinances = useMemo(() => {
    return filteredFinances.slice((activePage - 1) * pageSize, activePage * pageSize);
  }, [filteredFinances, activePage, pageSize]);

  const handleAiLog = async () => {
    if (!aiInput.trim() || isProcessing) return;
    const text = aiInput.trim();
    setAiInput('');
    setIsProcessing(true);
    await logExpenseWithAi(text);
    setIsProcessing(false);
  };

  return (
    <View style={styles.container}>
      {/* Top Header Rail (44px) - Fixed */}
      <View style={styles.topRail}>
        <View style={styles.headerLeft}>
          <Text style={styles.moduleTitle}>{t.finTitle}</Text>
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>
              {filteredFinances.length.toLocaleString()} {language === 'kh' ? 'ប្រតិបត្តិការ' : 'Records'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Interactive Date & Calendar Filter Trigger */}
          <TouchableOpacity
            style={[
              styles.calendarLinkBtn,
              selectedPeriod !== 'all' && styles.calendarLinkBtnActive,
            ]}
            onPress={() => setShowCalendarFilterModal(true)}
            activeOpacity={0.7}
          >
            <RemixIcon
              name="calendar-line"
              size={13}
              color={selectedPeriod !== 'all' ? '#2563EB' : '#0F172A'}
            />
            <Text
              style={[
                styles.calendarLinkBtnText,
                selectedPeriod !== 'all' && styles.calendarLinkBtnTextActive,
              ]}
            >
              {selectedPeriod === 'all'
                ? language === 'kh'
                  ? 'ជ្រើសរើសថ្ងៃ / ប្រតិទិន'
                  : 'Filter by Date'
                : selectedPeriod}
            </Text>
            {selectedPeriod !== 'all' && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setSelectedPeriod('all');
                  setPage(1);
                }}
                hitSlop={6}
              >
                <RemixIcon name="close-line" size={11} color="#2563EB" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* Import Excel Statement Button */}
          <TouchableOpacity
            style={styles.importHeaderBtn}
            onPress={() => setShowImportModal(true)}
            activeOpacity={0.7}
          >
            <RemixIcon name="file-excel-2-line" size={13} color="#16A34A" />
            <Text style={styles.importHeaderBtnText}>
              {language === 'kh' ? 'នាំចូល Excel' : 'Import Statement'}
            </Text>
          </TouchableOpacity>

          {/* Type Segmented Filter */}
          <View style={styles.tabGroup}>
            {(['all', 'expense', 'income'] as const).map((tab) => (
              <Pressable
                key={tab}
                style={[styles.tab, filterType === tab && styles.tabActive]}
                onPress={() => {
                  setFilterType(tab);
                  setPage(1);
                }}
              >
                <Text style={[styles.tabText, filterType === tab && styles.tabTextActive]}>
                  {tab === 'all' ? t.planAll : tab === 'expense' ? t.finExpense : t.finIncome}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Net Balance Pill */}
          <View style={styles.netBalancePill}>
            <Text
              style={[
                styles.netBalanceValue,
                { color: netSavings >= 0 ? '#059669' : '#EF4444' },
              ]}
            >
              ${netSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </View>

      {/* Fixed Top Controls & KPI Section (Never Scrolls) */}
      <View style={styles.fixedTopSection}>
        {/* KPI Stats 3 Cards Row */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={styles.statLabel}>{t.finBalance}</Text>
              <View style={[styles.statIconBox, { backgroundColor: '#F1F5F9' }]}>
                <RemixIcon name="bank-card-line" size={12} color="#0F172A" />
              </View>
            </View>
            <Text
              style={[
                styles.statValue,
                { color: netSavings >= 0 ? '#0F172A' : '#EF4444' },
              ]}
            >
              ${netSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.statSub}>
              {selectedPeriod === 'all'
                ? language === 'kh'
                  ? 'សមតុល្យសរុបគ្រប់ពេលវេលា'
                  : 'Total net balance'
                : language === 'kh'
                ? `សមតុល្យសម្រាប់ ${selectedPeriod}`
                : `Net for ${selectedPeriod}`}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={styles.statLabel}>{t.finIncome}</Text>
              <View style={[styles.statIconBox, { backgroundColor: '#ECFDF5' }]}>
                <RemixIcon name="arrow-down-line" size={12} color="#059669" />
              </View>
            </View>
            <Text style={[styles.statValue, { color: '#059669' }]}>
              +${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.statSub}>
              {language === 'kh' ? 'ចំណូលសរុបចូលគណនី' : 'Total money received'}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={styles.statLabel}>{t.finExpense}</Text>
              <View style={[styles.statIconBox, { backgroundColor: '#FEF2F2' }]}>
                <RemixIcon name="arrow-up-line" size={12} color="#EF4444" />
              </View>
            </View>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>
              -${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.statSub}>
              {language === 'kh' ? 'ចំណាយសរុបទាំងអស់' : 'Total expenses paid'}
            </Text>
          </View>
        </View>

        {/* AI Smart Expense Capture Bar */}
        <View style={styles.aiCaptureBar}>
          <CustomTextInput
            containerStyle={styles.aiInputContainer}
            value={aiInput}
            onChangeText={setAiInput}
            placeholder={t.finQuickLogPlaceholder}
            onSubmitEditing={handleAiLog}
            icon="sparkles-fill"
            size="md"
            rightElement={
              <TouchableOpacity
                style={[
                  styles.aiButton,
                  (!aiInput.trim() || isProcessing) && styles.aiButtonDisabled,
                ]}
                onPress={handleAiLog}
                disabled={!aiInput.trim() || isProcessing}
                activeOpacity={0.8}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <RemixIcon
                      name="send-plane-fill"
                      size={11}
                      color={aiInput.trim() ? '#FFFFFF' : '#94A3B8'}
                    />
                    <Text
                      style={[
                        styles.aiButtonText,
                        !aiInput.trim() && styles.aiButtonTextDisabled,
                      ]}
                    >
                      {t.finLogEntry}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            }
          />
        </View>

        {/* Controls Row 1: Search Box + Date Picker Trigger + Page Size */}
        <View style={styles.controlsRowTop}>
          <View style={styles.controlsRowTopLeft}>
            {/* Search Box */}
            <View style={styles.searchBox}>
              <RemixIcon name="search-line" size={13} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder={
                  language === 'kh'
                    ? 'ស្វែងរកប្រតិបត្តិការ, ហាង, Ref Code...'
                    : 'Search transactions, merchant, ref...'
                }
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={(txt) => {
                  setSearchQuery(txt);
                  setPage(1);
                }}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => { setSearchQuery(''); setPage(1); }}>
                  <RemixIcon name="close-line" size={13} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Calendar Date Picker Modal Trigger Button */}
            <TouchableOpacity
              style={[
                styles.dateFilterBtn,
                selectedPeriod !== 'all' && styles.dateFilterBtnActive,
              ]}
              onPress={() => setShowCalendarFilterModal(true)}
              activeOpacity={0.7}
            >
              <RemixIcon
                name="calendar-line"
                size={13}
                color={selectedPeriod !== 'all' ? '#2563EB' : '#64748B'}
              />
              <Text
                style={[
                  styles.dateFilterBtnText,
                  selectedPeriod !== 'all' && styles.dateFilterBtnTextActive,
                ]}
              >
                {selectedPeriod === 'all'
                  ? language === 'kh'
                    ? 'ជ្រើសរើសថ្ងៃ / ប្រតិទិន'
                    : 'Filter Date'
                  : selectedPeriod}
              </Text>
              {selectedPeriod !== 'all' ? (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedPeriod('all');
                    setPage(1);
                  }}
                  hitSlop={6}
                >
                  <RemixIcon name="close-line" size={11} color="#2563EB" />
                </TouchableOpacity>
              ) : (
                <RemixIcon name="arrow-down-line" size={10} color="#94A3B8" />
              )}
            </TouchableOpacity>
          </View>

          {/* Page Size Segmented Selector */}
          <View style={styles.pageSizeRow}>
            <Text style={styles.pageSizeLabel}>
              {language === 'kh' ? 'ចំនួនជួរ៖' : 'Rows:'}
            </Text>
            <View style={styles.pageSizeSegment}>
              {[15, 25, 50].map((sz) => (
                <TouchableOpacity
                  key={sz}
                  style={[styles.pageSizeBtn, pageSize === sz && styles.pageSizeBtnActive]}
                  onPress={() => {
                    setPageSize(sz);
                    setPage(1);
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.pageSizeText,
                      pageSize === sz && styles.pageSizeTextActive,
                    ]}
                  >
                    {sz}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Controls Row 2: Category Chips Scroll */}
        <View style={styles.controlsRowBottom}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryFilterChip,
                selectedCategory === 'all' && styles.categoryFilterChipActive,
              ]}
              onPress={() => {
                setSelectedCategory('all');
                setPage(1);
              }}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.categoryFilterText,
                  selectedCategory === 'all' && styles.categoryFilterTextActive,
                ]}
              >
                {language === 'kh' ? 'ទាំងអស់' : 'All'}
                <Text
                  style={[
                    styles.categoryCountText,
                    selectedCategory === 'all' && styles.categoryCountTextActive,
                  ]}
                >
                  {' '}({finances.length})
                </Text>
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => {
              const count = finances.filter((f) => f.category === cat).length;
              const isActive = selectedCategory === cat;
              const label = getCategoryLabel(cat, language);
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryFilterChip,
                    isActive && styles.categoryFilterChipActive,
                  ]}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setPage(1);
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.categoryFilterText,
                      isActive && styles.categoryFilterTextActive,
                    ]}
                  >
                    {label}
                    <Text
                      style={[
                        styles.categoryCountText,
                        isActive && styles.categoryCountTextActive,
                      ]}
                    >
                      {' '}({count})
                    </Text>
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Main Table Container: Only the Table Rows Scroll! */}
      <View style={styles.tableCard}>
        {/* Sticky Fixed Table Column Headers */}
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 2.8 }]}>
            {language === 'kh' ? 'ប្រតិបត្តិការ / អ្នកទទួល' : 'Transaction / Counterparty'}
          </Text>
          <Text style={[styles.th, { flex: 1.4 }]}>
            {language === 'kh' ? 'ប្រភេទ' : 'Category'}
          </Text>
          <Text style={[styles.th, { flex: 1 }]}>
            {language === 'kh' ? 'កាលបរិច្ឆេទ' : 'Date'}
          </Text>
          <Text style={[styles.th, { flex: 1.1, textAlign: 'right' }]}>
            {language === 'kh' ? 'ចំនួនទឹកប្រាក់' : 'Amount'}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Conditional Rendering: Empty State vs Data Rows */}
        {filteredFinances.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <RemixIcon name="bank-card-line" size={24} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>
              {language === 'kh' ? 'មិនមានប្រតិបត្តិការត្រូវបង្ហាញទេ' : 'No Transactions Found'}
            </Text>
            <Text style={styles.emptySub}>
              {searchQuery || selectedCategory !== 'all' || selectedPeriod !== 'all'
                ? language === 'kh'
                  ? 'សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬកាលបរិច្ឆេទ'
                  : 'Try clearing your date or category filter.'
                : language === 'kh'
                ? 'ប្រើប្រាស់ AI Bar ខាងលើ ឬចុច «នាំចូល Excel» ដើម្បីបញ្ចូលទិន្នន័យ។'
                : 'Use the AI input bar above or click "Import Statement" to load transactions.'}
            </Text>
            {(searchQuery || selectedCategory !== 'all' || selectedPeriod !== 'all' || filterType !== 'all') && (
              <TouchableOpacity
                style={styles.resetFiltersBtn}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedPeriod('all');
                  setFilterType('all');
                  setPage(1);
                }}
                activeOpacity={0.75}
              >
                <RemixIcon name="refresh-line" size={12} color="#2563EB" />
                <Text style={styles.resetFiltersBtnText}>
                  {language === 'kh' ? 'សម្អាត Filter ទាំងអស់' : 'Reset All Filters'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          /* Table Rows Body: Isolated Scroll */
          <ScrollView
            style={styles.tableBodyScroll}
            contentContainerStyle={styles.tableBodyContent}
            showsVerticalScrollIndicator={false}
          >
            {paginatedFinances.map((item) => {
              const { title, sub } = parseTransactionNote(item.note);
              const catStyle = getCategoryStyle(item.category);
              const isIncome = item.type === 'income';

              return (
                <Pressable
                  key={item.id}
                  style={({ hovered }: any) => [
                    styles.tableRow,
                    hovered && styles.tableRowHovered,
                  ]}
                  onPress={() => setSelectedTx(item)}
                >
                  {/* Column 1: Clean Merchant / Title + Subtitle */}
                  <View style={[styles.td, { flex: 2.8, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                    <View
                      style={[
                        styles.typeBadgeBox,
                        isIncome ? styles.typeBadgeIncome : styles.typeBadgeExpense,
                      ]}
                    >
                      <RemixIcon
                        name={isIncome ? 'arrow-down-line' : 'arrow-up-line'}
                        size={12}
                        color={isIncome ? '#059669' : '#EF4444'}
                      />
                    </View>

                    <View style={styles.noteWrap}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {title}
                      </Text>
                      {sub ? (
                        <Text style={styles.rowSub} numberOfLines={1}>
                          {sub}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Column 2: Category Soft Pill with Dot */}
                  <View style={[styles.td, { flex: 1.4 }]}>
                    <View style={[styles.categoryPill, { backgroundColor: catStyle.bg }]}>
                      <View style={[styles.categoryDot, { backgroundColor: catStyle.dot }]} />
                      <Text style={[styles.categoryText, { color: catStyle.text }]} numberOfLines={1}>
                        {item.category}
                      </Text>
                    </View>
                  </View>

                  {/* Column 3: Date */}
                  <View style={[styles.td, { flex: 1 }]}>
                    <Text style={styles.rowDate}>{item.date}</Text>
                  </View>

                  {/* Column 4: Amount */}
                  <View style={[styles.td, { flex: 1.1, alignItems: 'flex-end' }]}>
                    <Text
                      style={[
                        styles.rowAmount,
                        { color: isIncome ? '#059669' : '#0F172A' },
                      ]}
                    >
                      {isIncome ? '+' : '-'}${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>

                  {/* Column 5: Delete Action */}
                  <View style={{ width: 36, alignItems: 'flex-end' }}>
                    <Pressable
                      style={({ hovered }: any) => [
                        styles.deleteBtn,
                        hovered && styles.deleteBtnHovered,
                      ]}
                      onPress={(e) => {
                        e.stopPropagation();
                        deleteFinanceRecord(item.id);
                      }}
                      hitSlop={6}
                    >
                      {({ hovered }: any) => (
                        <RemixIcon
                          name="delete-bin-line"
                          size={12}
                          color={hovered ? '#DC2626' : '#94A3B8'}
                        />
                      )}
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Fixed Bottom Pagination Bar (Never Scrolls) */}
      <DesktopPagination
        currentPage={activePage}
        totalItems={filteredFinances.length}
        itemsPerPage={pageSize}
        onPageChange={setPage}
      />

      {/* Excel Bank Statement Import Modal */}
      <ImportStatementModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
      />

      {/* Interactive Calendar Date Picker Modal */}
      <FinanceCalendarPickerModal
        visible={showCalendarFilterModal}
        onClose={() => setShowCalendarFilterModal(false)}
        finances={finances}
        selectedDate={selectedPeriod}
        onSelectDate={(dt) => {
          setSelectedPeriod(dt);
          setPage(1);
        }}
      />

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <CustomModal
          visible={Boolean(selectedTx)}
          onClose={() => setSelectedTx(null)}
          title={language === 'kh' ? 'ព័ត៌មានលម្អិតនៃប្រតិបត្តិការ' : 'Transaction Details'}
          maxWidth={460}
        >
          <View style={styles.detailContainer}>
            <View style={styles.detailAmountCard}>
              <Text style={styles.detailAmountLabel}>
                {selectedTx.type === 'income' ? 'Total Received' : 'Total Paid'}
              </Text>
              <Text
                style={[
                  styles.detailAmountValue,
                  { color: selectedTx.type === 'income' ? '#059669' : '#0F172A' },
                ]}
              >
                {selectedTx.type === 'income' ? '+' : '-'}${selectedTx.amount.toFixed(2)} USD
              </Text>
            </View>

            <View style={styles.detailGrid}>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Category</Text>
                <View
                  style={[
                    styles.categoryPill,
                    { backgroundColor: getCategoryStyle(selectedTx.category).bg },
                  ]}
                >
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: getCategoryStyle(selectedTx.category).dot },
                    ]}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      { color: getCategoryStyle(selectedTx.category).text },
                    ]}
                  >
                    {selectedTx.category}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Date</Text>
                <Text style={styles.detailVal}>{selectedTx.date}</Text>
              </View>

              <View style={styles.detailRowCol}>
                <Text style={styles.detailKey}>Full Note / Memo</Text>
                <Text style={styles.detailNoteText}>{selectedTx.note}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Transaction ID</Text>
                <Text style={styles.detailValCode}>{selectedTx.id}</Text>
              </View>
            </View>

            <View style={styles.detailFooter}>
              <TouchableOpacity
                style={styles.closeDetailBtn}
                onPress={() => setSelectedTx(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.closeDetailBtnText}>
                  {language === 'kh' ? 'បិទ' : 'Close'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </CustomModal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topRail: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moduleTitle: {
    fontSize: 13.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  totalBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  totalBadgeText: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 28,
    paddingHorizontal: 9,
    borderRadius: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  calendarLinkBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  calendarLinkBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
    fontWeight: '700',
  },
  calendarLinkBtnTextActive: {
    color: '#2563EB',
  },
  importHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 28,
    paddingHorizontal: 9,
    borderRadius: 5,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  importHeaderBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#16A34A',
    fontWeight: '700',
  },
  tabGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    padding: 2,
    gap: 2,
  },
  tab: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 4,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F172A',
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  netBalancePill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 5,
  },
  netBalanceValue: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  fixedTopSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#64748B',
  },
  statIconBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 14.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '800',
    marginTop: 1,
  },
  statSub: {
    fontSize: 9,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
    marginTop: 1,
  },
  aiCaptureBar: {
    width: '100%',
  },
  aiInputContainer: {
    backgroundColor: '#FFFFFF',
  },
  aiButton: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#0F172A',
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  aiButtonDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  aiButtonText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#FFFFFF',
    fontWeight: '700',
  },
  aiButtonTextDisabled: {
    color: '#94A3B8',
  },
  controlsRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  controlsRowTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  controlsRowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 260,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#0F172A',
    outlineStyle: 'none',
  } as any,
  dateFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 30,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
  },
  dateFilterBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  dateFilterBtnText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#475569',
    fontWeight: '600',
  },
  dateFilterBtnTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  categoryScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 16,
  },
  categoryFilterChip: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  categoryFilterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  categoryFilterText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#334155',
  },
  categoryFilterTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  categoryCountText: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  categoryCountTextActive: {
    color: '#94A3B8',
    fontFamily: 'Krasar-Bold',
  },
  pageSizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageSizeLabel: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  pageSizeSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    padding: 2,
    gap: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 30,
  },
  pageSizeBtn: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageSizeBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  pageSizeText: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  pageSizeTextActive: {
    color: '#0F172A',
    fontWeight: '700',
    fontFamily: 'Krasar-Bold',
  },
  resetFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  resetFiltersBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#2563EB',
    fontWeight: '700',
  },
  tableCard: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  th: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  tableBodyScroll: {
    flex: 1,
  },
  tableBodyContent: {
    flexGrow: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    cursor: 'pointer',
  } as any,
  tableRowHovered: {
    backgroundColor: '#F8FAFC',
  },
  td: {
    justifyContent: 'center',
  },
  typeBadgeBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadgeIncome: {
    backgroundColor: '#ECFDF5',
  },
  typeBadgeExpense: {
    backgroundColor: '#FEF2F2',
  },
  noteWrap: {
    flex: 1,
    gap: 1,
  },
  rowTitle: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  rowSub: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  categoryText: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
  },
  rowDate: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  rowAmount: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  deleteBtn: {
    width: 22,
    height: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnHovered: {
    backgroundColor: '#FEE2E2',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 4,
  },
  emptyIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  emptyTitle: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 320,
  },
  detailContainer: {
    gap: 12,
    paddingVertical: 4,
  },
  detailAmountCard: {
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    alignItems: 'center',
    gap: 4,
  },
  detailAmountLabel: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  detailAmountValue: {
    fontSize: 22,
    fontFamily: 'Krasar-Bold',
    fontWeight: '800',
  },
  detailGrid: {
    gap: 8,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailRowCol: {
    gap: 4,
    paddingVertical: 2,
  },
  detailKey: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  detailVal: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
    fontWeight: '600',
  },
  detailValCode: {
    fontSize: 10,
    fontFamily: 'Courier',
    color: '#64748B',
  },
  detailNoteText: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#0F172A',
    lineHeight: 16,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 4,
  },
  detailFooter: {
    alignItems: 'flex-end',
    paddingTop: 6,
  },
  closeDetailBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#0F172A',
    borderRadius: 6,
  },
  closeDetailBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
