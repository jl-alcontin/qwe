import { networkStatus } from './networkStatus';
import { getUnsynedSales, markSaleAsSynced, deleteOfflineSale } from './indexedDB';
import { createNotification } from './notification';
import { store } from '../store';
import { api } from '../store/api';
import { saleApi } from '../store/services/saleService';

class SyncManager {
  private isSyncing: boolean = false;

  constructor() {
    this.setupNetworkListener();
  }

  private setupNetworkListener() {
    networkStatus.addCallback((online) => {
      if (online) {
        this.syncOfflineData();
      }
    });
  }

  public async syncOfflineData() {
    if (this.isSyncing) return;
    
    try {
      this.isSyncing = true;
      const unsynedSales = await getUnsynedSales();
      
      if (unsynedSales.length === 0) return;

      for (const sale of unsynedSales) {
        try {
          // Use the RTK Query endpoint to create the sale
          await store.dispatch(
            saleApi.endpoints.createSale.initiate(sale.data)
          ).unwrap();

          await markSaleAsSynced(sale.id);
          await deleteOfflineSale(sale.id);

          // Create notification for successful sync
          createNotification(
            store.dispatch,
            `Offline sale successfully synced`,
            'system'
          );
        } catch (error) {
          console.error('Failed to sync sale:', error);
          createNotification(
            store.dispatch,
            `Failed to sync offline sale. Will retry later.`,
            'alert'
          );
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncManager = new SyncManager();