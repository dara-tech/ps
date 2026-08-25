import { db } from '../../data/db';
import { wsGateway } from '../../core/websocket/websocket.gateway';
import { PersonalFinanceRecord } from '../../../../shared';

export class FinanceService {
  public getAll(): PersonalFinanceRecord[] {
    return db.finances;
  }

  public create(data: Omit<PersonalFinanceRecord, 'id'>): PersonalFinanceRecord {
    const newRecord: PersonalFinanceRecord = {
      ...data,
      id: `fin-${Date.now()}`,
      date: data.date || new Date().toISOString().split('T')[0],
    };

    db.finances = [newRecord, ...db.finances];

    wsGateway.broadcast({ type: 'FINANCE_RECORD_ADDED', data: newRecord });
    return newRecord;
  }

  public delete(id: string): boolean {
    db.finances = db.finances.filter(f => f.id !== id);
    wsGateway.broadcast({ type: 'FINANCE_RECORD_DELETED', data: { id } });
    return true;
  }
}

export const financeService = new FinanceService();
