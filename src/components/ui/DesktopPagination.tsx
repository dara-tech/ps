import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {/* 1. Left: Summary Counter */}
      <View style={styles.leftSummary}>
        <Text style={styles.summaryText}>
          Showing <Text style={styles.summaryHighlight}>{startItem}-{endItem}</Text> of{' '}
          <Text style={styles.summaryHighlight}>{totalItems}</Text> items
        </Text>
      </View>

      {/* 2. Right: Page Navigation Pills */}
      <View style={styles.pageGroup}>
        {/* Previous Button */}
        <TouchableOpacity
          style={[styles.arrowBtn, currentPage === 1 && styles.arrowBtnDisabled]}
          onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          activeOpacity={0.7}
        >
          <RemixIcon
            name="chevron-left-line"
            size={13}
            color={currentPage === 1 ? '#CBD5E1' : '#475569'}
          />
        </TouchableOpacity>

        {/* Number Pills */}
        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <TouchableOpacity
              key={p}
              style={[styles.pageBtn, isActive && styles.pageBtnActive]}
              onPress={() => onPageChange(p)}
              activeOpacity={0.75}
            >
              <Text style={[styles.pageText, isActive && styles.pageTextActive]}>{p}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.arrowBtn, currentPage === totalPages && styles.arrowBtnDisabled]}
          onPress={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          activeOpacity={0.7}
        >
          <RemixIcon
            name="chevron-right-line"
            size={13}
            color={currentPage === totalPages ? '#CBD5E1' : '#475569'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 36,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAECF0',
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
    color: '#64748B',
  },
  summaryHighlight: {
    fontFamily: 'KantumruyPro-Bold',
    color: '#0F172A',
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBtnDisabled: {
    opacity: 0.5,
    backgroundColor: '#FFFFFF',
  },
  pageBtn: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnActive: {
    backgroundColor: '#0F172A',
  },
  pageText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
  },
  pageTextActive: {
    color: '#FFFFFF',
  },
});
