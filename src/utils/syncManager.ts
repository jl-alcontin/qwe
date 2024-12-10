import { networkStatus } from './networkStatus';
import { getUnsynedSales, markSaleAsSynced, deleteOfflineSale } from './indexedDB';
import { createNotification } from './notification';
import { store } from '../store';
import { saleApi } from '../store/services/saleService';

class SyncManager {
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupNetworkListener();
    this.startPeriodicSync();
  }

  private setupNetworkListener() {
    networkStatus.addCallback((online) => {
      if (online) {
        this.syncOfflineData();
      }
    });
  }

  private startPeriodicSync() {
    // Check for unsynced data every minute
    this.syncInterval = setInterval(() => {
      if (networkStatus.isNetworkOnline()) {
        this.syncOfflineData();
      }
    }, 60000);
  }

  public async syncOfflineData() {
    if (this.isSyncing) return;
    
    try {
      this.isSyncing = true;
      const unsynedSales = await getUnsynedSales();
      
      if (unsynedSales.length === 0) return;

      console.log('Starting sync of offline sales:', unsynedSales.length);

      for (const sale of unsynedSales) {
        try {
          console.log('Syncing sale:', sale.id);
          
          // Use the RTK Query endpoint to create the sale
          const result = await store.dispatch(
            saleApi.endpoints.createSale.initiate(sale.data)
          ).unwrap();

          console.log('Sale synced successfully:', result);

          await markSaleAsSynced(sale.id);
          await deleteOfflineSale(sale.id);

          // Create notification for successful sync
          await createNotification(
            store.dispatch,
            `Offline sale successfully synced`,
            'system',
            sale.data.store
          );
        } catch (error) {
          console.error('Failed to sync sale:', error);
          await createNotification(
            store.dispatch,
            `Failed to sync offline sale. Will retry later.`,
            'alert',
            sale.data.store
          );
        }
      }
    } catch (error) {
      console.error('Error during sync process:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  public cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

export const syncManager = new SyncManager();