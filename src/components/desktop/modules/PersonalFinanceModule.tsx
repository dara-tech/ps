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
import { RemixIcon, RemixIconName } from '../../ui/RemixIcon';
import { BankLogo } from '../../ui/BankLogo';
import { DesktopPagination } from '../../ui/DesktopPagination';
import { CustomTextInput } from '../../ui/CustomTextInput';
import { CustomModal } from '../../ui/CustomModal';
import { ImportStatementModal } from '../ImportStatementModal';
import { FinanceCalendarPickerModal } from '../FinanceCalendarPickerModal';
import { PersonalFinanceRecord } from '../../../../shared';

export type BankBrand = 'acleda' | 'aba' | 'khqr' | 'wing' | 'canadia' | 'truemoney' | 'cash' | 'other';

export interface BankBrandInfo {
  brand: BankBrand;
  shortLabel: string;
  name: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon: RemixIconName;
}

// Helper to detect Bank Brand and visual theme from transaction note
export const detectBankBrand = (note: string, category: string, type: string): BankBrandInfo => {
  const upper = (note || '').toUpperCase();
  if (upper.includes('ACLEDA') || upper.includes('ACLEDA QR')) {
    return {
      brand: 'acleda',
      shortLabel: 'ACLEDA',
      name: 'ACLEDA Bank',
      badgeBg: '#0A2540',
      badgeText: '#FBBF24',
      badgeBorder: '#1E3A8A',
      icon: 'bank-card-line',
    };
  }
  if (upper.includes('ABA') || upper.includes('ABA BANK') || upper.includes('PAYWAY')) {
    return {
      brand: 'aba',
      shortLabel: 'ABA',
      name: 'ABA Bank',
      badgeBg: '#004B6E',
      badgeText: '#38BDF8',
      badgeBorder: '#0284C7',
      icon: 'bank-card-line',
    };
  }
  if (upper.includes('KHQR') || upper.includes('BAKONG')) {
    return {
      brand: 'khqr',
      shortLabel: 'KHQR',
      name: 'Bakong KHQR',
      badgeBg: '#E11D48',
      badgeText: '#FFFFFF',
      badgeBorder: '#BE123C',
      icon: 'apps-2-line',
    };
  }
  if (upper.includes('WING')) {
    return {
      brand: 'wing',
      shortLabel: 'WING',
      name: 'Wing Bank',
      badgeBg: '#84CC16',
      badgeText: '#064E3B',
      badgeBorder: '#65A30D',
      icon: 'bank-card-line',
    };
  }
  if (upper.includes('CANADIA')) {
    return {
      brand: 'canadia',
      shortLabel: 'CANADIA',
      name: 'Canadia Bank',
      badgeBg: '#DC2626',
      badgeText: '#FFFFFF',
      badgeBorder: '#B91C1C',
      icon: 'bank-card-line',
    };
  }
  if (type === 'income') {
    return {
      brand: 'cash',
      shortLabel: 'INCOME',
      name: 'Income',
      badgeBg: '#059669',
      badgeText: '#ECFDF5',
      badgeBorder: '#047857',
      icon: 'arrow-down-line',
    };
  }
  if (category === 'Food & Groceries' || upper.includes('FOOD') || upper.includes('COFFEE') || upper.includes('CAFE') || upper.includes('MART')) {
    return {
      brand: 'other',
      shortLabel: 'FOOD',
      name: 'Food & Dining',
      badgeBg: '#EA580C',
      badgeText: '#FFF7ED',
      badgeBorder: '#C2410C',
      icon: 'restaurant-line',
    };
  }
  if (category === 'Transportation' || upper.includes('GRAB') || upper.includes('PASSAPP') || upper.includes('TAXI') || upper.includes('TUK TUK')) {
    return {
      brand: 'other',
      shortLabel: 'RIDE',
      name: 'Transport',
      badgeBg: '#7C3AED',
      badgeText: '#F5F3FF',
      badgeBorder: '#6D28D9',
      icon: 'car-line',
    };
  }
  return {
    brand: 'other',
    shortLabel: 'BANK',
    name: 'Transfer',
    badgeBg: '#334155',
    badgeText: '#F8FAFC',
    badgeBorder: '#475569',
    icon: 'bank-card-line',
  };
};

// Helper to clean and parse bank statement notes into Clean Recipient Title & Sub-metadata
const parseTransactionNote = (rawNote: string) => {
  if (!rawNote) return { title: 'Transaction', sub: '', ref: '', time: '' };

  if (rawNote.includes('|')) {
    const parts = rawNote.split('|').map((p) => p.trim());
    let title = parts[0];

    // Clean redundant prefixes like "Paid To", "Transfer To", "Payment To", "Received From"
    title = title.replace(/^(?:Paid|Payment|Transfer(?:red)?|Funds Transfer|Received|Deposit)\s+(?:To|From)\s+/i, '').trim();
    title = title.replace(/\(TID[^\)]*\)/g, '').trim();

    let ref = '';
    let time = '';
    const otherMeta: string[] = [];

    parts.slice(1).forEach((p) => {
      if (p.startsWith('Ref.') || p.startsWith('Ref:')) {
        ref = p.replace(/^Ref\.?\s*/i, 'Ref: ');
      } else if (p.includes('AM') || p.includes('PM')) {
        const timeMatch = p.match(/\d{1,2}:\d{2}\s*(?:AM|PM)/i);
        if (timeMatch) {
          time = timeMatch[0];
          // Do NOT add duplicate time to subtitle
        }
      } else if (!p.startsWith('USD') && !p.startsWith('KHR')) {
        // Skip repetitive bank acronyms to keep subtitle clean
        const cleanP = p.replace(/^(?:ACLEDA QR|ABA Bank|KHQR)\s*$/i, '').trim();
        if (cleanP) otherMeta.push(cleanP);
      }
    });

    // Clean subtitle: show reference number or clean short note
    const sub = ref || (otherMeta.length > 0 ? otherMeta[0] : '');

    return {
      title: title || parts[0],
      sub,
      ref,
      time,
    };
  }

  const cleanTitle = rawNote.replace(/^(?:Paid|Payment|Transfer(?:red)?|Funds Transfer|Received|Deposit)\s+(?:To|From)\s+/i, '').trim();
  return {
    title: cleanTitle || rawNote,
    sub: '',
    ref: '',
    time: '',
  };
};

const getCategoryStyle = (cat: string) => {
  switch (cat) {
    case 'Food & Groceries':
      return { bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B', isSimple: false };
    case 'Transfer & Payments':
      return { bg: 'transparent', text: '#64748B', dot: '#94A3B8', isSimple: true };
    case 'Transportation':
      return { bg: '#F3E8FF', text: '#6D28D9', dot: '#8B5CF6', isSimple: false };
    case 'Income':
      return { bg: '#DCFCE7', text: '#15803D', dot: '#16A34A', isSimple: false };
    case 'Utilities & Bills':
      return { bg: '#FFE4E6', text: '#BE123C', dot: '#F43F5E', isSimple: false };
    case 'Healthcare':
      return { bg: '#E0F2FE', text: '#0369A1', dot: '#0EA5E9', isSimple: false };
    default:
      return { bg: 'transparent', text: '#64748B', dot: '#94A3B8', isSimple: true };
  }
};

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
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);

  // Extract distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    finances.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set);
  }, [finances]);

  // Extract distinct bank brand counts
  const bankCounts = useMemo(() => {
    let acleda = 0;
    let aba = 0;
    let khqr = 0;
    let other = 0;

    finances.forEach((f) => {
      const b = detectBankBrand(f.note, f.category, f.type);
      if (b.brand === 'acleda') acleda++;
      else if (b.brand === 'aba') aba++;
      else if (b.brand === 'khqr') khqr++;
      else other++;
    });

    return { all: finances.length, acleda, aba, khqr, other };
  }, [finances]);

  // Filtered dataset (Sorted Newest to Oldest)
  const filteredFinances = useMemo(() => {
    return finances
      .filter((f) => {
        if (selectedBank !== 'all') {
          const b = detectBankBrand(f.note, f.category, f.type);
          if (b.brand !== selectedBank) return false;
        }
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
  }, [finances, selectedBank, filterType, selectedCategory, selectedPeriod, searchQuery]);

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

  // Group paginated transactions by Date for real Bank Statement layout
  const groupedByDate = useMemo(() => {
    const groups: { date: string; items: PersonalFinanceRecord[]; netDay: number }[] = [];
    const dateMap = new Map<string, { date: string; items: PersonalFinanceRecord[]; netDay: number }>();

    paginatedFinances.forEach((item) => {
      let g = dateMap.get(item.date);
      if (!g) {
        g = { date: item.date, items: [], netDay: 0 };
        dateMap.set(item.date, g);
        groups.push(g);
      }
      g.items.push(item);
      if (item.type === 'income') {
        g.netDay += item.amount;
      } else {
        g.netDay -= item.amount;
      }
    });

    return groups;
  }, [paginatedFinances]);

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
          <View style={styles.bankLedgerBadge}>
            <View style={styles.liveIndicatorDot} />
            <Text style={styles.bankLedgerBadgeText}>
              {filteredFinances.length.toLocaleString()} {language === 'kh' ? 'ប្រតិបត្តិការ' : 'Transactions'}
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
                hitSlop={4}
              >
                <RemixIcon name="close-circle-fill" size={12} color="#2563EB" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* Import Statement Button */}
          <TouchableOpacity
            style={styles.importHeaderBtn}
            onPress={() => setShowImportModal(true)}
            activeOpacity={0.8}
          >
            <RemixIcon name="file-excel-2-line" size={13} color="#16A34A" />
            <Text style={styles.importHeaderBtnText}>
              {language === 'kh' ? 'នាំចូល Excel / Bank' : 'Import Statement'}
            </Text>
          </TouchableOpacity>

          {/* All / Expense / Income Type Filter */}
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
        </View>
      </View>

      {/* Fixed Top Controls & Bank KPI Section (Never Scrolls) */}
      <View style={styles.fixedTopSection}>
        {/* Top Deck: 3 Clean FinTech Stat Cards */}
        <View style={styles.statsGrid}>
          {/* 1. HERO NET BALANCE CARD */}
          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <View style={styles.statTitleGroup}>
                <Text style={styles.statLabel}>{language === 'kh' ? 'សមតុល្យសរុប' : 'NET BALANCE'}</Text>
                <View style={styles.currencyBadge}>
                  <Text style={styles.currencyBadgeText}>USD</Text>
                </View>
              </View>
              <View style={[styles.statIconBox, { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}>
                <RemixIcon name="bank-card-line" size={12} color="#0F172A" />
              </View>
            </View>
            <Text
              style={[
                styles.statValue,
                { color: netSavings >= 0 ? '#16A34A' : '#DC2626' },
              ]}
            >
              {netSavings >= 0 ? '+' : '-'}${Math.abs(netSavings).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.statSub}>
              {selectedPeriod === 'all'
                ? language === 'kh'
                  ? 'សមតុល្យសរុបគ្រប់ពេលវេលា'
                  : 'Total live account balance'
                : language === 'kh'
                ? `សមតុល្យសម្រាប់ ${selectedPeriod}`
                : `Net balance for ${selectedPeriod}`}
            </Text>
          </View>

          {/* 2. INFLOW CARD (GREEN) */}
          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={styles.statLabel}>{language === 'kh' ? 'ចំណូលសរុប (INFLOW)' : 'TOTAL INFLOW'}</Text>
              <View style={[styles.statIconBox, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}>
                <RemixIcon name="arrow-down-line" size={12} color="#16A34A" />
              </View>
            </View>
            <Text style={[styles.statValue, { color: '#16A34A' }]}>
              +${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.statSub}>
              {language === 'kh' ? 'ចំណូលសរុបចូលគណនី' : 'Total money received'}
            </Text>
          </View>

          {/* 3. OUTFLOW CARD (RED) */}
          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={styles.statLabel}>{language === 'kh' ? 'ចំណាយសរុប (OUTFLOW)' : 'TOTAL OUTFLOW'}</Text>
              <View style={[styles.statIconBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
                <RemixIcon name="arrow-up-line" size={12} color="#DC2626" />
              </View>
            </View>
            <Text style={[styles.statValue, { color: '#DC2626' }]}>
              -${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.statSub}>
              {language === 'kh' ? 'ចំណាយសរុបបានទូទាត់' : 'Total expenses paid'}
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

        {/* Controls Row 1: Search Box + Bank Source Selector + Page Size */}
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
                    : 'Search transactions, merchant, ref code...'
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

            {/* Bank Source Filter Tabs (All, ACLEDA, ABA Bank, KHQR) */}
            <View style={styles.bankFilterGroup}>
              <TouchableOpacity
                style={[styles.bankFilterPill, selectedBank === 'all' && styles.bankFilterPillActive]}
                onPress={() => { setSelectedBank('all'); setPage(1); }}
                activeOpacity={0.75}
              >
                <Text style={[styles.bankFilterPillText, selectedBank === 'all' && styles.bankFilterPillTextActive]}>
                  {language === 'kh' ? 'ធនាគារទាំងអស់' : 'All Banks'} ({bankCounts.all})
                </Text>
              </TouchableOpacity>

              {bankCounts.acleda > 0 && (
                <TouchableOpacity
                  style={[styles.bankFilterPill, selectedBank === 'acleda' && styles.bankFilterPillActive]}
                  onPress={() => { setSelectedBank('acleda'); setPage(1); }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.miniBankDot, { backgroundColor: '#FBBF24' }]} />
                  <Text style={[styles.bankFilterPillText, selectedBank === 'acleda' && styles.bankFilterPillTextActive]}>
                    ACLEDA ({bankCounts.acleda})
                  </Text>
                </TouchableOpacity>
              )}

              {bankCounts.aba > 0 && (
                <TouchableOpacity
                  style={[styles.bankFilterPill, selectedBank === 'aba' && styles.bankFilterPillActive]}
                  onPress={() => { setSelectedBank('aba'); setPage(1); }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.miniBankDot, { backgroundColor: '#38BDF8' }]} />
                  <Text style={[styles.bankFilterPillText, selectedBank === 'aba' && styles.bankFilterPillTextActive]}>
                    ABA Bank ({bankCounts.aba})
                  </Text>
                </TouchableOpacity>
              )}

              {bankCounts.khqr > 0 && (
                <TouchableOpacity
                  style={[styles.bankFilterPill, selectedBank === 'khqr' && styles.bankFilterPillActive]}
                  onPress={() => { setSelectedBank('khqr'); setPage(1); }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.miniBankDot, { backgroundColor: '#E11D48' }]} />
                  <Text style={[styles.bankFilterPillText, selectedBank === 'khqr' && styles.bankFilterPillTextActive]}>
                    KHQR ({bankCounts.khqr})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Page Size Toggle */}
          <View style={styles.pageSizeSelector}>
            <Text style={styles.pageSizeLabel}>
              {language === 'kh' ? 'បង្ហាញ:' : 'Rows:'}
            </Text>
            <View style={styles.pageSizeGroup}>
              {[15, 25, 50].map((sz) => (
                <TouchableOpacity
                  key={sz}
                  style={[
                    styles.pageSizeBtn,
                    pageSize === sz && styles.pageSizeBtnActive,
                  ]}
                  onPress={() => {
                    setPageSize(sz);
                    setPage(1);
                  }}
                  activeOpacity={0.7}
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
                {language === 'kh' ? 'ទាំងអស់' : 'All Categories'}
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

      {/* Main Bank Ledger Table Container */}
      <View style={styles.tableCard}>
        {/* Sticky Fixed Table Column Headers */}
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 3 }]}>
            {language === 'kh' ? 'ប្រតិបត្តិការ / ធនាគារ & អ្នកទទួល' : 'Transaction / Bank & Merchant'}
          </Text>
          <Text style={[styles.th, { flex: 1.3 }]}>
            {language === 'kh' ? 'ប្រភេទ' : 'Category'}
          </Text>
          <Text style={[styles.th, { flex: 1.1 }]}>
            {language === 'kh' ? 'កាលបរិច្ឆេទ & ម៉ោង' : 'Date & Time'}
          </Text>
          <Text style={[styles.th, { flex: 1.2, textAlign: 'right' }]}>
            {language === 'kh' ? 'ចំនួនទឹកប្រាក់' : 'Amount'}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Conditional Rendering: Empty State vs Bank Ledger Data Rows */}
        {filteredFinances.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <RemixIcon name="bank-card-line" size={24} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>
              {language === 'kh' ? 'មិនមានប្រតិបត្តិការត្រូវបង្ហាញទេ' : 'No Transactions Found'}
            </Text>
            <Text style={styles.emptySub}>
              {searchQuery || selectedCategory !== 'all' || selectedPeriod !== 'all' || selectedBank !== 'all'
                ? language === 'kh'
                  ? 'សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬកាលបរិច្ឆេទ'
                  : 'Try clearing your bank, date, or category filter.'
                : language === 'kh'
                ? 'ប្រើប្រាស់ AI Bar ខាងលើ ឬចុច «នាំចូល Excel» ដើម្បីបញ្ចូលទិន្នន័យ។'
                : 'Use the AI input bar above or click "Import Statement" to load transactions.'}
            </Text>
            {(searchQuery || selectedCategory !== 'all' || selectedPeriod !== 'all' || selectedBank !== 'all' || filterType !== 'all') && (
              <TouchableOpacity
                style={styles.resetFiltersBtn}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedBank('all');
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
          /* Table Rows Body: Isolated Scroll with Date Grouping */
          <ScrollView
            style={styles.tableBodyScroll}
            contentContainerStyle={styles.tableBodyContent}
            showsVerticalScrollIndicator={false}
          >
            {groupedByDate.map((group) => (
              <View key={group.date} style={styles.dateGroupBlock}>
                {/* Bank Statement Group Date Header */}
                <View style={styles.dateGroupHeader}>
                  <View style={styles.dateGroupHeaderLeft}>
                    <Text style={styles.dateGroupTitle}>{group.date}</Text>
                    <Text style={styles.dateGroupCount}>({group.items.length} {language === 'kh' ? 'ប្រតិបត្តិការ' : 'items'})</Text>
                  </View>
                  <View style={styles.dateGroupHeaderRight}>
                    <Text style={styles.dateGroupNetLabel}>Day Net:</Text>
                    <Text
                      style={[
                        styles.dateGroupNetValue,
                        { color: group.netDay >= 0 ? '#16A34A' : '#DC2626' },
                      ]}
                    >
                      {group.netDay >= 0 ? '+' : '-'}${Math.abs(group.netDay).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                </View>

                {/* Items in this date group */}
                {group.items.map((item) => {
                  const { title, sub, time } = parseTransactionNote(item.note);
                  const bankInfo = detectBankBrand(item.note, item.category, item.type);
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
                      {/* Column 1: Real Official Bank Logo Avatar + Clean Merchant & Metadata */}
                      <View style={[styles.td, { flex: 3, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
                        {/* High-End Real Bank Logo Avatar */}
                        <BankLogo brand={bankInfo.brand} size={36} height={36} />

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

                      {/* Column 2: Clean Category */}
                      <View style={[styles.td, { flex: 1.3 }]}>
                        {catStyle.isSimple ? (
                          <Text style={styles.categorySimpleText} numberOfLines={1}>
                            {item.category === 'Transfer & Payments' ? 'Transfer' : item.category}
                          </Text>
                        ) : (
                          <View style={[styles.categoryPill, { backgroundColor: catStyle.bg }]}>
                            <View style={[styles.categoryDot, { backgroundColor: catStyle.dot }]} />
                            <Text style={[styles.categoryText, { color: catStyle.text }]} numberOfLines={1}>
                              {item.category}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Column 3: Date & Time */}
                      <View style={[styles.td, { flex: 1.1 }]}>
                        <Text style={styles.rowDate}>{time || item.date}</Text>
                      </View>

                      {/* Column 4: Tabular Amount (Bold Green for In, Bold Red for Out) */}
                      <View style={[styles.td, { flex: 1.2, alignItems: 'flex-end' }]}>
                        <Text
                          style={[
                            styles.rowAmount,
                            { color: isIncome ? '#16A34A' : '#DC2626' },
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
              </View>
            ))}
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
              <BankLogo brand={detectBankBrand(selectedTx.note, selectedTx.category, selectedTx.type).brand} size={44} height={44} />
              <Text style={styles.detailAmountLabel}>
                {selectedTx.type === 'income' ? 'Total Received' : 'Total Settled'}
              </Text>
              <Text
                style={[
                  styles.detailAmountValue,
                  { color: selectedTx.type === 'income' ? '#16A34A' : '#DC2626' },
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
                <Text style={styles.detailKey}>Full Memo / Ref</Text>
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
    color: '#0F172A',
    fontWeight: '700',
  },
  bankLedgerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  bankLedgerBadgeText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Medium',
    color: '#475569',
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  currencyBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
  },
  currencyBadgeText: {
    fontSize: 9,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
    fontWeight: '700',
  },
  statIconBox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 16.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginVertical: 2,
  },
  statSub: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
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
    width: 250,
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
  bankFilterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  bankFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  bankFilterPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  miniBankDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bankFilterPillText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#475569',
    fontWeight: '600',
  },
  bankFilterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pageSizeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageSizeLabel: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  pageSizeGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    padding: 2,
    gap: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pageSizeBtn: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 3,
  },
  pageSizeBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  pageSizeText: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  pageSizeTextActive: {
    color: '#0F172A',
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  categoryFilterChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryFilterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  categoryFilterText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#475569',
  },
  categoryFilterTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  categoryCountText: {
    fontSize: 9.5,
    color: '#94A3B8',
  },
  categoryCountTextActive: {
    color: '#94A3B8',
  },

  // Main Bank Ledger Table Container
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
    height: 36,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  th: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  tableBodyScroll: {
    flex: 1,
  },
  tableBodyContent: {
    paddingBottom: 10,
  },

  // Date Group Block & Header
  dateGroupBlock: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dateGroupHeader: {
    height: 28,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dateGroupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateGroupTitle: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#334155',
    fontWeight: '700',
  },
  dateGroupCount: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
  },
  dateGroupHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateGroupNetLabel: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  dateGroupNetValue: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // Transaction Table Row
  tableRow: {
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  tableRowHovered: {
    backgroundColor: '#F8FAFC',
  },
  td: {
    justifyContent: 'center',
  },

  // Bank Avatar Squircle
  bankAvatarSquircle: {
    width: 44,
    height: 28,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankAvatarText: {
    fontSize: 9,
    fontFamily: 'Krasar-Bold',
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  noteWrap: {
    flex: 1,
    justifyContent: 'center',
    gap: 1.5,
  },
  rowTitle: {
    fontSize: 13,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
    fontWeight: '700',
  },
  rowSub: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  categorySimpleText: {
    fontSize: 11,
    fontFamily: 'Krasar-Medium',
    color: '#64748B',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  categoryDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  categoryText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Medium',
    fontWeight: '600',
  },
  rowDate: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#475569',
  },
  rowAmount: {
    fontSize: 13.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  deleteBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  deleteBtnHovered: {
    backgroundColor: '#FEE2E2',
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 8,
  },
  emptyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 13.5,
    fontFamily: 'Krasar-Bold',
    color: '#334155',
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 380,
    lineHeight: 16,
  },
  resetFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  resetFiltersBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#2563EB',
    fontWeight: '700',
  },

  // Details Modal
  detailContainer: {
    padding: 16,
    gap: 16,
  },
  detailAmountCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  detailAmountLabel: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  detailAmountValue: {
    fontSize: 22,
    fontFamily: 'Krasar-Bold',
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  detailGrid: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailRowCol: {
    gap: 4,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailKey: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  detailVal: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
  },
  detailValCode: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#475569',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  detailNoteText: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#1E293B',
    lineHeight: 16,
  },
  detailFooter: {
    marginTop: 6,
  },
  closeDetailBtn: {
    height: 34,
    backgroundColor: '#0F172A',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeDetailBtnText: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
