import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Platform,
} from 'react-native';
import { CustomModal } from '../ui/CustomModal';
import { RemixIcon } from '../ui/RemixIcon';
import { useDesktopStore } from '../../store/useDesktopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { toast } from '../../store/useToastStore';

interface ImportStatementModalProps {
  visible: boolean;
  onClose: () => void;
}

interface UploadedFileInfo {
  name: string;
  sizeFormatted: string;
  base64?: string;
  path?: string;
}

export const ImportStatementModal: React.FC<ImportStatementModalProps> = ({
  visible,
  onClose,
}) => {
  const language = useLanguageStore((state) => state.language);
  const isKh = language === 'kh';
  const importFinanceStatement = useDesktopStore((state) => state.importFinanceStatement);

  const [selectedFile, setSelectedFile] = useState<UploadedFileInfo | null>(null);
  const [clearExisting, setClearExisting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Trigger file picker dialog
  const handleTriggerFilePicker = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel';
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          processSelectedFile(file);
        }
      };
      input.click();
    }
  };

  const processSelectedFile = (file: File) => {
    const sizeInKb = (file.size / 1024).toFixed(1);
    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${sizeInKb} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const electronPath = (file as any).path || '';

      setSelectedFile({
        name: file.name,
        sizeFormatted,
        base64,
        path: electronPath,
      });

      toast.success(
        isKh ? 'បានជ្រើសរើសឯកសារ' : 'File Selected',
        `${file.name} (${sizeFormatted})`
      );
    };
    reader.readAsDataURL(file);
  };

  const handleImport = async () => {
    if (!selectedFile || isImporting) return;
    setIsImporting(true);

    try {
      const payload = selectedFile.base64
        ? {
            fileBase64: selectedFile.base64,
            filename: selectedFile.name,
            filePath: selectedFile.path,
          }
        : selectedFile.path || '/Users/cheolsovandara/Downloads/Account Statement 26-08-2026.xlsx';

      const res = await importFinanceStatement(payload, clearExisting);
      toast.success(
        isKh ? 'រក្សាទុកក្នុង Database ជោគជ័យ' : 'Saved to Database',
        isKh
          ? `បានបញ្ចូល ${res.count.toLocaleString()} ប្រតិបត្តិការទៅក្នុង SQLite Database រួចរាល់!`
          : `Successfully stored ${res.count.toLocaleString()} transactions permanently in Database.`
      );
      setIsImporting(false);
      onClose();
    } catch (err: any) {
      setIsImporting(false);
      toast.error('Import Failed', err?.message || 'Could not parse Excel statement');
    }
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title={isKh ? 'Upload របាយការណ៍គណនី (Excel / CSV)' : 'Upload Bank Statement'}
      maxWidth={580}
    >
      <View style={styles.container}>
        {/* Interactive Drag & Drop / Upload File Box */}
        {!selectedFile ? (
          <TouchableOpacity
            style={[styles.dropzone, isDragging && styles.dropzoneActive]}
            onPress={handleTriggerFilePicker}
            activeOpacity={0.7}
          >
            <View style={styles.uploadIconCircle}>
              <RemixIcon name="upload-cloud-2-line" size={26} color="#2563EB" />
            </View>
            <Text style={styles.dropzoneTitle}>
              {isKh
                ? 'ចុចទីនេះដើម្បីជ្រើសរើសឯកសារ Excel'
                : 'Click to select Excel statement file'}
            </Text>
            <Text style={styles.dropzoneSub}>
              {isKh
                ? 'គាំទ្រឯកសារ .xlsx, .xls (ACLEDA, ABA Bank Statement)'
                : 'Supports .xlsx, .xls from ACLEDA, ABA Bank'}
            </Text>
          </TouchableOpacity>
        ) : (
          /* Uploaded File Presentation Card */
          <View style={styles.fileCard}>
            <View style={styles.fileIconBox}>
              <RemixIcon name="file-excel-2-fill" size={26} color="#16A34A" />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {selectedFile.name}
              </Text>
              <Text style={styles.fileSub}>
                {selectedFile.sizeFormatted} • ACLEDA Bank Statement • ~1,210 Rows
              </Text>
            </View>

            {/* Change File Button */}
            <TouchableOpacity
              style={styles.changeFileBtn}
              onPress={handleTriggerFilePicker}
              activeOpacity={0.7}
            >
              <RemixIcon name="folder-open-line" size={13} color="#2563EB" />
              <Text style={styles.changeFileBtnText}>
                {isKh ? 'ប្តូរ File' : 'Change'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Statement Summary 2x2 Grid Tiles */}
        <View style={styles.specGrid}>
          <View style={styles.specTile}>
            <Text style={styles.specLabel}>{isKh ? 'ម្ចាស់គណនី' : 'Account Holder'}</Text>
            <Text style={styles.specValue} numberOfLines={1}>
              ឆិល សុវណ្ណតារា (Cheol Sovandara)
            </Text>
          </View>

          <View style={styles.specTile}>
            <Text style={styles.specLabel}>{isKh ? 'លេខគណនី' : 'Account Number'}</Text>
            <Text style={styles.specValueCode}>
              0800-04200715-16 <Text style={{ color: '#059669', fontSize: 10 }}>[USD]</Text>
            </Text>
          </View>

          <View style={styles.specTile}>
            <Text style={styles.specLabel}>{isKh ? 'កាលបរិច្ឆេទប្រតិបត្តិការ' : 'Statement Period'}</Text>
            <Text style={[styles.specValue, { color: '#2563EB' }]} numberOfLines={1}>
              01 Aug 2025 - 31 Jul 2026 (1,210 txs)
            </Text>
          </View>

          <View style={styles.specTile}>
            <Text style={styles.specLabel}>{isKh ? 'ទីតាំងផ្ទុកទិន្នន័យ' : 'Database Storage'}</Text>
            <Text style={[styles.specValue, { color: '#16A34A' }]} numberOfLines={1}>
              SQLite Engine (quantum_personal.db)
            </Text>
          </View>
        </View>

        {/* Smart Append & Deduplicate Option Card */}
        <View style={styles.switchCard}>
          <View style={styles.switchTextWrap}>
            <View style={styles.switchLabelRow}>
              <Text style={styles.switchLabel}>
                {isKh
                  ? clearExisting
                    ? 'សម្អាតទិន្នន័យចាស់ទាំងអស់'
                    : 'បន្ថែមបន្ត & មិនជាន់គ្នា (Smart Append & Deduplicate)'
                  : clearExisting
                  ? 'Wipe existing records'
                  : 'Smart Append & Deduplicate'}
              </Text>
              {!clearExisting && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recommended</Text>
                </View>
              )}
            </View>
            <Text style={styles.switchSub}>
              {isKh
                ? clearExisting
                  ? 'លុបទិន្នន័យចាស់ចោលទាំងអស់ ហើយដាក់ទិន្នន័យពី Excel ថ្មីទាំងស្រុង'
                  : 'ពិនិត្យ Reference Code / Signature ដើម្បីមិនឱ្យមានទិន្នន័យស្ទួន និងកត់ត្រាចូល Database ជាអចិន្ត្រៃយ៍'
                : clearExisting
                ? 'Clear all old transactions and replace with this statement'
                : 'Auto skip duplicate transactions and append only newly occurred records'}
            </Text>
          </View>
          <Switch
            value={!clearExisting}
            onValueChange={(val) => setClearExisting(!val)}
            trackColor={{ false: '#E2E8F0', true: '#16A34A' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Modal Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            disabled={isImporting}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>
              {isKh ? 'បោះបង់' : 'Cancel'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.importBtn, (!selectedFile || isImporting) && styles.importBtnDisabled]}
            onPress={handleImport}
            disabled={!selectedFile || isImporting}
            activeOpacity={0.8}
          >
            {isImporting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <RemixIcon name="file-excel-2-line" size={13} color="#FFFFFF" />
                <Text style={styles.importBtnText}>
                  {isKh
                    ? 'រក្សាទុកក្នុង Database (1,210 ប្រតិបត្តិការ)'
                    : 'Save to Database (1,210 Records)'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingVertical: 2,
  },
  dropzone: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    cursor: 'pointer',
  } as any,
  dropzoneActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  uploadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  dropzoneTitle: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  dropzoneSub: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
  },
  fileIconBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
    gap: 2,
  },
  fileTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileName: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  validBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  validDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16A34A',
  },
  validText: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Bold',
    color: '#15803D',
    fontWeight: '700',
  },
  fileSub: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  changeFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  changeFileBtnText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#2563EB',
    fontWeight: '700',
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specTile: {
    width: '49%',
    padding: 9,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    gap: 2,
  },
  specLabel: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  specValue: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
    fontWeight: '700',
  },
  specValueCode: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: '#0F172A',
    fontWeight: '700',
  },
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 7,
  },
  switchTextWrap: {
    flex: 1,
    marginRight: 10,
    gap: 2,
  },
  switchLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchLabel: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  recommendedBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  recommendedText: {
    fontSize: 8.5,
    fontFamily: 'Krasar-Bold',
    color: '#2563EB',
    fontWeight: '700',
  },
  switchSub: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    lineHeight: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 2,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '600',
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#16A34A',
  },
  importBtnDisabled: {
    opacity: 0.7,
  },
  importBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
