import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { CustomModal } from '../ui/CustomModal';
import { RemixIcon } from '../ui/RemixIcon';
import { useLanguageStore } from '../../store/useLanguageStore';

interface PersonalContextEditorModalProps {
  visible: boolean;
  onClose: () => void;
  initialValue: string;
  onSave: (newContent: string) => void;
}

interface ToolAction {
  id: string;
  label: string;
  tooltip: string;
  prefix: string;
  suffix: string;
  placeholder?: string;
}

const TOOLBAR_ACTIONS: ToolAction[] = [
  { id: 'bold', label: 'B', tooltip: 'Bold (**text**)', prefix: '**', suffix: '**', placeholder: 'bold text' },
  { id: 'italic', label: 'I', tooltip: 'Italic (*text*)', prefix: '*', suffix: '*', placeholder: 'italic text' },
  { id: 'h1', label: 'H1', tooltip: 'Heading 1 (# Title)', prefix: '# ', suffix: '', placeholder: 'Heading 1' },
  { id: 'h2', label: 'H2', tooltip: 'Heading 2 (## Section)', prefix: '## ', suffix: '', placeholder: 'Heading 2' },
  { id: 'bullet', label: '• List', tooltip: 'Bullet List (- Item)', prefix: '- ', suffix: '', placeholder: 'List item' },
  { id: 'num', label: '1. List', tooltip: 'Numbered List (1. Item)', prefix: '1. ', suffix: '', placeholder: 'Numbered item' },
  { id: 'task', label: '☑ Task', tooltip: 'Checklist (- [ ] Task)', prefix: '- [ ] ', suffix: '', placeholder: 'Action item' },
  { id: 'quote', label: '❝ Quote', tooltip: 'Blockquote (> Note)', prefix: '> ', suffix: '', placeholder: 'Important note' },
  { id: 'code', label: '<Code>', tooltip: 'Code Block (```)', prefix: '```ts\n', suffix: '\n```', placeholder: '// write code here' },
  { id: 'divider', label: '— Line', tooltip: 'Divider (---)', prefix: '\n---\n', suffix: '' },
];

const TEMPLATES = [
  {
    title: 'Developer Profile',
    icon: 'user-line' as const,
    content: `## Developer Identity & Stack
- Role: Lead Software Architect & Full-Stack Engineer
- Primary Stack: Expo (React Native), TypeScript, Node.js, Electron, PostgreSQL
- Coding Style: Clean architecture, modular hooks, type-safe API contracts`,
  },
  {
    title: 'Strict Design Rules',
    icon: 'sparkles-fill' as const,
    content: `## Strict Design Constraints
1. NO SHADOWS AT ALL: Never use shadowColor, elevation, or box-shadow.
2. Crisp 1px Borders: Use border: 1px solid #E2E8F0 (#CBD5E1 for active).
3. Typography: Title-only clean headers, Krasar & Kantumruy Pro fonts.
4. Spacing: 16px standard padding across all main views.`,
  },
  {
    title: 'Business & Goals',
    icon: 'folder-line' as const,
    content: `## 2026 Core Objectives & Milestones
- Objective 1: Production-ready Electron + Mobile packaging.
- Objective 2: Real-time multi-agent Copilot integration.
- Focus: High reliability, offline-first sync, elegant micro-interactions.`,
  },
];

export const PersonalContextEditorModal: React.FC<PersonalContextEditorModalProps> = ({
  visible,
  onClose,
  initialValue,
  onSave,
}) => {
  const language = useLanguageStore((state) => state.language);
  const [content, setContent] = useState(initialValue);
  const inputRef = useRef<TextInput>(null);

  // Sync initialValue when modal opens
  useEffect(() => {
    if (visible) {
      setContent(initialValue);
    }
  }, [visible, initialValue]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const tokenEstimate = Math.ceil(charCount / 4);

  const applyFormatting = (tool: ToolAction) => {
    let start = content.length;
    let end = content.length;

    if (Platform.OS === 'web' && inputRef.current) {
      const domEl = inputRef.current as any;
      if (typeof domEl.selectionStart === 'number') {
        start = domEl.selectionStart;
        end = domEl.selectionEnd;
      }
    }

    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || tool.placeholder || '';
    const newText =
      content.substring(0, start) +
      tool.prefix +
      textToInsert +
      tool.suffix +
      content.substring(end);

    setContent(newText);

    if (Platform.OS === 'web' && inputRef.current) {
      const domEl = inputRef.current as any;
      setTimeout(() => {
        domEl.focus?.();
        const cursorStart = start + tool.prefix.length;
        const cursorEnd = cursorStart + textToInsert.length;
        domEl.setSelectionRange?.(cursorStart, cursorEnd);
      }, 20);
    }
  };

  const handleInsertTemplate = (templateContent: string) => {
    const divider = content.trim() ? '\n\n' : '';
    setContent(content + divider + templateContent);
  };

  const handleSave = () => {
    onSave(content);
    onClose();
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title={language === 'kh' ? 'កែសម្រួល Memory & Guidelines' : 'Edit Memory & Context Guidelines'}
      icon="file-text-line"
      iconColor="#6366F1"
      maxWidth={720}
    >
      <View style={styles.container}>
        {/* Google Docs-like Rich Toolbar (Fixed Height, No Layout Shifts) */}
        <View style={styles.toolbar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarScroll}>
            {TOOLBAR_ACTIONS.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={styles.toolBtn}
                onPress={() => applyFormatting(tool)}
                activeOpacity={0.7}
                // @ts-ignore
                title={tool.tooltip}
              >
                <Text style={styles.toolBtnText}>{tool.label}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.toolbarDivider} />

            {/* Clear All Tool */}
            <TouchableOpacity
              style={[styles.toolBtn, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}
              onPress={() => setContent('')}
              activeOpacity={0.7}
              // @ts-ignore
              title="Clear all text"
            >
              <RemixIcon name="delete-bin-line" size={12} color="#DC2626" />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Quick Starter Templates Bar */}
        <View style={styles.templatesBar}>
          <Text style={styles.templatesLabel}>
            {language === 'kh' ? 'គំរូរហ័ស៖' : 'Quick Templates:'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templatesScroll}>
            {TEMPLATES.map((tmpl) => (
              <TouchableOpacity
                key={tmpl.title}
                style={styles.templateChip}
                onPress={() => handleInsertTemplate(tmpl.content)}
                activeOpacity={0.7}
              >
                <RemixIcon name={tmpl.icon} size={11} color="#6366F1" />
                <Text style={styles.templateChipText}>{tmpl.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Document Editor Body */}
        <View style={styles.editorPaper}>
          <TextInput
            ref={inputRef}
            style={styles.editorInput}
            multiline
            value={content}
            onChangeText={setContent}
            placeholder={
              language === 'kh'
                ? 'សរសេរការណែនាំ និងព័ត៌មានលម្អិតដែលចង់ឱ្យ Gemini AI ចងចាំជានិច្ច (Markdown supported)...'
                : 'Write custom instructions, developer identity, and strict rules that Gemini AI will remember (Markdown supported)...'
            }
            placeholderTextColor="#94A3B8"
            textAlignVertical="top"
          />
        </View>

        {/* Footer with Document Stats & Action Buttons */}
        <View style={styles.footer}>
          <View style={styles.statsRow}>
            <Text style={styles.statItem}>{wordCount} words</Text>
            <Text style={styles.statDot}>•</Text>
            <Text style={styles.statItem}>{charCount} chars</Text>
            <Text style={styles.statDot}>•</Text>
            <Text style={styles.statItem}>~{tokenEstimate} tokens</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>
                {language === 'kh' ? 'បោះបង់' : 'Cancel'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <RemixIcon name="check-line" size={13} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>
                {language === 'kh' ? 'រក្សាទុក & Sync' : 'Save & Sync'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  toolbar: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 4,
    height: 38,
    justifyContent: 'center',
  },
  toolbarScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 2,
  },
  toolBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  } as any,
  toolBtnText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#334155',
  },
  toolbarDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  templatesBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  templatesLabel: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#64748B',
  },
  templatesScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 5,
  },
  templateChipText: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#6D28D9',
  },
  editorPaper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    minHeight: 220,
    maxHeight: 340,
    padding: 12,
  },
  editorInput: {
    flex: 1,
    minHeight: 200,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'Courier',
    color: '#0F172A',
    lineHeight: 18,
    outlineStyle: 'none',
  } as any,
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statItem: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
  },
  statDot: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#64748B',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
