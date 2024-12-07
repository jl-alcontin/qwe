import { StoreSettings } from '../store/services/storeService';

export const checkStockLevel = (currentStock: number, settings: StoreSettings) => {
  if (currentStock <= settings.outOfStockThreshold) {
    return 'out_of_stock';
  }
  if (currentStock <= settings.criticalStockThreshold) {
    return 'critical';
  }
  if (currentStock <= settings.lowStockThreshold) {
    return 'low';
  }
  return 'normal';
};

export const shouldCreateStockAlert = (
  currentStock: number,
  settings: StoreSettings
): boolean => {
  if (!settings.enableStockAlerts) return false;
  
  return (
    currentStock <= settings.outOfStockThreshold ||
    currentStock <= settings.criticalStockThreshold ||
    currentStock <= settings.lowStockThreshold
  );
};

export const getStockAlertType = (
  currentStock: number,
  settings: StoreSettings
): 'out_of_stock' | 'low_stock' | null => {
  if (!settings.enableStockAlerts) return null;
  
  if (currentStock <= settings.outOfStockThreshold) {
    return 'out_of_stock';
  }
  if (currentStock <= settings.lowStockThreshold) {
    return 'low_stock';
  }
  return null;
};

export const getStockAlertThreshold = (
  alertType: 'out_of_stock' | 'low_stock',
  settings: StoreSettings
): number => {
  return alertType === 'out_of_stock'
    ? settings.outOfStockThreshold
    : settings.lowStockThreshold;
};