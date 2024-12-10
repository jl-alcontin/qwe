import { networkStatus } from './networkStatus';
import {
  getUnsynedSales,
  getUnsynedProducts,
  getUnsynedCategories,
  getUnsynedInventory,
  getUnsynedReports,
  markSaleAsSynced,
  markProductAsSynced,
  markCategoryAsSynced,
  markInventoryAsSynced,
  markReportAsSynced,
  deleteOfflineSale,
  deleteOfflineProduct,
  deleteOfflineCategory,
  deleteOfflineInventory,
  deleteOfflineReport,
} from './indexedDB';
import { createNotification } from './notification';
import { store } from '../store';
import { saleApi } from '../store/services/saleService';
import { productApi } from '../store/services/productService';
import { categoryApi } from '../store/services/categoryService';
import { inventoryApi } from '../store/services/inventoryService';

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
    this.syncInterval = setInterval(() => {
      if (networkStatus.isNetworkOnline()) {
        this.syncOfflineData();
      }
    }, 60000); // Check every minute
  }

  private async syncProducts() {
    const unsynedProducts = await getUnsynedProducts();
    for (const product of unsynedProducts) {
      try {
        switch (product.action) {
          case 'create':
            await store.dispatch(productApi.endpoints.createProduct.initiate(product.data)).unwrap();
            break;
          case 'update':
            await store.dispatch(productApi.endpoints.updateProduct.initiate(product.data)).unwrap();
            break;
          case 'delete':
            await store.dispatch(productApi.endpoints.deleteProduct.initiate(product.data._id)).unwrap();
            break;
        }
        await markProductAsSynced(product.id);
        await deleteOfflineProduct(product.id);
      } catch (error) {
        console.error('Failed to sync product:', error);
      }
    }
    return unsynedProducts.length;
  }

  private async syncCategories() {
    const unsynedCategories = await getUnsynedCategories();
    for (const category of unsynedCategories) {
      try {
        switch (category.action) {
          case 'create':
            await store.dispatch(categoryApi.endpoints.createCategory.initiate(category.data)).unwrap();
            break;
          case 'update':
            await store.dispatch(categoryApi.endpoints.updateCategory.initiate(category.data)).unwrap();
            break;
          case 'delete':
            await store.dispatch(categoryApi.endpoints.deleteCategory.initiate(category.data._id)).unwrap();
            break;
        }
        await markCategoryAsSynced(category.id);
        await deleteOfflineCategory(category.id);
      } catch (error) {
        console.error('Failed to sync category:', error);
      }
    }
    return unsynedCategories.length;
  }

  private async syncInventory() {
    const unsynedInventory = await getUnsynedInventory();
    for (const inventory of unsynedInventory) {
      try {
        switch (inventory.action) {
          case 'create':
          case 'update':
            await store.dispatch(inventoryApi.endpoints.addStockMovement.initiate(inventory.data)).unwrap();
            break;
        }
        await markInventoryAsSynced(inventory.id);
        await deleteOfflineInventory(inventory.id);
      } catch (error) {
        console.error('Failed to sync inventory:', error);
      }
    }
    return unsynedInventory.length;
  }

  private async syncSales() {
    const unsynedSales = await getUnsynedSales();
    for (const sale of unsynedSales) {
      try {
        await store.dispatch(saleApi.endpoints.createSale.initiate(sale.data)).unwrap();
        await markSaleAsSynced(sale.id);
        await deleteOfflineSale(sale.id);
      } catch (error) {
        console.error('Failed to sync sale:', error);
      }
    }
    return unsynedSales.length;
  }

  private async syncReports() {
    const unsynedReports = await getUnsynedReports();
    for (const report of unsynedReports) {
      try {
        // Store reports locally until online
        await markReportAsSynced(report.id);
        await deleteOfflineReport(report.id);
      } catch (error) {
        console.error('Failed to sync report:', error);
      }
    }
    return unsynedReports.length;
  }

  public async syncOfflineData() {
    if (this.isSyncing) return;
    
    try {
      this.isSyncing = true;
      
      // Sync all entity types and get counts
      const [
        productsCount,
        categoriesCount,
        inventoryCount,
        salesCount,
        reportsCount
      ] = await Promise.all([
        this.syncProducts(),
        this.syncCategories(),
        this.syncInventory(),
        this.syncSales(),
        this.syncReports()
      ]);

      const totalSynced = productsCount + categoriesCount + inventoryCount + salesCount + reportsCount;

      // Only create notification if there was data to sync
      if (totalSynced > 0) {
        await createNotification(
          store.dispatch,
          `Successfully synchronized ${totalSynced} offline items`,
          'system'
        );
      }
    } catch (error) {
      console.error('Error during sync process:', error);
      await createNotification(
        store.dispatch,
        'Some data failed to sync. Will retry later.',
        'alert'
      );
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