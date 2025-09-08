'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useStoreStore } from '../../../../store/storeStore';
import { useWarehouseStore } from '../../../../store/warehouseStore';
import WarehouseGrid from '../../../../components/warehouse/WarehouseGrid';
import AddWarehouseDialog from '../../../../components/warehouse/AddWarehouseDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { useProductStore } from '@/store/productStore';
import ProductGrid from '@/components/product/ProductGrid';
import CreateProduct from '@/components/product/CreateProductDialog';
import { cn } from '@/lib/utils';
import Navbar from '../../../../components/Navbar/Index';

export default function StoreDetailsPage() {
  const params = useParams();
  const storeId = params.id as string;

  const [currentPage, setCurrentPage] = useState(0); // 0-based for API
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [mounted, setMounted] = useState(false);

  const { stores, fetchStores } = useStoreStore();
  const { warehouses, loading: warehouseLoading, error: warehouseError, fetchWarehouses } = useWarehouseStore();
  const { productsThisStore, error: productError, loading: productLoading, fetchProductByStoreID, pagination } = useProductStore();
  const [activeTab, setActiveTab] = useState('warehouses');

  // Find the current store
  const currentStore = stores.find(store => store.id === storeId);

  // Tab configuration data
  const tabsData = [
    { value: 'warehouses', label: 'Warehouses' },
    { value: 'products', label: 'Products' },
    { value: 'admin', label: 'Admin' }
  ];

  // Transform pagination data for ProductGrid component
  const paginationData = pagination ? {
    currentPage: pagination.page || 0, // 0-based page from API
    totalPages: pagination.totalPages || 0,
    hasNext: pagination.hasNext || false,
    hasPrevious: pagination.hasPrevious || false
  } : undefined;

  // Handle page change from ProductGrid
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchProductByStoreID(storeId, newPage, pagination?.size || 12, searchTerm, selectedCategory);
  };

  // Handle search from ProductGrid
  const handleSearch = (searchTerm: string, category: string) => {
    setSearchTerm(searchTerm);
    setSelectedCategory(category);
    setCurrentPage(0);
    fetchProductByStoreID(storeId, 0, pagination?.size || 12, searchTerm, category);
  };

  // Refresh products data
  const refreshProducts = () => {
    fetchProductByStoreID(storeId, currentPage, pagination?.size || 12, searchTerm, selectedCategory);
  };

  // Count out of stock products
  const outOfStockProducts = productsThisStore.filter(product => {
    const inventories = product.productVersionResponse?.inventories;
  
    if (!Array.isArray(inventories) || inventories.length === 0) {
      return true;
    }
  
    const totalStock = inventories.reduce((sum, inv) => sum + (inv?.stock || 0), 0);
    return totalStock === 0;
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Fetch stores if not already loaded
    if (stores.length === 0) {
      fetchStores();
    }

    // Fetch warehouses for this store
    if (storeId) {
      fetchWarehouses(storeId);
      fetchProductByStoreID(storeId, 0, 12); // Initial load with first page
    }

  }, [mounted, storeId, stores.length, fetchStores, fetchWarehouses, fetchProductByStoreID]);

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
      <Navbar/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Store Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{currentStore.name}</h1>
              <p className="text-gray-600 mt-2">{currentStore.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-600">{currentStore.address}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${currentStore.active
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
                  }`}>
                  {currentStore.active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-gray-500">Store ID: {currentStore.id}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <CreateProduct storeID={storeId} />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Store
              </button>
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
            {/* Store Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <Button onClick={() => fetchWarehouses(storeId)} variant={"secondary"}>
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
              />
            </div>
          </TabsContent>

          <TabsContent value='products' className='flex flex-col gap-4 pt-2'>
            {/* Store Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-semibold text-gray-900">{pagination?.totalElements || 0}</p>
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
                    <p className="text-sm font-medium text-gray-600">Out of Stock Products</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {outOfStockProducts.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2h4a1 1 0 0 1 0 2h-1v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6H3a1 1 0 0 1 0-2h4zM9 3v1h6V3H9zM6 6v14h12V6H6z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pages</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {pagination ? `${(pagination.page || 0) + 1} of ${pagination.totalPages || 0}` : '0 of 0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

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

              {/* Use ProductGrid with built-in pagination */}
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