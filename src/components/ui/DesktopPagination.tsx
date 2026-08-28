import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { RemixIcon } from './RemixIcon';

interface DesktopPaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const DesktopPagination: React.FC<DesktopPaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) => {
  const tokens = useThemeStore((state) => state.tokens);
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate smart sliding window of pages (max 7 items)
  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const visiblePages = getVisiblePages();

  return (
    <View style={[styles.container, { backgroundColor: tokens.surfaceBg, borderTopColor: tokens.borderSubtle }]}>
      {/* 1. Left: Summary Counter */}
      <View style={styles.leftSummary}>
        <Text style={[styles.summaryText, { color: tokens.textSecondary }]}>
          Showing <Text style={[styles.summaryHighlight, { color: tokens.textPrimary }]}>{startItem}-{endItem}</Text> of{' '}
          <Text style={[styles.summaryHighlight, { color: tokens.textPrimary }]}>{totalItems}</Text> items
        </Text>
      </View>

      {/* 2. Right: Page Navigation Pills */}
      <View style={styles.pageGroup}>
        {/* Previous Button */}
        <TouchableOpacity
          style={[
            styles.arrowBtn,
            { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle },
            currentPage === 1 && { opacity: 0.4 },
          ]}
          onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          activeOpacity={0.7}
        >
          <RemixIcon
            name="chevron-left-line"
            size={13}
            color={tokens.textSecondary}
          />
        </TouchableOpacity>

        {/* Number Pills & Ellipses */}
        {visiblePages.map((p, idx) => {
          if (p === '...') {
            return (
              <View key={`ellipsis-${idx}`} style={styles.ellipsisBox}>
                <Text style={[styles.ellipsisText, { color: tokens.textMuted }]}>...</Text>
              </View>
            );
          }
          const pageNum = Number(p);
          const isActive = pageNum === currentPage;
          return (
            <TouchableOpacity
              key={pageNum}
              style={[
                styles.pageBtn,
                isActive && { backgroundColor: tokens.accentColor },
              ]}
              onPress={() => onPageChange(pageNum)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.pageText,
                  { color: isActive ? tokens.accentFg : tokens.textSecondary },
                  isActive && { fontFamily: 'Krasar-Bold', fontWeight: '700' },
                ]}
              >
                {pageNum}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Next Button */}
        <TouchableOpacity
          style={[
            styles.arrowBtn,
            { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle },
            currentPage === totalPages && { opacity: 0.4 },
          ]}
          onPress={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          activeOpacity={0.7}
        >
          <RemixIcon
            name="chevron-right-line"
            size={13}
            color={tokens.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 36,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    width: '100%',
  },
  leftSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
  },
  summaryHighlight: {
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  pageGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrowBtn: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtn: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
  },
  ellipsisBox: {
    minWidth: 18,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  ellipsisText: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    letterSpacing: 1,
  },
});
