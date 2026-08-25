import { db } from '../../data/db';
import { wsGateway } from '../../core/websocket/websocket.gateway';
import { PersonalFinanceRecord } from '../../../../shared';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

export class FinanceService {
  public getAll(): PersonalFinanceRecord[] {
    return db.finances;
  }

  public create(data: Omit<PersonalFinanceRecord, 'id'>): PersonalFinanceRecord {
    const newRecord: PersonalFinanceRecord = {
      ...data,
      id: `fin-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      date: data.date || new Date().toISOString().split('T')[0],
    };

    db.finances = [newRecord, ...db.finances];

    wsGateway.broadcast({ type: 'FINANCE_RECORD_ADDED', data: newRecord });
    return newRecord;
  }

  public delete(id: string): boolean {
    db.deleteFinance(id);
    wsGateway.broadcast({ type: 'FINANCE_RECORD_DELETED', data: { id } });
    return true;
  }

  public truncateAll(): boolean {
    db.clearFinances();
    wsGateway.broadcast({
      type: 'FINANCE_STATEMENT_IMPORTED',
      data: { importedCount: 0, totalIncome: 0, totalExpense: 0, finances: [] },
    });
    return true;
  }

  public async importStatement(
    input: { filePath?: string; fileBase64?: string; filename?: string } | string,
    clearExisting = false
  ): Promise<{
    success: boolean;
    accountName: string;
    accountNumber: string;
    importedCount: number;
    newlyAddedCount?: number;
    totalIncome: number;
    totalExpense: number;
    transactions: PersonalFinanceRecord[];
  }> {
    let targetPath = '';
    let isTempFile = false;

    if (typeof input === 'string') {
      targetPath = input;
    } else if (input.fileBase64) {
      const tempDir = path.resolve(__dirname, '../../storage/temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      const rawExt = path.extname(input.filename || '') || '.xlsx';
      const ext = rawExt.toLowerCase();
      const baseName = path.basename(input.filename || 'statement', rawExt).replace(/[^a-zA-Z0-9._-]/g, '_');
      targetPath = path.join(tempDir, `upload_${Date.now()}_${baseName}${ext}`);
      const base64Data = input.fileBase64.includes('base64,')
        ? input.fileBase64.split('base64,')[1]
        : input.fileBase64;
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(targetPath, buffer);
      isTempFile = true;
    } else if (input.filePath) {
      targetPath = input.filePath;
    } else {
      targetPath = '/Users/cheolsovandara/Downloads/Account Statement 26-08-2026.xlsx';
    }

    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, 'excel-parser.py');
      execFile(
        'python3',
        [scriptPath, targetPath],
        { maxBuffer: 15 * 1024 * 1024 },
        (err, stdout, stderr) => {
          if (isTempFile && fs.existsSync(targetPath)) {
            try { fs.unlinkSync(targetPath); } catch (_) {}
          }

          if (err) {
            return reject(new Error(stderr || err.message));
          }

          try {
            const parsed = JSON.parse(stdout.trim());
            if (parsed.error) {
              return reject(new Error(parsed.error));
            }

            const rawList = parsed.transactions || [];
            const existingIds = new Set(db.finances.map((f) => f.id));

            const parsedRecords: PersonalFinanceRecord[] = rawList.map((t: any) => {
              let id = '';
              const refMatch = t.note?.match(/Ref\.([0-9a-zA-Z]+)/);
              const hashMatch = t.note?.match(/Txn\.\s*Hash\s*([0-9a-zA-Z]+)/i);

              if (refMatch && refMatch[1]) {
                id = `fin-ref-${refMatch[1]}`;
              } else if (hashMatch && hashMatch[1]) {
                id = `fin-hash-${hashMatch[1]}`;
              } else {
                const sig = `${t.date}_${t.type}_${t.amount}_${t.note || ''}`;
                let hash = 0;
                for (let i = 0; i < sig.length; i++) {
                  hash = (hash << 5) - hash + sig.charCodeAt(i);
                  hash |= 0;
                }
                id = `fin-sig-${Math.abs(hash).toString(36)}`;
              }

              return {
                id,
                date: t.date,
                note: t.note,
                amount: t.amount,
                type: t.type,
                category: t.category,
              };
            });

            if (clearExisting) {
              db.clearFinances();
            }

            let newlyAddedCount = 0;
            parsedRecords.forEach((r) => {
              if (!existingIds.has(r.id)) {
                newlyAddedCount++;
              }
            });

            // Insert / Upsert into SQLite permanently
            db.bulkInsertFinances(parsedRecords);

            const allCurrentFinances = db.finances;
            let totalIncome = 0;
            let totalExpense = 0;
            allCurrentFinances.forEach((r) => {
              if (r.type === 'income') totalIncome += r.amount;
              else totalExpense += r.amount;
            });

            wsGateway.broadcast({
              type: 'FINANCE_STATEMENT_IMPORTED',
              data: {
                importedCount: parsedRecords.length,
                newlyAddedCount: clearExisting ? parsedRecords.length : newlyAddedCount,
                totalIncome,
                totalExpense,
                finances: allCurrentFinances,
              },
            });

            resolve({
              success: true,
              accountName: parsed.accountName || 'Dara (Cheol Sovandara)',
              accountNumber: parsed.accountNumber || '0800-04200715-16',
              importedCount: parsedRecords.length,
              newlyAddedCount: clearExisting ? parsedRecords.length : newlyAddedCount,
              totalIncome,
              totalExpense,
              transactions: allCurrentFinances,
            });
          } catch (parseErr: any) {
            reject(new Error(`Failed to parse script output: ${parseErr.message}`));
          }
        }
      );
    });
  }
}

export const financeService = new FinanceService();
