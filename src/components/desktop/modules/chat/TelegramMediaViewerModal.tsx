import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { RemixIcon } from '../../../ui/RemixIcon';
import { ModernAvatar } from '../../../ui/ModernAvatar';
import { useDesktopStore } from '../../../../store/useDesktopStore';
import { downloadTelegramFile } from './chatHelpers';

export interface TelegramMediaItem {
  url: string;
  thumbUrl?: string;
  isVideo?: boolean;
}

interface TelegramMediaViewerModalProps {
  visible: boolean;
  onClose: () => void;
  items: TelegramMediaItem[];
  initialIndex?: number;
  chatName?: string;
  chatAvatar?: string;
  timestamp?: string;
}

export const TelegramMediaViewerModal: React.FC<TelegramMediaViewerModalProps> = ({
  visible,
  onClose,
  items,
  initialIndex = 0,
  chatName = 'Media',
  chatAvatar,
  timestamp,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Automatically hide top navbar when media viewer is active and restore when closed
  useEffect(() => {
    if (!visible) return;
    const prevNavState = useDesktopStore.getState().isTopNavVisible;
    if (prevNavState) {
      useDesktopStore.setState({ isTopNavVisible: false });
    }
    return () => {
      if (prevNavState) {
        useDesktopStore.setState({ isTopNavVisible: true });
      }
    };
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, items.length - 1)));
      setZoomLevel(1);
    }
  }, [visible, initialIndex, items.length]);

  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setZoomLevel(1);
    }
  }, [currentIndex, items.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setZoomLevel(1);
    }
  }, [currentIndex]);

  const handleZoomToggle = () => {
    setZoomLevel((prev) => (prev >= 2 ? 1 : prev + 0.5));
  };

  const handleDownload = () => {
    const activeItem = items[currentIndex];
    if (!activeItem) return;
    const fileName = activeItem.isVideo ? 'telegram_video.mp4' : 'telegram_photo.jpg';
    downloadTelegramFile(activeItem.url, fileName);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, handleNext, handlePrev, onClose]);

  if (!visible || items.length === 0) return null;

  const currentItem = items[currentIndex] || items[0];
  const isVideo = currentItem?.isVideo || currentItem?.url.toLowerCase().includes('.mp4') || currentItem?.url.toLowerCase().includes('.webm');

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.94)',
        zIndex: 999999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
      onClick={onClose}
    >
      {/* Top Right Close Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={{
          position: 'absolute',
          top: 16,
          right: 20,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#FFFFFF',
          zIndex: 10000001,
          outline: 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <RemixIcon name="close-line" size={20} color="#FFFFFF" />
      </button>

      {/* Main Centered Media Container */}
      <div
        style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 80px 100px 80px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <video
            key={currentItem.url}
            src={currentItem.url}
            controls
            autoPlay
            style={{
              maxWidth: '85vw',
              maxHeight: '75vh',
              borderRadius: 8,
              outline: 'none',
              backgroundColor: '#000000',
            }}
          />
        ) : (
          <img
            key={currentItem.url}
            src={currentItem.url}
            alt="Telegram Media"
            style={{
              maxWidth: '88vw',
              maxHeight: '75vh',
              objectFit: 'contain',
              borderRadius: 6,
              transform: `scale(${zoomLevel})`,
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: zoomLevel > 1 ? 'zoom-out' : 'zoom-in',
            }}
            onClick={handleZoomToggle}
          />
        )}
      </div>

      {/* Left Chevron Nav Button */}
      {currentIndex > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          style={{
            position: 'absolute',
            left: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: 'rgba(30, 30, 30, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#FFFFFF',
            zIndex: 10000001,
            outline: 'none',
            transition: 'background-color 0.15s ease',
          }}
        >
          <RemixIcon name="arrow-left-line" size={24} color="#FFFFFF" />
        </button>
      )}

      {/* Right Chevron Nav Button */}
      {currentIndex < items.length - 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          style={{
            position: 'absolute',
            right: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: 'rgba(30, 30, 30, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#FFFFFF',
            zIndex: 10000001,
            outline: 'none',
            transition: 'background-color 0.15s ease',
          }}
        >
          <RemixIcon name="arrow-right-line" size={24} color="#FFFFFF" />
        </button>
      )}

      {/* Telegram Floating Bottom Dock Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: '92vw',
          height: 64,
          backgroundColor: 'rgba(24, 24, 27, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.14)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '0 16px',
          zIndex: 10000002,
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Chat Avatar & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 160, maxWidth: 220 }}>
          <ModernAvatar name={chatName} avatarUrl={chatAvatar} size={36} />
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span
              style={{
                fontSize: 12.5,
                fontFamily: 'Krasar-Bold',
                fontWeight: 700,
                color: '#F8FAFC',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {chatName}
            </span>
            {timestamp && (
              <span
                style={{
                  fontSize: 10.5,
                  fontFamily: 'Krasar-Regular',
                  color: '#94A3B8',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {timestamp}
              </span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 32, backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />

        {/* Center: Album Thumbnails Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            overflowX: 'auto',
            maxWidth: 420,
            padding: '4px 0',
          }}
        >
          {items.map((item, idx) => {
            const isActive = idx === currentIndex;
            const thumbSrc = item.thumbUrl || item.url;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setZoomLevel(1);
                }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 6,
                  border: isActive ? '2px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.15)',
                  opacity: isActive ? 1 : 0.5,
                  padding: 0,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  backgroundColor: '#0F172A',
                  position: 'relative',
                  flexShrink: 0,
                  outline: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <img
                  src={thumbSrc}
                  alt={`Thumb ${idx}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {item.isVideo && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <RemixIcon name="play-fill" size={12} color="#FFFFFF" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 32, backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />

        {/* Right: Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {!isVideo && (
            <button
              type="button"
              onClick={handleZoomToggle}
              title={zoomLevel > 1 ? 'Zoom Out' : 'Zoom In'}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#FFFFFF',
                outline: 'none',
              }}
            >
              <RemixIcon name={(zoomLevel > 1 ? 'eye-off-line' : 'eye-line') as any} size={17} color="#FFFFFF" />
            </button>
          )}

          <button
            type="button"
            onClick={handleDownload}
            title="Download Media"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
              outline: 'none',
            }}
          >
            <RemixIcon name="download-line" size={17} color="#FFFFFF" />
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
