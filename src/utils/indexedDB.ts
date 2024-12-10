import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineDB extends DBSchema {
  offlineSales: {
    key: string;
    value: {
      id: string;
      data: any;
      createdAt: number;
      synced: boolean;
    };
  };
}

const DB_NAME = 'pos_offline_db';
const DB_VERSION = 1;

export const initDB = async (): Promise<IDBPDatabase<OfflineDB>> => {
  return openDB<OfflineDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('offlineSales')) {
        db.createObjectStore('offlineSales', { keyPath: 'id' });
      }
    },
  });
};

export const saveOfflineSale = async (saleData: any): Promise<string> => {
  const db = await initDB();
  const id = `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.add('offlineSales', {
    id,
    data: saleData,
    createdAt: Date.now(),
    synced: false,
  });

  return id;
};

export const getUnsynedSales = async () => {
  const db = await initDB();
  const allSales = await db.getAll('offlineSales');
  return allSales.filter(sale => !sale.synced);
};

export const markSaleAsSynced = async (id: string) => {
  const db = await initDB();
  const sale = await db.get('offlineSales', id);
  if (sale) {
    sale.synced = true;
    await db.put('offlineSales', sale);
  }
};

export const deleteOfflineSale = async (id: string) => {
  const db = await initDB();
  await db.delete('offlineSales', id);
};