import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useDesktopStore } from '../../../store/useDesktopStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { RemixIcon } from '../../ui/RemixIcon';
import { DesktopPagination } from '../../ui/DesktopPagination';
import { CustomTextInput } from '../../ui/CustomTextInput';

export const PersonalFinanceModule: React.FC = () => {
  const t = useLanguageStore((state) => state.t);
  const finances = useDesktopStore((state) => state.finances);
  const logExpenseWithAi = useDesktopStore((state) => state.logExpenseWithAi);
  const createFinanceRecord = useDesktopStore((state) => state.createFinanceRecord);
  const deleteFinanceRecord = useDesktopStore((state) => state.deleteFinanceRecord);

  const [aiInput, setAiInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const totalIncome = finances
    .filter((f) => f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpense = finances
    .filter((f) => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);

  const netSavings = totalIncome - totalExpense;

  const filteredFinances = finances.filter((f) => {
    if (filterType === 'all') return true;
    return f.type === filterType;
  });

  const paginatedFinances = filteredFinances.slice((page - 1) * pageSize, page * pageSize);

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
      {/* Top Header / Stats Rail */}
      <View style={styles.statsRail}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t.finBalance}</Text>
          <Text style={[styles.statValue, { color: netSavings >= 0 ? '#0F172A' : '#EF4444' }]}>
            ${netSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t.finIncome}</Text>
          <Text style={[styles.statValue, { color: '#059669' }]}>
            +${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t.finExpense}</Text>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>
            -${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
          icon="bank-card-line"
          size="md"
          rightElement={
            <Pressable
              style={[styles.aiButton, (!aiInput.trim() || isProcessing) && styles.aiButtonDisabled]}
              onPress={handleAiLog}
              disabled={!aiInput.trim() || isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.aiButtonText}>Log Entry</Text>
              )}
            </Pressable>
          }
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
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

      {/* Transactions List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={[styles.listContent, filteredFinances.length === 0 && styles.listContentEmpty]}
        showsVerticalScrollIndicator={false}
      >
        {filteredFinances.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <RemixIcon name="bank-card-line" size={24} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Transactions Recorded</Text>
            <Text style={styles.emptySub}>
              Use the AI input bar above to log your first income or expense effortlessly.
            </Text>
          </View>
        ) : (
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 2 }]}>NOTE / DESCRIPTION</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>CATEGORY</Text>
              <Text style={[styles.th, { flex: 1 }]}>DATE</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>AMOUNT</Text>
              <Text style={[styles.th, { width: 40, textAlign: 'center' }]}></Text>
            </View>

            {paginatedFinances.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <View style={[styles.tdCell, { flex: 2 }]}>
                  <Text style={styles.noteText} numberOfLines={1}>{item.note}</Text>
                </View>

                <View style={[styles.tdCell, { flex: 1.2 }]}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                </View>

                <View style={[styles.tdCell, { flex: 1 }]}>
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>

                <View style={[styles.tdCell, { flex: 1, alignItems: 'flex-end' }]}>
                  <Text
                    style={[
                      styles.amountText,
                      { color: item.type === 'income' ? '#059669' : '#EF4444' },
                    ]}
                  >
                    {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
                  </Text>
                </View>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => deleteFinanceRecord(item.id)}
                >
                  <RemixIcon name="more-2-fill" size={13} color="#94A3B8" />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Pagination */}
      <DesktopPagination
        currentPage={page}
        totalItems={filteredFinances.length}
        itemsPerPage={pageSize}
        onPageChange={setPage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  statsRail: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
  },
  statLabel: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#64748B',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'KantumruyPro-Bold',
    fontWeight: '800',
    marginTop: 4,
  },
  aiCaptureBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  aiInputContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  aiButton: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 5,
  },
  aiButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  aiButtonText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    padding: 2,
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  tabText: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#0F172A',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 20,
    gap: 8,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontFamily: 'KantumruyPro-Bold',
    color: '#0F172A',
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 320,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  th: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#64748B',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tdCell: {
    justifyContent: 'center',
  },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    color: '#475569',
    fontWeight: '600',
  },
  noteText: {
    fontSize: 12,
    fontFamily: 'Krasar-Regular',
    color: '#0F172A',
  },
  dateText: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  amountText: {
    fontSize: 12.5,
    fontFamily: 'KantumruyPro-Bold',
    fontWeight: '700',
  },
  deleteButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
