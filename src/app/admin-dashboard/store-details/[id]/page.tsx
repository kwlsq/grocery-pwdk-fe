'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useStoreStore } from '../../../../store/storeStore';
import { useWarehouseStore } from '../../../../store/warehouseStore';
import WarehouseGrid from '../../../../components/warehouse/WarehouseGrid';
import AddWarehouseDialog from '../../../../components/warehouse/AddWarehouseDialog';
import WarehouseSearchFilter from '../../../../components/warehouse/WarehouseSearchFilter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { useProductStore } from '@/store/productStore';
import ProductGrid from '@/components/product/ProductGrid';
import CreateProduct from '@/components/product/CreateProductDialog';
import { cn } from '@/lib/utils';
import Navbar from '../../../../components/Navbar/Index';
import { AssignManagerDialog } from '@/components/store/AssignManagerDialog';
import { EditStoreDialog } from '@/components/store/EditStoreDialog';

export default function StoreDetailsPage() {
  const params = useParams();
  const storeId = params.id as string;

  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [mounted, setMounted] = useState(false);
  const [warehouseSearch, setWarehouseSearch] = useState("");
  const [warehouseSortBy, setWarehouseSortBy] = useState("id");
  const [warehouseSortDirection, setWarehouseSortDirection] = useState("asc");

  const { stores, fetchStores } = useStoreStore();
  const { warehouses, loading: warehouseLoading, error: warehouseError, fetchWarehouses, pagination: warehousePagination } = useWarehouseStore();
  const { productsThisStore, error: productError, loading: productLoading, fetchProductByStoreID, pagination } = useProductStore();
  const [activeTab, setActiveTab] = useState('warehouses');

  // Find the current store
  const currentStore = stores.find(store => store.id === storeId);

  // Tab configuration data
  const tabsData = [
    { value: 'warehouses', label: 'Warehouses' },
    { value: 'products', label: 'Products' }
  ];

  // Transform pagination data for ProductGrid component
  const paginationData = pagination ? {
    currentPage: pagination.page || 0,
    totalPages: pagination.totalPages || 0,
    hasNext: pagination.hasNext || false,
    hasPrevious: pagination.hasPrevious || false
  } : undefined;

  // Transform pagination data for WarehouseGrid component
  const warehousePaginationData = warehousePagination ? {
    currentPage: warehousePagination.page || 0,
    totalPages: warehousePagination.totalPages || 0,
    hasNext: warehousePagination.hasNext || false,
    hasPrevious: warehousePagination.hasPrevious || false,
  } : undefined;

  // Handle page change from ProductGrid
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchProductByStoreID(storeId, newPage, pagination?.size || 12, searchTerm, selectedCategory);
  };

  const prevSearchRef = useRef({
    searchTerm: '',
    category: '',
    sortBy: '',
    sortDirection: ''
  });

  // Replace your handleSearch function with this:
  const handleSearch = (searchTerm: string, category: string, sortBy?: string, sortDirection?: string) => {
    console.log("handleSearch called with:", { searchTerm, category, sortBy, sortDirection });

    const prev = prevSearchRef.current;

    // Check if any values have actually changed
    const hasChanged =
      prev.searchTerm !== searchTerm ||
      prev.category !== category ||
      prev.sortBy !== (sortBy || '') ||
      prev.sortDirection !== (sortDirection || '');

    if (!hasChanged) {
      console.log("Search values unchanged, skipping fetch");
      return;
    }

    // Update the ref with new values
    prevSearchRef.current = {
      searchTerm,
      category,
      sortBy: sortBy || '',
      sortDirection: sortDirection || ''
    };

    // Update local state
    setSearchTerm(searchTerm);
    setSelectedCategory(category);
    setCurrentPage(0);

    // Fetch with new parameters
    fetchProductByStoreID(storeId, 0, pagination?.size || 12, searchTerm, category, sortBy, sortDirection);
  };

  // Handle page change for warehouses
  const handleWarehousePageChange = (newPage: number) => {
    fetchWarehouses(storeId, newPage, warehousePagination?.size || 12, warehouseSearch, warehouseSortBy, warehouseSortDirection);
  };

  // Refresh products data
  const refreshProducts = () => {
    fetchProductByStoreID(storeId, currentPage, pagination?.size || 12, searchTerm, selectedCategory);
  };

  // Handle successful manager assignment
  const handleManagerAssignmentSuccess = () => {
    fetchStores(); // Refresh stores to update manager info
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (stores.length === 0) {
      fetchStores();
    }

    if (storeId) {
      fetchWarehouses(storeId, 0, 12, warehouseSearch, warehouseSortBy, warehouseSortDirection);
      fetchProductByStoreID(storeId, 0, 12);
    }

  }, [mounted, storeId, stores.length, fetchStores, fetchWarehouses, fetchProductByStoreID, warehouseSearch, warehouseSortBy, warehouseSortDirection]);

  // Update currentPage when pagination data changes
  useEffect(() => {
    if (pagination?.page !== undefined) {
      setCurrentPage(pagination.page);
    }
  }, [pagination?.page]);

  if (!mounted) {
    return null;
  }

  if (!currentStore) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">
              Store not found
            </div>
            <p className="text-gray-600">The requested store could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Enhanced Store Header with Manager Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{currentStore.name}</h1>
              <p className="text-gray-600 mt-2">{currentStore.description}</p>

              {/* Store Manager Section */}
              {currentStore.storeManager ? (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Store Manager</p>
                      <p className="text-lg font-semibold text-blue-800">{currentStore.storeManager.name}</p>
                      <p className="text-sm text-blue-600">{currentStore.storeManager.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-full">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-900">No Manager Assigned</p>
                      <p className="text-sm text-amber-700">This store needs a manager to operate effectively</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mt-4">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-600">{currentStore.address}</span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${currentStore.isActive
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
                  }`}>
                  {currentStore.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-gray-500">Store ID: {currentStore.id}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <CreateProduct storeID={storeId} />

              {/* Manager Assignment Button */}
              <AssignManagerDialog
                store={currentStore}
                allStores={stores}
                onSuccess={handleManagerAssignmentSuccess}
              />

              <EditStoreDialog
                store={currentStore}
                onSuccess={() => {
                  fetchStores(); // Refresh stores to show updated data
                }}
              />
            </div>
          </div>
        </div>


        {/* Enhanced Store Statistics with Manager Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-5">
          {/* Manager Status Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${currentStore.storeManager ? 'bg-green-100' : 'bg-red-100'}`}>
                <svg className={`w-6 h-6 ${currentStore.storeManager ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Manager Status</p>
                <p className={`text-lg font-semibold ${currentStore.storeManager ? 'text-green-600' : 'text-red-600'}`}>
                  {currentStore.storeManager ? 'Assigned' : 'Not Assigned'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Warehouses</p>
                <p className="text-2xl font-semibold text-gray-900">{warehouses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Warehouses</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {warehouses.filter(warehouse => warehouse.active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">{pagination?.totalElements || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue='warehouses' onValueChange={setActiveTab}>
          <TabsList>
            {tabsData.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "rounded-none h-full border-b-2 data-[state=active]:shadow-none",
                  activeTab === tab.value
                    ? "border-green-600 text-green-600"
                    : "border-transparent"
                )}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value='warehouses' className='flex flex-col gap-4 pt-2'>

            {/* Warehouses Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Warehouses</h2>
                  <p className="text-gray-600">
                    Manage inventory and storage locations for this store
                  </p>
                </div>
                <div className="flex gap-3">
                  <AddWarehouseDialog />
                  <WarehouseSearchFilter
                    defaultSearch={warehouseSearch}
                    defaultSortBy={warehouseSortBy}
                    defaultSortDirection={warehouseSortDirection as 'asc' | 'desc'}
                    onChange={({ search, sortBy, sortDirection }) => {
                      setWarehouseSearch(search);
                      setWarehouseSortBy(sortBy);
                      setWarehouseSortDirection(sortDirection);
                    }}
                  />
                  <Button onClick={() => fetchWarehouses(storeId, 0, 12, warehouseSearch, warehouseSortBy, warehouseSortDirection)} variant={"secondary"}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </Button>
                </div>
              </div>

              <WarehouseGrid
                warehouses={warehouses}
                loading={warehouseLoading}
                error={warehouseError}
                pagination={warehousePaginationData}
                onPageChange={handleWarehousePageChange}
              />
            </div>
          </TabsContent>

          <TabsContent value='products' className='flex flex-col gap-4 pt-2'>

            {/* Products Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Products</h2>
                  <p className="text-gray-600">
                    Manage products for this store
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={refreshProducts} variant={"secondary"}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </Button>
                </div>
              </div>

              <ProductGrid
                products={productsThisStore}
                error={productError}
                loading={productLoading}
                pagination={paginationData}
                onPageChange={handlePageChange}
                onSearch={handleSearch}
                showSearchAndFilter={true}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}