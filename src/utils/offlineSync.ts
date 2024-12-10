import { toast } from 'react-hot-toast';
import { networkStatus } from './networkStatus';
import {
  saveOfflineProduct,
  saveOfflineCategory,
  saveOfflineInventory,
  saveOfflineReport,
  getUnsynedProducts,
  getUnsynedCategories,
  getUnsynedInventory,
  getUnsynedReports,
  markProductAsSynced,
  markCategoryAsSynced,
  markInventoryAsSynced,
  markReportAsSynced,
  deleteOfflineProduct,
  deleteOfflineCategory,
  deleteOfflineInventory,
  deleteOfflineReport
} from './indexedDB';

import { store } from '../store';
import { api } from '../store/api';

// Generic offline action handler
export const handleOfflineAction = async <T>(
  entityType: 'product' | 'category' | 'inventory' | 'report',
  action: 'create' | 'update' | 'delete',
  data: T
): Promise<boolean> => {
  if (networkStatus.isNetworkOnline()) {
    return false; // Not handled offline
  }

  try {
    switch (entityType) {
      case 'product':
        await saveOfflineProduct(data, action);
        break;
      case 'category':
        await saveOfflineCategory(data, action);
        break;
      case 'inventory':
        await saveOfflineInventory(data, action);
        break;
      case 'report':
        await saveOfflineReport(data);
        break;
    }

    toast.success('Data saved offline. Will sync when connection is restored.');
    return true; // Handled offline
  } catch (error) {
    console.error('Failed to save offline data:', error);
    toast.error('Failed to save data offline');
    return false;
  }
};

export const syncEntityData = async (
  entityType: 'product' | 'category' | 'inventory' | 'report'
): Promise<void> => {
  let unsynced;
  switch (entityType) {
    case 'product':
      unsynced = await getUnsynedProducts();
      break;
    case 'category':
      unsynced = await getUnsynedCategories();
      break;
    case 'inventory':
      unsynced = await getUnsynedInventory();
      break;
    case 'report':
      unsynced = await getUnsynedReports();
      break;
  }
  
  for (const item of unsynced) {
    try {
      let endpoint;
      switch (entityType) {
        case 'product':
          endpoint = item.action === 'create' ? 'createProduct' :
                     item.action === 'update' ? 'updateProduct' : 'deleteProduct';
          break;
        case 'category':
          endpoint = item.action === 'create' ? 'createCategory' :
                     item.action === 'update' ? 'updateCategory' : 'deleteCategory';
          break;
        case 'inventory':
          endpoint = 'addStockMovement';
          break;
        case 'report':
          endpoint = 'createReport';
          break;
      }

      await store.dispatch(
        api.endpoints[endpoint].initiate(item.data)
      ).unwrap();

      switch (entityType) {
        case 'product':
          await markProductAsSynced(item.id);
          await deleteOfflineProduct(item.id);
          break;
        case 'category':
          await markCategoryAsSynced(item.id);
          await deleteOfflineCategory(item.id);
          break;
        case 'inventory':
          await markInventoryAsSynced(item.id);
          await deleteOfflineInventory(item.id);
          break;
        case 'report':
          await markReportAsSynced(item.id);
          await deleteOfflineReport(item.id);
          break;
      }
    } catch (error) {
      console.error(`Failed to sync ${entityType}:`, error);
    }
  }
};

