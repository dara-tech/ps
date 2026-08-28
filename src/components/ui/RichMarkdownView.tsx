import React, { useMemo } from 'react';
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

        if (block.type === 'table') {
          return (
            <TableView
              key={idx}
              headers={block.tableHeaders || []}
              rows={block.tableRows || []}
              alignments={block.tableAlignments || []}
            />
          );
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

        if (block.type === 'h4') {
          return (
            <Text key={idx} style={styles.h4}>
              {renderFormattedInline(block.text)}
            </Text>
          );
        }

        if (block.type === 'h5') {
          return (
            <Text key={idx} style={styles.h5}>
              {renderFormattedInline(block.text)}
            </Text>
          );
        }

        if (block.type === 'h6') {
          return (
            <Text key={idx} style={styles.h6}>
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
  type: 'paragraph' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'bullet' | 'numbered' | 'quote' | 'code' | 'divider' | 'table';
  text: string;
  language?: string;
  index?: number;
  tableHeaders?: string[];
  tableRows?: string[][];
  tableAlignments?: ('left' | 'center' | 'right')[];
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

    // Table detection: current line contains `|` and next line is table divider `| :--- | :--- |`
    if (
      trimmed.includes('|') &&
      i + 1 < lines.length &&
      /^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(lines[i + 1].trim())
    ) {
      const headerLine = trimmed;
      const sepLine = lines[i + 1].trim();

      const parseCells = (rowStr: string) => {
        const rawCells = rowStr.replace(/^\|/, '').replace(/\|$/, '').split('|');
        return rawCells.map((c) => c.trim());
      };

      const tableHeaders = parseCells(headerLine);
      const sepCells = parseCells(sepLine);
      const tableAlignments = sepCells.map((cell) => {
        if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
        if (cell.endsWith(':')) return 'right';
        return 'left';
      }) as ('left' | 'center' | 'right')[];

      const tableRows: string[][] = [];
      i += 2; // skip header and separator

      while (i < lines.length && lines[i].trim().includes('|')) {
        const rowLine = lines[i].trim();
        if (!rowLine) break;
        tableRows.push(parseCells(rowLine));
        i++;
      }
      i--; // step back since loop will increment

      blocks.push({
        type: 'table',
        text: '',
        tableHeaders,
        tableRows,
        tableAlignments,
      });
      continue;
    }

    // Markdown horizontal divider rule (---, ***, ___)
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: 'divider', text: '' });
      continue;
    }

    // Header matching level 1 through 6
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const text = headerMatch[2].trim();
      const type = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      blocks.push({ type, text });
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ') || trimmed.startsWith('+ ')) {
      blocks.push({ type: 'bullet', text: trimmed.replace(/^[-*•+]\s+/, '') });
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
 * Parses inline formatting: `code`, ***bold-italic***, **bold**, *italic*, _italic_
 */
function renderFormattedInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Tokenize regex: `inline code`, ***bold italic***, **bold**, *italic*, _italic_
  const regex = /(`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  const tokens = text.split(regex);

  tokens.forEach((token, index) => {
    if (!token) return;

    if (token.startsWith('`') && token.endsWith('`') && token.length > 1) {
      parts.push(
        <Text key={index} style={styles.inlineCode}>
          {token.slice(1, -1)}
        </Text>
      );
    } else if (token.startsWith('***') && token.endsWith('***') && token.length > 5) {
      parts.push(
        <Text key={index} style={styles.boldItalicText}>
          {token.slice(3, -3)}
        </Text>
      );
    } else if (token.startsWith('**') && token.endsWith('**') && token.length > 3) {
      parts.push(
        <Text key={index} style={styles.boldText}>
          {token.slice(2, -2)}
        </Text>
      );
    } else if (
      (token.startsWith('*') && token.endsWith('*') && token.length > 2) ||
      (token.startsWith('_') && token.endsWith('_') && token.length > 2)
    ) {
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

const TableView: React.FC<{
  headers: string[];
  rows: string[][];
  alignments: ('left' | 'center' | 'right')[];
}> = ({ headers, rows, alignments }) => {
  const colCount = Math.max(headers.length, ...rows.map((r) => r.length), 1);

  // Compute fixed column width for each column index so that all rows and header have the exact same column width
  const colWidths = useMemo(() => {
    return Array.from({ length: colCount }).map((_, cIdx) => {
      const headerLen = (headers[cIdx] || '').length;
      const maxRowLen = rows.reduce((max, r) => Math.max(max, (r[cIdx] || '').length), 0);
      const longestCharCount = Math.max(headerLen, maxRowLen);

      // Proportional width: 8.5px per character + 32px padding, clamped between 120px and 280px
      const calculatedWidth = Math.max(120, Math.min(280, longestCharCount * 8.5 + 32));
      return cIdx === 0 ? Math.max(130, calculatedWidth) : calculatedWidth;
    });
  }, [headers, rows, colCount]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
      <View style={styles.tableContainer}>
        {/* Table Header */}
        <View style={styles.tableHeaderRow}>
          {headers.map((h, idx) => (
            <View
              key={idx}
              style={[
                styles.tableHeaderCell,
                { width: colWidths[idx] },
                idx === headers.length - 1 && { borderRightWidth: 0 },
              ]}
            >
              <Text
                style={[
                  styles.tableHeaderText,
                  { textAlign: alignments[idx] || 'left' },
                ]}
              >
                {renderFormattedInline(h)}
              </Text>
            </View>
          ))}
        </View>

        {/* Table Body Rows */}
        {rows.map((row, rIdx) => (
          <View
            key={rIdx}
            style={[
              styles.tableBodyRow,
              rIdx % 2 === 1 && styles.tableBodyRowAlt,
              rIdx === rows.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            {headers.map((_, cIdx) => {
              const cellVal = row[cIdx] || '';
              return (
                <View
                  key={cIdx}
                  style={[
                    styles.tableBodyCell,
                    { width: colWidths[cIdx] },
                    cIdx === headers.length - 1 && { borderRightWidth: 0 },
                  ]}
                >
                  <Text
                    style={[
                      styles.tableCellText,
                      { textAlign: alignments[cIdx] || 'left' },
                    ]}
                  >
                    {renderFormattedInline(cellVal)}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

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
  boldItalicText: {
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#0F172A',
  },
  inlineCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11.5,
    backgroundColor: '#F1F5F9',
    color: '#0F172A',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  h1: {
    fontSize: 15.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 3,
  },
  h2: {
    fontSize: 14,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
    marginBottom: 2,
  },
  h3: {
    fontSize: 13,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 5,
    marginBottom: 2,
  },
  h4: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 5,
    marginBottom: 2,
  },
  h5: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
    marginBottom: 1,
  },
  h6: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#64748B',
    marginTop: 3,
    marginBottom: 1,
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
  tableScroll: {
    marginVertical: 6,
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableHeaderCell: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    justifyContent: 'center',
    boxSizing: 'border-box' as any,
  },
  tableHeaderText: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  tableBodyRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  tableBodyRowAlt: {
    backgroundColor: '#FAFAFA',
  },
  tableBodyCell: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
    justifyContent: 'center',
    boxSizing: 'border-box' as any,
  },
  tableCellText: {
    fontSize: 12,
    fontFamily: 'Krasar-Regular',
    color: '#334155',
    lineHeight: 18,
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
