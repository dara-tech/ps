import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { RemixIcon } from '../../../ui/RemixIcon';

interface AddContactModalProps {
  visible: boolean;
  onClose: () => void;
  firstName: string;
  onSetFirstName: (v: string) => void;
  lastName: string;
  onSetLastName: (v: string) => void;
  phone: string;
  onSetPhone: (v: string) => void;
  saving: boolean;
  onSave: () => void;
  isKh: boolean;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  visible,
  onClose,
  firstName,
  onSetFirstName,
  lastName,
  onSetLastName,
  phone,
  onSetPhone,
  saving,
  onSave,
  isKh,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.backdrop}>
      <View style={styles.modalCard}>
        <View style={styles.modalHeader}>
          <View style={styles.headerLeft}>
            <RemixIcon name="user-add-line" size={18} color="#0284C7" />
            <Text style={styles.modalTitle}>
              {isKh ? 'បន្ថែមទំនាក់ទំនងថ្មី' : 'New Contact'}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <RemixIcon name="close-line" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalBody}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{isKh ? 'នាមខ្លួន (First Name) *' : 'First Name *'}</Text>
            <TextInput
              style={styles.modalInput}
              value={firstName}
              onChangeText={onSetFirstName}
              placeholder={isKh ? 'ឧ. Sovandara' : 'e.g. Dara'}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{isKh ? 'គោត្តនាម (Last Name)' : 'Last Name'}</Text>
            <TextInput
              style={styles.modalInput}
              value={lastName}
              onChangeText={onSetLastName}
              placeholder={isKh ? 'ឧ. Cheol' : 'e.g. Smith'}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{isKh ? 'លេខទូរស័ព្ទ (Phone Number) *' : 'Phone Number *'}</Text>
            <TextInput
              style={styles.modalInput}
              value={phone}
              onChangeText={onSetPhone}
              placeholder="+855 12 345 678"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={saving}>
            <Text style={styles.cancelBtnText}>{isKh ? 'បោះបង់' : 'Cancel'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={onSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>{isKh ? 'រក្សាទុក' : 'Save Contact'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  modalCard: {
    width: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 13,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  modalBody: {
    padding: 16,
    gap: 12,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#475569',
  },
  modalInput: {
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    fontSize: 12,
    fontFamily: 'Krasar-Regular',
    color: '#0F172A',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#0284C7',
  },
  saveBtnText: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
