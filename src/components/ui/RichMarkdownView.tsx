import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { RemixIcon } from './RemixIcon';
import { toast } from '../../store/useToastStore';

interface RichMarkdownViewProps {
  content: string;
  isUser?: boolean;
}

export const RichMarkdownView: React.FC<RichMarkdownViewProps> = ({ content, isUser = false }) => {
  if (isUser) {
    return <Text style={styles.userText}>{content}</Text>;
  }

  // Parse lines into structured blocks
  const blocks = parseMarkdownBlocks(content);

  return (
    <View style={styles.container}>
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return <CodeBlock key={idx} language={block.language || 'text'} code={block.text} />;
        }

        if (block.type === 'h1') {
          return (
            <Text key={idx} style={styles.h1}>
              {renderFormattedInline(block.text)}
            </Text>
          );
        }

        if (block.type === 'h2') {
          return (
            <Text key={idx} style={styles.h2}>
              {renderFormattedInline(block.text)}
            </Text>
          );
        }

        if (block.type === 'h3') {
          return (
            <Text key={idx} style={styles.h3}>
              {renderFormattedInline(block.text)}
            </Text>
          );
        }

        if (block.type === 'bullet') {
          return (
            <View key={idx} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{renderFormattedInline(block.text)}</Text>
            </View>
          );
        }

        if (block.type === 'numbered') {
          return (
            <View key={idx} style={styles.bulletRow}>
              <Text style={styles.numberedIndex}>{block.index}.</Text>
              <Text style={styles.bulletText}>{renderFormattedInline(block.text)}</Text>
            </View>
          );
        }

        if (block.type === 'quote') {
          return (
            <View key={idx} style={styles.quoteBox}>
              <Text style={styles.quoteText}>{renderFormattedInline(block.text)}</Text>
            </View>
          );
        }

        if (block.type === 'divider') {
          return <View key={idx} style={styles.divider} />;
        }

        // Standard paragraph
        return (
          <Text key={idx} style={styles.paragraph} selectable={true}>
            {renderFormattedInline(block.text)}
          </Text>
        );
      })}
    </View>
  );
};

interface Block {
  type: 'paragraph' | 'h1' | 'h2' | 'h3' | 'bullet' | 'numbered' | 'quote' | 'code' | 'divider';
  text: string;
  language?: string;
  index?: number;
}

function parseMarkdownBlocks(raw: string): Block[] {
  const lines = raw.split(/\r?\n/);
  const blocks: Block[] = [];
  let inCode = false;
  let codeLang = '';
  let codeBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCode) {
        blocks.push({
          type: 'code',
          text: codeBuffer.join('\n'),
          language: codeLang || 'text',
        });
        inCode = false;
        codeBuffer = [];
        codeLang = '';
      } else {
        inCode = true;
        codeLang = line.trim().replace(/^```/, '').trim();
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    // Markdown horizontal divider rule (---, ***, ___)
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: 'divider', text: '' });
      continue;
    }

    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', text: trimmed.slice(2).trim() });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.slice(3).trim() });
    } else if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.slice(4).trim() });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      blocks.push({ type: 'bullet', text: trimmed.replace(/^[-*•]\s+/, '') });
    } else if (/^\d+\.\s+/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (match) {
        blocks.push({ type: 'numbered', index: parseInt(match[1], 10), text: match[2] });
      } else {
        blocks.push({ type: 'paragraph', text: trimmed });
      }
    } else if (trimmed.startsWith('> ')) {
      blocks.push({ type: 'quote', text: trimmed.slice(2).trim() });
    } else {
      blocks.push({ type: 'paragraph', text: line });
    }
  }

  if (inCode && codeBuffer.length > 0) {
    blocks.push({
      type: 'code',
      text: codeBuffer.join('\n'),
      language: codeLang || 'text',
    });
  }

  return blocks;
}

/**
 * Parses inline formatting like **bold**, *italic*, `inline code`, and plain text
 */
function renderFormattedInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Tokenize regex: `code`, **bold**, *italic*
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const tokens = text.split(regex);

  tokens.forEach((token, index) => {
    if (!token) return;

    if (token.startsWith('`') && token.endsWith('`') && token.length > 1) {
      parts.push(
        <Text key={index} style={styles.inlineCode}>
          {token.slice(1, -1)}
        </Text>
      );
    } else if (token.startsWith('**') && token.endsWith('**') && token.length > 3) {
      parts.push(
        <Text key={index} style={styles.boldText}>
          {token.slice(2, -2)}
        </Text>
      );
    } else if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      parts.push(
        <Text key={index} style={styles.italicText}>
          {token.slice(1, -1)}
        </Text>
      );
    } else {
      parts.push(<Text key={index}>{token}</Text>);
    }
  });

  return parts;
}

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const handleCopy = () => {
    if (Platform.OS === 'web' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    toast.success('Copied', 'Code copied to clipboard');
  };

  return (
    <View style={styles.codeContainer}>
      <View style={styles.codeHeader}>
        <Text style={styles.codeLangText}>{language.toUpperCase() || 'CODE'}</Text>
        <TouchableOpacity style={styles.codeCopyBtn} onPress={handleCopy} activeOpacity={0.7}>
          <RemixIcon name="file-copy-line" size={11} color="#94A3B8" />
          <Text style={styles.codeCopyText}>Copy</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.codeScroll}>
        <Text style={styles.codeText} selectable={true}>
          {code}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 7,
  },
  userText: {
    fontSize: 12.5,
    lineHeight: 20,
    color: '#F8FAFC',
    fontFamily: 'Krasar-Regular',
  },
  paragraph: {
    fontSize: 12.5,
    lineHeight: 21,
    color: '#1E293B',
    fontFamily: 'Krasar-Regular',
  },
  boldText: {
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  italicText: {
    fontStyle: 'italic',
    color: '#334155',
  },
  inlineCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11.5,
    backgroundColor: '#F1F5F9',
    color: '#0F172A',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  h1: {
    fontSize: 15,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
    marginBottom: 2,
  },
  h2: {
    fontSize: 13.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
    marginBottom: 2,
  },
  h3: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 3,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    paddingLeft: 4,
    marginVertical: 1,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#64748B',
    marginTop: 8,
  },
  numberedIndex: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    minWidth: 16,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 20,
    color: '#1E293B',
    fontFamily: 'Krasar-Regular',
  },
  quoteBox: {
    borderLeftWidth: 3,
    borderLeftColor: '#CBD5E1',
    paddingLeft: 10,
    marginVertical: 3,
  },
  quoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 19,
    color: '#475569',
    fontFamily: 'Krasar-Regular',
  },
  codeContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 6,
    marginVertical: 6,
    overflow: 'hidden',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  codeLangText: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  codeCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  codeCopyText: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontFamily: 'Krasar-Regular',
  },
  codeScroll: {
    padding: 10,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11.5,
    lineHeight: 18,
    color: '#E2E8F0',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
});

