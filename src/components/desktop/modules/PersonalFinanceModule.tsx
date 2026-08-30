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
import { useThemeStore } from '../../../store/useThemeStore';
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
      name: 'KHQR / Bakong',
      badgeBg: '#7F1D1D',
      badgeText: '#FCA5A5',
      badgeBorder: '#991B1B',
      icon: 'bank-card-line',
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
export const parseTransactionNote = (rawNote: string) => {
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
  const tokens = useThemeStore((state) => state.tokens);
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
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income' | 'cashflow'>('all');
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
        } else if (filterType !== 'all' && filterType !== 'cashflow' && f.type !== filterType) {
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

  // Deep Cashflow Analytics & Intelligence Engine
  const cashflowAnalytics = useMemo(() => {
    const monthlyMap = new Map<string, { month: string; inflow: number; outflow: number; net: number; count: number }>();
    const merchantMap = new Map<string, { name: string; count: number; totalOutflow: number; brand: BankBrand; latestDate: string }>();

    let needsTotal = 0;
    let wantsTotal = 0;
    let totalOutflow = 0;
    let totalInflow = 0;

    finances.forEach((tx) => {
      const amt = tx.amount || 0;
      const isOut = tx.type === 'expense';
      const isIn = tx.type === 'income';

      if (isOut) totalOutflow += amt;
      if (isIn) totalInflow += amt;

      // Extract month key e.g. "Aug 2026", "Jul 2026"
      let monthKey = 'Recent';
      if (tx.date) {
        const parts = tx.date.trim().split(' ');
        if (parts.length >= 3) {
          monthKey = `${parts[1]} ${parts[2]}`;
        } else if (tx.date.includes('-')) {
          monthKey = tx.date.slice(0, 7);
        }
      }

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { month: monthKey, inflow: 0, outflow: 0, net: 0, count: 0 });
      }
      const mEntry = monthlyMap.get(monthKey)!;
      mEntry.count++;
      if (isIn) mEntry.inflow += amt;
      if (isOut) mEntry.outflow += amt;
      mEntry.net = mEntry.inflow - mEntry.outflow;

      // Categorization for 50/30/20 Rule
      if (isOut) {
        const cat = (tx.category || '').toLowerCase();
        const isNeed = cat.includes('food') || cat.includes('util') || cat.includes('health') || cat.includes('transport') || cat.includes('grocer') || cat.includes('bill');
        if (isNeed) {
          needsTotal += amt;
        } else {
          wantsTotal += amt;
        }

        // Extract merchant name
        const parsed = parseTransactionNote(tx.note);
        let mName = (parsed.title || 'General Transfer').trim();
        if (mName.length > 28) mName = mName.slice(0, 28) + '...';
        if (!merchantMap.has(mName)) {
          const brand = detectBankBrand(tx.note, tx.category, tx.type).brand;
          merchantMap.set(mName, { name: mName, count: 0, totalOutflow: 0, brand, latestDate: tx.date });
        }
        const mer = merchantMap.get(mName)!;
        mer.count++;
        mer.totalOutflow += amt;
      }
    });

    const monthlyList = Array.from(monthlyMap.values()).slice(-6);
    const maxMonthlyVal = Math.max(1, ...monthlyList.map((m) => Math.max(m.inflow, m.outflow)));

    const topMerchants = Array.from(merchantMap.values())
      .sort((a, b) => b.totalOutflow - a.totalOutflow)
      .slice(0, 6);

    const maxMerchantVal = Math.max(1, ...topMerchants.map((m) => m.totalOutflow));

    const netVelocity = totalInflow - totalOutflow;
    const savingsRate = totalInflow > 0 ? ((netVelocity / totalInflow) * 100) : 0;
    const avgDailyBurn = totalOutflow / Math.max(1, finances.length > 0 ? 30 : 1);
    const safeDailySpend = Math.max(15, (totalInflow - totalOutflow) > 0 ? ((totalInflow - totalOutflow) / 30) : 25);
    const runwayMonths = totalOutflow > 0 && totalInflow > totalOutflow ? (totalInflow / (totalOutflow / 6)).toFixed(1) : '12+';

    return {
      monthlyList,
      maxMonthlyVal,
      topMerchants,
      maxMerchantVal,
      needsTotal,
      wantsTotal,
      needsPct: totalOutflow > 0 ? Math.round((needsTotal / totalOutflow) * 100) : 50,
      wantsPct: totalOutflow > 0 ? Math.round((wantsTotal / totalOutflow) * 100) : 50,
      totalInflow,
      totalOutflow,
      netVelocity,
      savingsRate: Math.max(-100, Math.min(100, Math.round(savingsRate))),
      avgDailyBurn,
      safeDailySpend,
      runwayMonths,
    };
  }, [finances]);

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
    <View style={[styles.container, { backgroundColor: tokens.windowBg }]}>
      {/* Top Header Rail (44px) - Fixed */}
      <View style={[styles.topRail, { backgroundColor: tokens.surfaceBg, borderBottomColor: tokens.borderSubtle }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.moduleTitle, { color: tokens.textPrimary }]}>{t.finTitle}</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Interactive Date & Calendar Filter Trigger */}
          <TouchableOpacity
            style={[
              styles.calendarLinkBtn,
              { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle },
              selectedPeriod !== 'all' && { borderColor: tokens.accentColor, backgroundColor: tokens.accentSoft },
            ]}
            onPress={() => setShowCalendarFilterModal(true)}
            activeOpacity={0.7}
          >
            <RemixIcon
              name="calendar-line"
              size={13}
              color={selectedPeriod !== 'all' ? tokens.accentColor : tokens.textSecondary}
            />
            <Text
              style={[
                styles.calendarLinkBtnText,
                { color: tokens.textPrimary },
                selectedPeriod !== 'all' && { color: tokens.accentColor, fontWeight: '700' },
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
                <RemixIcon name="close-circle-fill" size={12} color={tokens.accentColor} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* Import Statement Button */}
          <TouchableOpacity
            style={[styles.importHeaderBtn, { borderColor: '#86EFAC', backgroundColor: '#F0FDF4' }]}
            onPress={() => setShowImportModal(true)}
            activeOpacity={0.8}
          >
            <RemixIcon name="file-excel-2-line" size={13} color="#16A34A" />
            <Text style={styles.importHeaderBtnText}>
              {language === 'kh' ? 'នាំចូល Excel / Bank' : 'Import Statement'}
            </Text>
          </TouchableOpacity>

          {/* All / Expense / Income / Cashflow Analysis Type Filter */}
          <View style={[styles.tabGroup, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}>
            {(['all', 'expense', 'income', 'cashflow'] as const).map((tab) => (
              <Pressable
                key={tab}
                style={[
                  styles.tab,
                  filterType === tab && { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle, borderWidth: 1 },
                ]}
                onPress={() => {
                  setFilterType(tab);
                  setPage(1);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: filterType === tab ? tokens.textPrimary : tokens.textSecondary },
                    filterType === tab && { fontWeight: '700' },
                  ]}
                >
                  {tab === 'all'
                    ? (language === 'kh' ? 'កិច្ចការទាំងអស់' : 'All')
                    : tab === 'expense'
                    ? (language === 'kh' ? 'ចំណាយសរុប' : 'Outflow')
                    : tab === 'income'
                    ? (language === 'kh' ? 'ចំណូលសរុប' : 'Inflow')
                    : (language === 'kh' ? 'វិភាគ Cashflow' : 'Cashflow Analysis')}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Fixed Top Controls & Bank KPI Section (Never Scrolls) */}
      <View style={[styles.fixedTopSection, { backgroundColor: tokens.windowBg }]}>
        {/* Top Deck: 3 Clean FinTech Stat Cards */}
        <View style={styles.statsGrid}>
          {/* 1. HERO NET BALANCE CARD */}
          <View style={[styles.statCard, { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]}>
            <View style={styles.statTop}>
              <View style={styles.statTitleGroup}>
                <Text style={[styles.statLabel, { color: tokens.textSecondary }]}>{language === 'kh' ? 'សមតុល្យសរុប' : 'NET BALANCE'}</Text>
                <View style={[styles.currencyBadge, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}>
                  <Text style={[styles.currencyBadgeText, { color: tokens.textSecondary }]}>USD</Text>
                </View>
              </View>
              <View style={[styles.statIconBox, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}>
                <RemixIcon name="bank-card-line" size={12} color={tokens.textPrimary} />
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
            <Text style={[styles.statSub, { color: tokens.textSecondary }]}>
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
          <View style={[styles.statCard, { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]}>
            <View style={styles.statTop}>
              <Text style={[styles.statLabel, { color: tokens.textSecondary }]}>{language === 'kh' ? 'ចំណូលសរុប (INFLOW)' : 'TOTAL INFLOW'}</Text>
              <View style={[styles.statIconBox, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}>
                <RemixIcon name="arrow-down-line" size={12} color="#16A34A" />
              </View>
            </View>
            <Text style={[styles.statValue, { color: '#16A34A' }]}>
              +${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={[styles.statSub, { color: tokens.textSecondary }]}>
              {language === 'kh' ? 'ចំណូលសរុបចូលគណនី' : 'Total money received'}
            </Text>
          </View>

          {/* 3. OUTFLOW CARD (RED) */}
          <View style={[styles.statCard, { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]}>
            <View style={styles.statTop}>
              <Text style={[styles.statLabel, { color: tokens.textSecondary }]}>{language === 'kh' ? 'ចំណាយសរុប (OUTFLOW)' : 'TOTAL OUTFLOW'}</Text>
              <View style={[styles.statIconBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
                <RemixIcon name="arrow-up-line" size={12} color="#DC2626" />
              </View>
            </View>
            <Text style={[styles.statValue, { color: '#DC2626' }]}>
              -${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={[styles.statSub, { color: tokens.textSecondary }]}>
              {language === 'kh' ? 'ចំណាយសរុបបានទូទាត់' : 'Total expenses paid'}
            </Text>
          </View>
        </View>

        {/* AI Smart Expense Capture Bar */}
        <View style={styles.aiCaptureBar}>
          <CustomTextInput
            containerStyle={[styles.aiInputContainer, { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]}
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
                  { backgroundColor: tokens.accentColor },
                  (!aiInput.trim() || isProcessing) && { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle },
                ]}
                onPress={handleAiLog}
                disabled={!aiInput.trim() || isProcessing}
                activeOpacity={0.8}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color={tokens.accentFg} />
                ) : (
                  <>
                    <RemixIcon
                      name="send-plane-fill"
                      size={11}
                      color={aiInput.trim() ? tokens.accentFg : tokens.textMuted}
                    />
                    <Text
                      style={[
                        styles.aiButtonText,
                        { color: tokens.accentFg },
                        !aiInput.trim() && { color: tokens.textMuted },
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
            <View style={[styles.searchBox, { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]}>
              <RemixIcon name="search-line" size={13} color={tokens.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: tokens.textPrimary }]}
                placeholder={
                  language === 'kh'
                    ? 'ស្វែងរកប្រតិបត្តិការ, ហាង, Ref Code...'
                    : 'Search transactions, merchant, ref code...'
                }
                placeholderTextColor={tokens.textMuted}
                value={searchQuery}
                onChangeText={(txt) => {
                  setSearchQuery(txt);
                  setPage(1);
                }}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => { setSearchQuery(''); setPage(1); }}>
                  <RemixIcon name="close-line" size={13} color={tokens.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Bank Source Filter Tabs (All, ACLEDA, ABA Bank, KHQR) */}
            <View style={styles.bankFilterGroup}>
              <TouchableOpacity
                style={[
                  styles.bankFilterPill,
                  { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle },
                  selectedBank === 'all' && { backgroundColor: tokens.accentColor, borderColor: tokens.accentColor },
                ]}
                onPress={() => { setSelectedBank('all'); setPage(1); }}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.bankFilterPillText,
                    { color: tokens.textSecondary },
                    selectedBank === 'all' && { color: tokens.accentFg, fontWeight: '700' },
                  ]}
                >
                  {language === 'kh' ? 'ធនាគារទាំងអស់' : 'All Banks'} ({bankCounts.all})
                </Text>
              </TouchableOpacity>

              {bankCounts.acleda > 0 && (
                <TouchableOpacity
                  style={[
                    styles.bankFilterPill,
                    { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle },
                    selectedBank === 'acleda' && { backgroundColor: tokens.accentColor, borderColor: tokens.accentColor },
                  ]}
                  onPress={() => { setSelectedBank('acleda'); setPage(1); }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.miniBankDot, { backgroundColor: '#FBBF24' }]} />
                  <Text
                    style={[
                      styles.bankFilterPillText,
                      { color: tokens.textSecondary },
                      selectedBank === 'acleda' && { color: tokens.accentFg, fontWeight: '700' },
                    ]}
                  >
                    ACLEDA ({bankCounts.acleda})
                  </Text>
                </TouchableOpacity>
              )}

              {bankCounts.aba > 0 && (
                <TouchableOpacity
                  style={[
                    styles.bankFilterPill,
                    { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle },
                    selectedBank === 'aba' && { backgroundColor: tokens.accentColor, borderColor: tokens.accentColor },
                  ]}
                  onPress={() => { setSelectedBank('aba'); setPage(1); }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.miniBankDot, { backgroundColor: '#38BDF8' }]} />
                  <Text
                    style={[
                      styles.bankFilterPillText,
                      { color: tokens.textSecondary },
                      selectedBank === 'aba' && { color: tokens.accentFg, fontWeight: '700' },
                    ]}
                  >
                    ABA Bank ({bankCounts.aba})
                  </Text>
                </TouchableOpacity>
              )}

              {bankCounts.khqr > 0 && (
                <TouchableOpacity
                  style={[
                    styles.bankFilterPill,
                    { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle },
                    selectedBank === 'khqr' && { backgroundColor: tokens.accentColor, borderColor: tokens.accentColor },
                  ]}
                  onPress={() => { setSelectedBank('khqr'); setPage(1); }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.miniBankDot, { backgroundColor: '#E11D48' }]} />
                  <Text
                    style={[
                      styles.bankFilterPillText,
                      { color: tokens.textSecondary },
                      selectedBank === 'khqr' && { color: tokens.accentFg, fontWeight: '700' },
                    ]}
                  >
                    KHQR ({bankCounts.khqr})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Page Size Toggle */}
          <View style={styles.pageSizeSelector}>
            <Text style={[styles.pageSizeLabel, { color: tokens.textSecondary }]}>
              {language === 'kh' ? 'បង្ហាញ:' : 'Rows:'}
            </Text>
            <View style={[styles.pageSizeGroup, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}>
              {[15, 25, 50].map((sz) => (
                <TouchableOpacity
                  key={sz}
                  style={[
                    styles.pageSizeBtn,
                    pageSize === sz && { backgroundColor: tokens.surfaceBg },
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
                      { color: tokens.textSecondary },
                      pageSize === sz && { color: tokens.textPrimary, fontWeight: '700' },
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
                { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle },
                selectedCategory === 'all' && { backgroundColor: tokens.accentColor, borderColor: tokens.accentColor },
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
                  { color: tokens.textSecondary },
                  selectedCategory === 'all' && { color: tokens.accentFg, fontWeight: '700' },
                ]}
              >
                {language === 'kh' ? 'ទាំងអស់' : 'All Categories'}
                <Text
                  style={[
                    styles.categoryCountText,
                    { color: tokens.textMuted },
                    selectedCategory === 'all' && { color: tokens.accentFg, opacity: 0.8 },
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
                    { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle },
                    isActive && { backgroundColor: tokens.accentColor, borderColor: tokens.accentColor },
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
                      { color: tokens.textSecondary },
                      isActive && { color: tokens.accentFg, fontWeight: '700' },
                    ]}
                  >
                    {label}
                    <Text
                      style={[
                        styles.categoryCountText,
                        { color: tokens.textMuted },
                        isActive && { color: tokens.accentFg, opacity: 0.8 },
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

      {/* Conditional: Cashflow Intelligence View vs Main Bank Ledger Table */}
      {filterType === 'cashflow' ? (
        <ScrollView
          style={styles.cashflowScroll}
          contentContainerStyle={styles.cashflowScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Cashflow Intelligence Hero Banner */}
          <View style={[styles.cfHeroCard, { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]}>
            <View style={styles.cfHeroTop}>
              <View style={styles.cfHeroHeaderLeft}>
                <View style={[styles.cfIconCircle, { backgroundColor: tokens.accentSoft, borderColor: tokens.accentBorder }]}>
                  <RemixIcon name="funds-line" size={18} color={tokens.accentColor} />
                </View>
                <View>
                  <Text style={[styles.cfHeroTitle, { color: tokens.textPrimary }]}>
                    {language === 'kh' ? 'ផ្ទាំងវិភាគចរន្តសាច់ប្រាក់ឆ្លាតវៃ (Cashflow Intelligence)' : 'Cashflow Intelligence & Runway Radar'}
                  </Text>
                  <Text style={[styles.cfHeroSub, { color: tokens.textSecondary }]}>
                    {language === 'kh'
                      ? `វិភាគលើប្រតិបត្តិការជាក់ស្តែង ${finances.length.toLocaleString()} ប្រតិបត្តិការ ពី ACLEDA & ABA Bank`
                      : `Deep financial diagnosis across ${finances.length.toLocaleString()} real bank transactions`}
                  </Text>
                </View>
              </View>

              <View style={[styles.cfHealthPill, { backgroundColor: cashflowAnalytics.netVelocity >= 0 ? '#DCFCE7' : '#FEE2E2', borderColor: cashflowAnalytics.netVelocity >= 0 ? '#BBF7D0' : '#FECACA' }]}>
                <View style={[styles.cfHealthDot, { backgroundColor: cashflowAnalytics.netVelocity >= 0 ? '#16A34A' : '#DC2626' }]} />
                <Text style={[styles.cfHealthText, { color: cashflowAnalytics.netVelocity >= 0 ? '#15803D' : '#B91C1C' }]}>
                  {cashflowAnalytics.netVelocity >= 0
                    ? (language === 'kh' ? 'ចរន្តសាច់ប្រាក់រឹងមាំ (Healthy Surplus)' : 'Healthy Cashflow Surplus')
                    : (language === 'kh' ? 'មានសម្ពាធចំណាយ (Deficit Burn)' : 'Deficit Burn Alert')}
                </Text>
              </View>
            </View>

            {/* 4 Health KPI Tiles */}
            <View style={styles.cfMetricsGrid}>
              {/* Metric 1: Net Velocity */}
              <View style={[styles.cfMetricTile, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}>
                <Text style={[styles.cfMetricLabel, { color: tokens.textSecondary }]}>
                  {language === 'kh' ? 'ល្បឿនសាច់ប្រាក់សុទ្ធ (Net Velocity)' : 'Net Cashflow Velocity'}
                </Text>
                <Text style={[styles.cfMetricValue, { color: cashflowAnalytics.netVelocity >= 0 ? '#16A34A' : '#DC2626' }]}>
                  {cashflowAnalytics.netVelocity >= 0 ? '+' : '-'}${Math.abs(cashflowAnalytics.netVelocity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text style={[styles.cfMetricSub, { color: tokens.textSecondary }]}>
                  {cashflowAnalytics.savingsRate}% {language === 'kh' ? 'នៃចំណូលត្រូវបានរក្សាទុក' : 'net retained savings'}
                </Text>
              </View>

              {/* Metric 2: Estimated Runway */}
              <View style={[styles.cfMetricTile, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}>
                <Text style={[styles.cfMetricLabel, { color: tokens.textSecondary }]}>
                  {language === 'kh' ? 'រយៈពេលទ្រទ្រង់ (Cash Runway)' : 'Cash Runway & Buffer'}
                </Text>
                <Text style={[styles.cfMetricValue, { color: tokens.textPrimary }]}>
                  {cashflowAnalytics.runwayMonths} {language === 'kh' ? 'ខែ' : 'Months'}
                </Text>
                <Text style={[styles.cfMetricSub, { color: tokens.textSecondary }]}>
                  {language === 'kh' ? 'ការប៉ាន់ស្មានតាមកម្រិតចំណាយ' : 'Estimated buffer at current burn'}
                </Text>
              </View>

              {/* Metric 3: Safe-to-Spend Daily Limit */}
              <View style={[styles.cfMetricTile, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}>
                <Text style={[styles.cfMetricLabel, { color: tokens.textSecondary }]}>
                  {language === 'kh' ? 'កម្រិតចាយសុវត្ថិភាព (Daily Limit)' : 'Daily Safe-to-Spend'}
                </Text>
                <Text style={[styles.cfMetricValue, { color: tokens.accentColor }]}>
                  ${cashflowAnalytics.safeDailySpend.toFixed(2)}
                </Text>
                <Text style={[styles.cfMetricSub, { color: tokens.textSecondary }]}>
                  {language === 'kh' ? 'ពិដានចំណាយក្នុង ១ ថ្ងៃ' : 'Recommended daily ceiling'}
                </Text>
              </View>

              {/* Metric 4: Savings Ratio */}
              <View style={[styles.cfMetricTile, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}>
                <Text style={[styles.cfMetricLabel, { color: tokens.textSecondary }]}>
                  {language === 'kh' ? 'អត្រាសន្សំ & ចំណេញ (Savings Rate)' : 'Net Savings Ratio'}
                </Text>
                <Text style={[styles.cfMetricValue, { color: cashflowAnalytics.savingsRate >= 20 ? '#16A34A' : '#EAB308' }]}>
                  {cashflowAnalytics.savingsRate}%
                </Text>
                <Text style={[styles.cfMetricSub, { color: tokens.textSecondary }]}>
                  {cashflowAnalytics.savingsRate >= 20
                    ? (language === 'kh' ? 'សម្រេចបានគោលដៅ 20%+' : 'Above 20% benchmark')
                    : (language === 'kh' ? 'គោលដៅស្តង់ដារ 20%+' : 'Target: 20%+ benchmark')}
                </Text>
              </View>
            </View>
          </View>

          {/* 2. Middle Row: Monthly Inflow vs Outflow Velocity Chart + 50/30/20 Budget Breakdown */}
          <View style={styles.cfMiddleRow}>
            {/* Monthly Cashflow Velocity Chart */}
            <View style={[styles.cfChartCard, { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]}>
              <View style={styles.cfCardHeader}>
                <View style={styles.cfCardHeaderLeft}>
                  <RemixIcon name="bar-chart-2-line" size={15} color={tokens.accentColor} />
                  <Text style={[styles.cfCardTitle, { color: tokens.textPrimary }]}>
                    {language === 'kh' ? 'ចរន្តសាច់ប្រាក់តាមខែ (Inflow vs Outflow Timeline)' : 'Monthly Cashflow Velocity'}
                  </Text>
                </View>
                <View style={styles.cfLegendRow}>
                  <View style={styles.cfLegendItem}>
                    <View style={[styles.cfLegendDot, { backgroundColor: '#16A34A' }]} />
                    <Text style={[styles.cfLegendText, { color: tokens.textSecondary }]}>Inflow</Text>
                  </View>
                  <View style={styles.cfLegendItem}>
                    <View style={[styles.cfLegendDot, { backgroundColor: '#DC2626' }]} />
                    <Text style={[styles.cfLegendText, { color: tokens.textSecondary }]}>Outflow</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cfTimelineList}>
                {cashflowAnalytics.monthlyList.map((m) => {
                  const inPct = Math.max(8, Math.min(100, Math.round((m.inflow / cashflowAnalytics.maxMonthlyVal) * 100)));
                  const outPct = Math.max(8, Math.min(100, Math.round((m.outflow / cashflowAnalytics.maxMonthlyVal) * 100)));
                  return (
                    <View key={m.month} style={styles.cfTimelineRow}>
                      <View style={styles.cfMonthLabelBox}>
                        <Text style={[styles.cfMonthName, { color: tokens.textPrimary }]}>{m.month}</Text>
                        <Text style={[styles.cfMonthCount, { color: tokens.textSecondary }]}>{m.count} txs</Text>
                      </View>

                      <View style={styles.cfBarsTrack}>
                        {/* Inflow Bar */}
                        <View style={styles.cfBarRow}>
                          <View style={[styles.cfBarFill, { width: `${inPct}%`, backgroundColor: '#16A34A' }]} />
                          <Text style={[styles.cfBarAmt, { color: '#16A34A' }]}>
                            +${m.inflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Text>
                        </View>

                        {/* Outflow Bar */}
                        <View style={styles.cfBarRow}>
                          <View style={[styles.cfBarFill, { width: `${outPct}%`, backgroundColor: '#DC2626' }]} />
                          <Text style={[styles.cfBarAmt, { color: '#DC2626' }]}>
                            -${m.outflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Text>
                        </View>
                      </View>

                      {/* Net Badge */}
                      <View style={[styles.cfMonthNetBadge, { backgroundColor: m.net >= 0 ? '#DCFCE7' : '#FEE2E2', borderColor: m.net >= 0 ? '#BBF7D0' : '#FECACA' }]}>
                        <Text style={[styles.cfMonthNetText, { color: m.net >= 0 ? '#15803D' : '#B91C1C' }]}>
                          {m.net >= 0 ? '+' : '-'}${Math.abs(m.net).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* 50/30/20 Budget Breakdown Card */}
            <View style={[styles.cfBudgetCard, { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]}>
              <View style={styles.cfCardHeader}>
                <View style={styles.cfCardHeaderLeft}>
                  <RemixIcon name="pie-chart-2-line" size={15} color={tokens.accentColor} />
                  <Text style={[styles.cfCardTitle, { color: tokens.textPrimary }]}>
                    {language === 'kh' ? 'ការបែងចែកថវិកា 50/30/20 Rule' : '50/30/20 Budget Rule'}
                  </Text>
                </View>
              </View>

              <View style={styles.cfBudgetBarsWrap}>
                {/* 1. Essential Needs (Target 50%) */}
                <View style={styles.cfBudgetItem}>
                  <View style={styles.cfBudgetMetaRow}>
                    <Text style={[styles.cfBudgetName, { color: tokens.textPrimary }]}>
                      {language === 'kh' ? 'ចំណាយចាំបាច់ (Needs - 50% Target)' : 'Essential Needs (50% Target)'}
                    </Text>
                    <Text style={[styles.cfBudgetVal, { color: tokens.textPrimary }]}>
                      ${cashflowAnalytics.needsTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({cashflowAnalytics.needsPct}%)
                    </Text>
                  </View>
                  <View style={[styles.cfProgressBarBg, { backgroundColor: tokens.surfaceMuted }]}>
                    <View style={[styles.cfProgressBarFill, { width: `${Math.min(100, cashflowAnalytics.needsPct)}%`, backgroundColor: '#2563EB' }]} />
                  </View>
                  <Text style={[styles.cfBudgetSub, { color: tokens.textSecondary }]}>
                    {language === 'kh' ? 'ម្ហូបអាហារ, ទឹកភ្លើង, សេវាដឹកជញ្ជូន, សុខភាព' : 'Food, utilities, transport, medicine'}
                  </Text>
                </View>

                {/* 2. Discretionary Wants (Target 30%) */}
                <View style={styles.cfBudgetItem}>
                  <View style={styles.cfBudgetMetaRow}>
                    <Text style={[styles.cfBudgetName, { color: tokens.textPrimary }]}>
                      {language === 'kh' ? 'ចំណាយកម្សាន្ត (Wants - 30% Target)' : 'Discretionary Wants (30% Target)'}
                    </Text>
                    <Text style={[styles.cfBudgetVal, { color: tokens.textPrimary }]}>
                      ${cashflowAnalytics.wantsTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({cashflowAnalytics.wantsPct}%)
                    </Text>
                  </View>
                  <View style={[styles.cfProgressBarBg, { backgroundColor: tokens.surfaceMuted }]}>
                    <View style={[styles.cfProgressBarFill, { width: `${Math.min(100, cashflowAnalytics.wantsPct)}%`, backgroundColor: '#F59E0B' }]} />
                  </View>
                  <Text style={[styles.cfBudgetSub, { color: tokens.textSecondary }]}>
                    {language === 'kh' ? 'Shopping, ញ៉ាំខាងក្រៅ, កាហ្វេ, កម្សាន្ត' : 'Shopping, dining out, lifestyle'}
                  </Text>
                </View>

                {/* 3. Retained Savings (Target 20%) */}
                <View style={styles.cfBudgetItem}>
                  <View style={styles.cfBudgetMetaRow}>
                    <Text style={[styles.cfBudgetName, { color: tokens.textPrimary }]}>
                      {language === 'kh' ? 'ប្រាក់សន្សំសុទ្ធ (Savings - 20% Target)' : 'Retained Savings (20% Target)'}
                    </Text>
                    <Text style={[styles.cfBudgetVal, { color: '#16A34A' }]}>
                      ${Math.max(0, cashflowAnalytics.netVelocity).toLocaleString('en-US', { minimumFractionDigits: 2 })} ({cashflowAnalytics.savingsRate}%)
                    </Text>
                  </View>
                  <View style={[styles.cfProgressBarBg, { backgroundColor: tokens.surfaceMuted }]}>
                    <View style={[styles.cfProgressBarFill, { width: `${Math.min(100, Math.max(0, cashflowAnalytics.savingsRate))}%`, backgroundColor: '#16A34A' }]} />
                  </View>
                  <Text style={[styles.cfBudgetSub, { color: tokens.textSecondary }]}>
                    {language === 'kh' ? 'ប្រាក់បម្រុង, សន្សំ និងវិនិយោគអនាគត' : 'Surplus reserve, savings & investments'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 3. Bottom Row: Top Merchants / Counterparties + AI Financial Advisor Diagnosis */}
          <View style={styles.cfBottomRow}>
            {/* Top Merchants Card */}
            <View style={[styles.cfMerchantsCard, { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]}>
              <View style={styles.cfCardHeader}>
                <View style={styles.cfCardHeaderLeft}>
                  <RemixIcon name="store-2-line" size={15} color={tokens.accentColor} />
                  <Text style={[styles.cfCardTitle, { color: tokens.textPrimary }]}>
                    {language === 'kh' ? 'ដៃគូ & ហាងដែលបានទូទាត់ច្រើនបំផុត (Top Counterparties)' : 'Top Spending Merchants & Counterparties'}
                  </Text>
                </View>
              </View>

              <View style={styles.cfMerchantsList}>
                {cashflowAnalytics.topMerchants.map((mer, idx) => {
                  const pct = cashflowAnalytics.totalOutflow > 0 ? Math.round((mer.totalOutflow / cashflowAnalytics.totalOutflow) * 100) : 0;
                  return (
                    <View key={mer.name} style={[styles.cfMerchantRow, { borderBottomColor: tokens.borderSubtle }]}>
                      <View style={styles.cfRankBox}>
                        <Text style={[styles.cfRankText, { color: idx === 0 ? tokens.accentColor : tokens.textSecondary }]}>#{idx + 1}</Text>
                      </View>
                      <BankLogo brand={mer.brand} size={28} height={28} />
                      <View style={styles.cfMerchantInfo}>
                        <Text style={[styles.cfMerchantName, { color: tokens.textPrimary }]} numberOfLines={1}>
                          {mer.name}
                        </Text>
                        <Text style={[styles.cfMerchantMeta, { color: tokens.textSecondary }]}>
                          {mer.count} {language === 'kh' ? 'ប្រតិបត្តិការ' : 'transfers'} • {mer.latestDate}
                        </Text>
                      </View>
                      <View style={styles.cfMerchantAmtBox}>
                        <Text style={[styles.cfMerchantAmt, { color: tokens.textPrimary }]}>
                          ${mer.totalOutflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                        <Text style={[styles.cfMerchantPct, { color: tokens.textSecondary }]}>{pct}% {language === 'kh' ? 'នៃចំណាយ' : 'of spend'}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* AI Financial Advisor Insights Card */}
            <View style={[styles.cfAdvisorCard, { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]}>
              <View style={styles.cfCardHeader}>
                <View style={styles.cfCardHeaderLeft}>
                  <RemixIcon name="sparkles-fill" size={15} color={tokens.accentColor} />
                  <Text style={[styles.cfCardTitle, { color: tokens.textPrimary }]}>
                    {language === 'kh' ? 'អនុសាសន៍ឆ្លាតវៃពី AI Advisor' : 'AI Financial Advisor Diagnosis'}
                  </Text>
                </View>
              </View>

              <View style={styles.cfAdvisorBody}>
                <View style={[styles.cfInsightBlock, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}>
                  <View style={styles.cfInsightIcon}>
                    <RemixIcon name="shield-check-fill" size={15} color="#16A34A" />
                  </View>
                  <View style={styles.cfInsightContent}>
                    <Text style={[styles.cfInsightTitle, { color: tokens.textPrimary }]}>
                      {language === 'kh' ? 'សុខភាពចរន្តសាច់ប្រាក់វិជ្ជមាន' : 'Positive Cashflow Velocity'}
                    </Text>
                    <Text style={[styles.cfInsightText, { color: tokens.textSecondary }]}>
                      {language === 'kh'
                        ? `ចំណូលសរុប (+${cashflowAnalytics.totalInflow.toLocaleString('en-US', { maximumFractionDigits: 0 })}) គឺខ្ពស់ជាងចំណាយសរុប ដែលផ្តល់នូវប្រាក់សន្សំសុទ្ធ ${cashflowAnalytics.savingsRate}% សម្រាប់ការវិនិយោគ។`
                        : `Inflows outpace total outflows with a strong ${cashflowAnalytics.savingsRate}% savings surplus for future growth.`}
                    </Text>
                  </View>
                </View>

                <View style={[styles.cfInsightBlock, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}>
                  <View style={styles.cfInsightIcon}>
                    <RemixIcon name="lightbulb-fill" size={15} color="#F59E0B" />
                  </View>
                  <View style={styles.cfInsightContent}>
                    <Text style={[styles.cfInsightTitle, { color: tokens.textPrimary }]}>
                      {language === 'kh' ? 'ឱកាសបង្កើនប្រសិទ្ធភាពចំណាយ' : 'Cost Optimization Opportunity'}
                    </Text>
                    <Text style={[styles.cfInsightText, { color: tokens.textSecondary }]}>
                      {language === 'kh'
                        ? `ការចំណាយលើ Discretionary Wants គឺ ${cashflowAnalytics.wantsPct}%។ ការកំណត់ពិដានចំណាយប្រចាំថ្ងៃ $${cashflowAnalytics.safeDailySpend.toFixed(0)} នឹងជួយពង្រីក Runway លើសពី ${cashflowAnalytics.runwayMonths} ខែ។`
                        : `Keeping daily spend below $${cashflowAnalytics.safeDailySpend.toFixed(0)} maintains your estimated ${cashflowAnalytics.runwayMonths} months of financial runway.`}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <>
          {/* Main Bank Ledger Table Container */}
          <View style={[styles.tableCard, { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]}>
            {/* Sticky Fixed Table Column Headers */}
            <View style={[styles.tableHeader, { backgroundColor: tokens.surfaceMuted, borderBottomColor: tokens.borderSubtle }]}>
              <Text style={[styles.th, { color: tokens.textSecondary, flex: 3 }]}>
                {language === 'kh' ? 'ប្រតិបត្តិការ / ធនាគារ & អ្នកទទួល' : 'Transaction / Bank & Merchant'}
              </Text>
              <Text style={[styles.th, { color: tokens.textSecondary, flex: 1.3 }]}>
                {language === 'kh' ? 'ប្រភេទ' : 'Category'}
              </Text>
              <Text style={[styles.th, { color: tokens.textSecondary, flex: 1.1 }]}>
                {language === 'kh' ? 'កាលបរិច្ឆេទ & ម៉ោង' : 'Date & Time'}
              </Text>
              <Text style={[styles.th, { color: tokens.textSecondary, flex: 1.2, textAlign: 'right' }]}>
                {language === 'kh' ? 'ចំនួនទឹកប្រាក់' : 'Amount'}
              </Text>
              <View style={{ width: 36 }} />
            </View>

            {/* Conditional Rendering: Empty State vs Bank Ledger Data Rows */}
            {filteredFinances.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIconCircle, { backgroundColor: tokens.surfaceMuted }]}>
                  <RemixIcon name="bank-card-line" size={24} color={tokens.textMuted} />
                </View>
                <Text style={[styles.emptyTitle, { color: tokens.textPrimary }]}>
                  {language === 'kh' ? 'មិនមានប្រតិបត្តិការត្រូវបង្ហាញទេ' : 'No Transactions Found'}
                </Text>
                <Text style={[styles.emptySub, { color: tokens.textSecondary }]}>
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
                    style={[styles.resetFiltersBtn, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}
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
                    <RemixIcon name="refresh-line" size={12} color={tokens.accentColor} />
                    <Text style={[styles.resetFiltersBtnText, { color: tokens.accentColor }]}>
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
                  <View key={group.date} style={[styles.dateGroupBlock, { borderBottomColor: tokens.borderSubtle }]}>
                    {/* Bank Statement Group Date Header */}
                    <View style={[styles.dateGroupHeader, { backgroundColor: tokens.surfaceMuted, borderTopColor: tokens.borderSubtle, borderBottomColor: tokens.borderSubtle }]}>
                      <View style={styles.dateGroupHeaderLeft}>
                        <Text style={[styles.dateGroupTitle, { color: tokens.textPrimary }]}>{group.date}</Text>
                        <Text style={[styles.dateGroupCount, { color: tokens.textSecondary }]}>({group.items.length} {language === 'kh' ? 'ប្រតិបត្តិការ' : 'items'})</Text>
                      </View>
                      <View style={styles.dateGroupHeaderRight}>
                        <Text style={[styles.dateGroupNetLabel, { color: tokens.textSecondary }]}>Day Net:</Text>
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
                            { backgroundColor: tokens.surfaceBg, borderBottomColor: tokens.borderSubtle },
                            hovered && { backgroundColor: tokens.surfaceMuted },
                          ]}
                          onPress={() => setSelectedTx(item)}
                        >
                          {/* Column 1: Real Official Bank Logo Avatar + Clean Merchant & Metadata */}
                          <View style={[styles.td, { flex: 3, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
                            {/* High-End Real Bank Logo Avatar */}
                            <BankLogo brand={bankInfo.brand} size={36} height={36} />

                            <View style={styles.noteWrap}>
                              <Text style={[styles.rowTitle, { color: tokens.textPrimary }]} numberOfLines={1}>
                                {title}
                              </Text>
                              {sub ? (
                                <Text style={[styles.rowSub, { color: tokens.textSecondary }]} numberOfLines={1}>
                                  {sub}
                                </Text>
                              ) : null}
                            </View>
                          </View>

                          {/* Column 2: Clean Category */}
                          <View style={[styles.td, { flex: 1.3 }]}>
                            {catStyle.isSimple ? (
                              <Text style={[styles.categorySimpleText, { color: tokens.textSecondary }]} numberOfLines={1}>
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
                            <Text style={[styles.rowDate, { color: tokens.textSecondary }]}>{time || item.date}</Text>
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
        </>
      )}

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
            <View style={[styles.detailAmountCard, { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]}>
              <BankLogo brand={detectBankBrand(selectedTx.note, selectedTx.category, selectedTx.type).brand} size={44} height={44} />
              <Text style={[styles.detailAmountLabel, { color: tokens.textSecondary }]}>
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
              <View style={[styles.detailRow, { borderBottomColor: tokens.borderSubtle }]}>
                <Text style={[styles.detailKey, { color: tokens.textSecondary }]}>Category</Text>
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

              <View style={[styles.detailRow, { borderBottomColor: tokens.borderSubtle }]}>
                <Text style={[styles.detailKey, { color: tokens.textSecondary }]}>Date</Text>
                <Text style={[styles.detailVal, { color: tokens.textPrimary }]}>{selectedTx.date}</Text>
              </View>

              <View style={[styles.detailRowCol, { borderBottomColor: tokens.borderSubtle }]}>
                <Text style={[styles.detailKey, { color: tokens.textSecondary }]}>Full Memo / Ref</Text>
                <Text style={[styles.detailNoteText, { color: tokens.textPrimary }]}>{selectedTx.note}</Text>
              </View>

              <View style={[styles.detailRow, { borderBottomColor: tokens.borderSubtle }]}>
                <Text style={[styles.detailKey, { color: tokens.textSecondary }]}>Transaction ID</Text>
                <Text style={[styles.detailValCode, { color: tokens.textPrimary, backgroundColor: tokens.surfaceMuted }]}>{selectedTx.id}</Text>
              </View>
            </View>

            <View style={styles.detailFooter}>
              <TouchableOpacity
                style={[styles.closeDetailBtn, { backgroundColor: tokens.accentColor }]}
                onPress={() => setSelectedTx(null)}
                activeOpacity={0.8}
              >
                <Text style={[styles.closeDetailBtnText, { color: tokens.accentFg }]}>
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

  // Cashflow Intelligence View Styles
  cashflowScroll: {
    flex: 1,
  },
  cashflowScrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  cfHeroCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 16,
  },
  cfHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  cfHeroHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cfIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cfHeroTitle: {
    fontSize: 14,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  cfHeroSub: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    marginTop: 2,
  },
  cfHealthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  cfHealthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cfHealthText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  cfMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cfMetricTile: {
    flex: 1,
    minWidth: 180,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  cfMetricLabel: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
  },
  cfMetricValue: {
    fontSize: 18,
    fontFamily: 'Krasar-Bold',
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  cfMetricSub: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
    marginTop: 2,
  },
  cfMiddleRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  cfChartCard: {
    flex: 1.4,
    minWidth: 320,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 14,
  },
  cfCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cfCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cfCardTitle: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  cfLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cfLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cfLegendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  cfLegendText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
  },
  cfTimelineList: {
    gap: 10,
  },
  cfTimelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cfMonthLabelBox: {
    width: 70,
  },
  cfMonthName: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  cfMonthCount: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
  },
  cfBarsTrack: {
    flex: 1,
    gap: 4,
  },
  cfBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cfBarFill: {
    height: 8,
    borderRadius: 4,
    minWidth: 6,
  },
  cfBarAmt: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  cfMonthNetBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    minWidth: 62,
    alignItems: 'center',
  },
  cfMonthNetText: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  cfBudgetCard: {
    flex: 1,
    minWidth: 260,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 14,
  },
  cfBudgetBarsWrap: {
    gap: 14,
  },
  cfBudgetItem: {
    gap: 4,
  },
  cfBudgetMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cfBudgetName: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  cfBudgetVal: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  cfProgressBarBg: {
    height: 7,
    borderRadius: 3.5,
    overflow: 'hidden',
  },
  cfProgressBarFill: {
    height: '100%',
    borderRadius: 3.5,
  },
  cfBudgetSub: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
  },
  cfBottomRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  cfMerchantsCard: {
    flex: 1.3,
    minWidth: 300,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  cfMerchantsList: {
    gap: 8,
  },
  cfMerchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  cfRankBox: {
    width: 22,
  },
  cfRankText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '800',
  },
  cfMerchantInfo: {
    flex: 1,
  },
  cfMerchantName: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  cfMerchantMeta: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
    marginTop: 1,
  },
  cfMerchantAmtBox: {
    alignItems: 'flex-end',
  },
  cfMerchantAmt: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  cfMerchantPct: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
  },
  cfAdvisorCard: {
    flex: 1,
    minWidth: 260,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  cfAdvisorBody: {
    gap: 10,
  },
  cfInsightBlock: {
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderRadius: 7,
    padding: 10,
  },
  cfInsightIcon: {
    marginTop: 2,
  },
  cfInsightContent: {
    flex: 1,
    gap: 2,
  },
  cfInsightTitle: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  cfInsightText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    lineHeight: 15,
  },
});
