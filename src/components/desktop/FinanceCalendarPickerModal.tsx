import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { CustomModal } from '../ui/CustomModal';
import { RemixIcon } from '../ui/RemixIcon';
import { useLanguageStore } from '../../store/useLanguageStore';
import { PersonalFinanceRecord } from '../../../shared';

const KHMER_MONTHS = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];

const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_KH = ['ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហ', 'សុក្រ', 'សៅរ៍', 'អាទិត្យ'];
const DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface FinanceCalendarPickerModalProps {
  visible: boolean;
  onClose: () => void;
  finances: PersonalFinanceRecord[];
  selectedDate: string; // 'all', '24 កក្កដា 2026', 'កក្កដា 2026', etc.
  onSelectDate: (date: string) => void;
}

export const FinanceCalendarPickerModal: React.FC<FinanceCalendarPickerModalProps> = ({
  visible,
  onClose,
  finances,
  selectedDate,
  onSelectDate,
}) => {
  const language = useLanguageStore((state) => state.language);
  const isKh = language === 'kh';

  // Automatically detect the latest year/month from finances, or default to August 2026
  const initialYearMonth = useMemo(() => {
    if (finances.length > 0 && finances[0].date) {
      const firstDate = finances[0].date;
      for (let i = 0; i < KHMER_MONTHS.length; i++) {
        if (firstDate.includes(KHMER_MONTHS[i])) {
          const yearMatch = firstDate.match(/\d{4}/);
          const year = yearMatch ? parseInt(yearMatch[0], 10) : 2026;
          return { monthIndex: i, year };
        }
      }
    }
    return { monthIndex: 7, year: 2026 }; // August 2026
  }, [finances]);

  const [viewYear, setViewYear] = useState(2026);
  const [viewMonthIndex, setViewMonthIndex] = useState(7); // 7 = August (0-indexed)

  // Sync initial month when modal opens
  React.useEffect(() => {
    if (visible) {
      setViewYear(initialYearMonth.year);
      setViewMonthIndex(initialYearMonth.monthIndex);
    }
  }, [visible, initialYearMonth]);

  // Map transactions by Day Number for the currently viewed month
  const currentMonthKhmerName = KHMER_MONTHS[viewMonthIndex];
  const currentMonthEnglishName = ENGLISH_MONTHS[viewMonthIndex];
  const currentMonthDisplay = isKh
    ? `${currentMonthKhmerName} ${viewYear}`
    : `${currentMonthEnglishName} ${viewYear}`;

  const monthTxsByDay = useMemo(() => {
    const map = new Map<number, { count: number; income: number; expense: number; fullDate: string }>();
    
    finances.forEach((f) => {
      // Date is e.g. "24 កក្កដា 2026" or "2026-07-24"
      if (f.date.includes(currentMonthKhmerName) && f.date.includes(String(viewYear))) {
        const parts = f.date.split(' ');
        const dayNum = parseInt(parts[0], 10);
        if (!isNaN(dayNum)) {
          if (!map.has(dayNum)) {
            map.set(dayNum, { count: 0, income: 0, expense: 0, fullDate: f.date });
          }
          const cur = map.get(dayNum)!;
          cur.count += 1;
          if (f.type === 'income') cur.income += f.amount;
          else cur.expense += f.amount;
        }
      } else if (f.date.includes(`${viewYear}-${String(viewMonthIndex + 1).padStart(2, '0')}`)) {
        const parts = f.date.split('-');
        const dayNum = parseInt(parts[2], 10);
        if (!isNaN(dayNum)) {
          if (!map.has(dayNum)) {
            map.set(dayNum, { count: 0, income: 0, expense: 0, fullDate: f.date });
          }
          const cur = map.get(dayNum)!;
          cur.count += 1;
          if (f.type === 'income') cur.income += f.amount;
          else cur.expense += f.amount;
        }
      }
    });

    return map;
  }, [finances, viewMonthIndex, viewYear, currentMonthKhmerName]);

  // Calculate calendar grid (42 cells: Prev month padding, Current month, Next month)
  const firstDayOfWeek = new Date(viewYear, viewMonthIndex, 1).getDay();
  const adjustedFirstDay = (firstDayOfWeek + 6) % 7; // 0 = Monday
  const daysInMonth = new Date(viewYear, viewMonthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonthIndex, 0).getDate();

  const calendarCells: Array<{
    dayNumber: number;
    isCurrentMonth: boolean;
    hasData: boolean;
    data?: { count: number; income: number; expense: number; fullDate: string };
  }> = [];

  // Prev month padding
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    calendarCells.push({
      dayNumber: daysInPrevMonth - i,
      isCurrentMonth: false,
      hasData: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const data = monthTxsByDay.get(d);
    calendarCells.push({
      dayNumber: d,
      isCurrentMonth: true,
      hasData: Boolean(data && data.count > 0),
      data,
    });
  }

  // Next month padding
  const remaining = 42 - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    calendarCells.push({
      dayNumber: d,
      isCurrentMonth: false,
      hasData: false,
    });
  }

  const handlePrevMonth = () => {
    if (viewMonthIndex === 0) {
      setViewMonthIndex(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonthIndex === 11) {
      setViewMonthIndex(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonthIndex((m) => m + 1);
    }
  };

  const monthTotalStats = useMemo(() => {
    let inc = 0;
    let exp = 0;
    let count = 0;
    monthTxsByDay.forEach((v) => {
      inc += v.income;
      exp += v.expense;
      count += v.count;
    });
    return { inc, exp, count, net: inc - exp };
  }, [monthTxsByDay]);

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title={isKh ? 'ជ្រើសរើសកាលបរិច្ឆេទប្រតិបត្តិការ (Date Filter)' : 'Filter by Date & Calendar'}
      maxWidth={480}
    >
      <View style={styles.container}>
        {/* Quick Scope Toolbar with Fast Presets */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickScopeRow}
        >
          <TouchableOpacity
            style={[
              styles.scopeChip,
              selectedDate === 'all' && styles.scopeChipActive,
            ]}
            onPress={() => {
              onSelectDate('all');
              onClose();
            }}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.scopeChipText,
                selectedDate === 'all' && styles.scopeChipTextActive,
              ]}
            >
              {isKh ? 'ទាំងអស់' : 'All Time'}
            </Text>
          </TouchableOpacity>

          {['សីហា 2026', 'កក្កដា 2026', 'មិថុនា 2026', '2026'].map((preset) => {
            const isActive = selectedDate === preset;
            return (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.scopeChip,
                  isActive && styles.scopeChipActive,
                ]}
                onPress={() => {
                  onSelectDate(preset);
                  if (preset === 'សីហា 2026') setViewMonthIndex(7);
                  if (preset === 'កក្កដា 2026') setViewMonthIndex(6);
                  if (preset === 'មិថុនា 2026') setViewMonthIndex(5);
                  onClose();
                }}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.scopeChipText,
                    isActive && styles.scopeChipTextActive,
                  ]}
                >
                  {preset}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Calendar Month Navigation Header */}
        <View style={styles.calendarNavHeader}>
          <TouchableOpacity
            style={styles.navArrowBtn}
            onPress={handlePrevMonth}
            activeOpacity={0.7}
          >
            <RemixIcon name="arrow-left-line" size={13} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.monthDisplayBox}>
            <Text style={styles.monthDisplayText}>{currentMonthDisplay}</Text>
            <Text style={styles.monthTxsCountText}>
              {monthTotalStats.count > 0
                ? `${monthTotalStats.count} txs • Net: ${monthTotalStats.net >= 0 ? '+' : ''}$${monthTotalStats.net.toFixed(0)}`
                : 'No transactions'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.navArrowBtn}
            onPress={handleNextMonth}
            activeOpacity={0.7}
          >
            <RemixIcon name="arrow-right-line" size={13} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Days of Week Header */}
        <View style={styles.weekdaysRow}>
          {(isKh ? DAYS_KH : DAYS_EN).map((day, idx) => (
            <View key={idx} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* 42 Calendar Day Grid */}
        <View style={styles.daysGrid}>
          {calendarCells.map((cell, idx) => {
            const isSelected =
              cell.data?.fullDate === selectedDate ||
              (cell.isCurrentMonth &&
                selectedDate === `${String(cell.dayNumber).padStart(2, '0')} ${currentMonthKhmerName} ${viewYear}`);

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dayCell,
                  !cell.isCurrentMonth && styles.dayCellDimmed,
                  cell.hasData && styles.dayCellHasData,
                  isSelected && styles.dayCellSelected,
                ]}
                disabled={!cell.isCurrentMonth}
                onPress={() => {
                  if (cell.isCurrentMonth) {
                    const formattedDate = `${String(cell.dayNumber).padStart(2, '0')} ${currentMonthKhmerName} ${viewYear}`;
                    onSelectDate(formattedDate);
                    onClose();
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayCellNum,
                    !cell.isCurrentMonth && styles.dayCellNumDimmed,
                    isSelected && styles.dayCellNumSelected,
                  ]}
                >
                  {cell.dayNumber}
                </Text>

                {cell.hasData && cell.data ? (
                  <View style={styles.dayDotBadge}>
                    <View
                      style={[
                        styles.txDot,
                        {
                          backgroundColor:
                            cell.data.income > cell.data.expense ? '#10B981' : '#EF4444',
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.dayBadgeAmtText,
                        {
                          color:
                            cell.data.income > cell.data.expense ? '#059669' : '#DC2626',
                        },
                        isSelected && { color: '#FFFFFF' },
                      ]}
                    >
                      {cell.data.income > cell.data.expense
                        ? `+$${cell.data.income >= 1000 ? (cell.data.income / 1000).toFixed(1) + 'k' : cell.data.income.toFixed(0)}`
                        : `-$${cell.data.expense >= 1000 ? (cell.data.expense / 1000).toFixed(1) + 'k' : cell.data.expense.toFixed(0)}`}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer Actions */}
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={styles.filterMonthBtn}
            onPress={() => {
              onSelectDate(`${currentMonthKhmerName} ${viewYear}`);
              onClose();
            }}
          >
            <RemixIcon name="calendar-line" size={12} color="#2563EB" />
            <Text style={styles.filterMonthBtnText}>
              {isKh
                ? `តម្រងពេញមួយខែ ${currentMonthKhmerName} (${monthTotalStats.count} txs)`
                : `Filter Full Month: ${currentMonthEnglishName}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
          >
            <Text style={styles.closeBtnText}>{isKh ? 'បិទ' : 'Cancel'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingVertical: 2,
  },
  quickScopeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scopeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scopeChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  scopeChipText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#475569',
  },
  scopeChipTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  calendarNavHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  navArrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDisplayBox: {
    alignItems: 'center',
    gap: 1,
  },
  monthDisplayText: {
    fontSize: 13,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  monthTxsCountText: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  weekdaysRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 4,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#64748B',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 48,
    borderWidth: 0.5,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayCellDimmed: {
    opacity: 0.25,
    backgroundColor: '#F8FAFC',
  },
  dayCellHasData: {
    backgroundColor: '#F8FAFC',
  },
  dayCellSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
    borderRadius: 6,
  },
  dayCellNum: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  dayCellNumDimmed: {
    color: '#94A3B8',
  },
  dayCellNumSelected: {
    color: '#FFFFFF',
  },
  dayDotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 1,
  },
  txDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dayBadgeAmtText: {
    fontSize: 8,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  filterMonthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  filterMonthBtnText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#2563EB',
    fontWeight: '700',
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  closeBtnText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
});
