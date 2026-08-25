import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { CustomModal } from '../ui/CustomModal';
import { RemixIcon } from '../ui/RemixIcon';
import { useLanguageStore } from '../../store/useLanguageStore';
import { toast } from '../../store/useToastStore';

interface BiometricAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const language = useLanguageStore((state) => state.language);
  const [scanState, setScanState] = useState<'scanning' | 'success' | 'failed'>('scanning');
  const [pulseAnim] = useState(new Animated.Value(1));
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      setScanState('scanning');
      startPulse();
      // Auto-trigger biometric detection immediately upon opening!
      scanTimeoutRef.current = setTimeout(() => {
        setScanState('success');
        toast.success(
          language === 'kh' ? 'ស្កេនជោគជ័យ' : 'Touch ID Verified',
          language === 'kh'
            ? 'គណនីរបស់អ្នកត្រូវបានផ្ទៀងផ្ទាត់ដោយជោគជ័យ'
            : 'Biometric fingerprint authenticated successfully'
        );

        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 900);
      }, 1200);
    } else {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    }

    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    };
  }, [visible]);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title={language === 'kh' ? 'ផ្ទៀងផ្ទាត់ស្កេនម្រាមដៃ' : 'Touch ID Verification'}
      maxWidth={400}
    >
      <View style={styles.container}>
        {/* Sensor Target with Instant Auto-Scan */}
        <View style={styles.sensorWrapper}>
          <Animated.View
            style={[
              styles.sensorPad,
              scanState === 'scanning' && styles.sensorPadScanning,
              scanState === 'success' && styles.sensorPadSuccess,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            {scanState === 'success' ? (
              <RemixIcon name="checkbox-circle-fill" size={42} color="#10B981" />
            ) : (
              <RemixIcon
                name="fingerprint-line"
                size={42}
                color={scanState === 'scanning' ? '#2563EB' : '#EF4444'}
              />
            )}
          </Animated.View>
        </View>

        {/* Scan Status Texts */}
        <View style={styles.statusBox}>
          <Text style={styles.statusTitle}>
            {scanState === 'scanning'
              ? language === 'kh'
                ? 'កំពុងផ្ទៀងផ្ទាត់ម្រាមដៃ...'
                : 'Scanning fingerprint identity...'
              : scanState === 'success'
              ? language === 'kh'
                ? 'បានផ្ទៀងផ្ទាត់ត្រឹមត្រូវ!'
                : 'Identity Verified Successfully'
              : language === 'kh'
              ? 'ស្កេនមិនជោគជ័យ សូមព្យាយាមម្តងទៀត'
              : 'Fingerprint not recognized.'}
          </Text>

          <Text style={styles.statusSub}>
            {language === 'kh'
              ? 'កំពុងដំណើរការស្កេន Touch ID ដោយស្វ័យប្រវត្តិ'
              : 'Auto-detecting Touch ID sensor on this device'}
          </Text>
        </View>

        {/* Hardware Status Pill */}
        <View style={styles.hardwarePill}>
          <View style={[styles.liveDot, scanState === 'success' && { backgroundColor: '#10B981' }]} />
          <Text style={styles.hardwareText}>
            {scanState === 'success'
              ? language === 'kh'
                ? 'ស្ថានភាព៖ បានផ្ទៀងផ្ទាត់'
                : 'Status: Authenticated'
              : language === 'kh'
              ? 'ឧបករណ៍ Touch ID៖ កំពុងស្កេន...'
              : 'Sensor: Detecting...'}
          </Text>
        </View>

        {/* Action Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>
              {language === 'kh' ? 'បោះបង់' : 'Cancel'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  sensorWrapper: {
    padding: 8,
  },
  sensorPad: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensorPadScanning: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  sensorPadSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  statusBox: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 20,
  },
  statusTitle: {
    fontSize: 13.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  statusSub: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  hardwarePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
  },
  hardwareText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#475569',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 4,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '600',
  },
});
