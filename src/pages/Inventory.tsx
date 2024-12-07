import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Package, History } from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { useGetProductsQuery } from "../store/services/productService";
import { useGetStoreQuery } from "../store/services/storeService";
import { useGetCategoriesQuery } from "../store/services/categoryService";
import {
  useGetStockMovementsQuery,
  useAddStockMovementMutation,
  useGetStockAlertsQuery,
  useUpdateStockAlertMutation,
} from "../store/services/inventoryService";
import InventoryFilters from "../components/inventory/InventoryFilters";
import InventoryList from "../components/inventory/InventoryList";
import Pagination from "../components/inventory/Pagination";

const ITEMS_PER_PAGE = 10;

const Inventory = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { data: products } = useGetProductsQuery(storeId!);
  const { data: store } = useGetStoreQuery(storeId!);
  const { data: categories } = useGetCategoriesQuery(storeId!);
  const { data: stockMovements } = useGetStockMovementsQuery(storeId!);
  const { data: stockAlerts } = useGetStockAlertsQuery(storeId!);
  const [addStockMovement] = useAddStockMovementMutation();
  const [updateStockAlert] = useUpdateStockAlertMutation();

  // Filters and Sorting State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Apply sorting
    const [field, direction] = sortBy.startsWith("-")
      ? [sortBy.substring(1), "desc"]
      : [sortBy, "asc"];

    filtered.sort((a: any, b: any) => {
      let comparison = 0;
      switch (field) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "stock":
        case "price":
          comparison = a[field] - b[field];
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          comparison = 0;
      }
      return direction === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  const totalPages = Math.ceil(
    (filteredAndSortedProducts?.length || 0) / ITEMS_PER_PAGE
  );

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setShowMovementModal(true);
  };

  const handleStockMovement = async (data: any) => {
    try {
      await addStockMovement({
        product: selectedProduct._id,
        type: data.type,
        quantity: data.quantity,
        reason: data.reason,
        store: storeId,
      }).unwrap();
      
      toast.success("Stock movement recorded successfully");
      setShowMovementModal(false);
      setSelectedProduct(null);
    } catch (error) {
      toast.error("Failed to record stock movement");
    }
  };

  if (!store?.settings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Package className="h-6 w-6" />
          Inventory Management
        </h1>
        <button
          onClick={() => setShowMovementModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover"
        >
          <History className="h-4 w-4 mr-2" />
          Record Movement
        </button>
      </div>

      <InventoryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        categories={categories || []}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <InventoryList
        products={filteredAndSortedProducts}
        storeSettings={store.settings}
        onEdit={handleEdit}
        currentPage={currentPage}
        itemsPerPage={ITEMS_PER_PAGE}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Inventory;