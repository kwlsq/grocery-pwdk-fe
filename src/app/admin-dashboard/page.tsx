'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authStore';
import { useProductStore } from '@/store/productStore';
import { useDiscountStore } from '@/store/discountStore';
import { useUsersStore } from '../../store/userStore';
import { useStoreStore } from '../../store/storeStore';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import UserGrid from '@/components/user/UserGrid';
import RegisterStoreAdmin from '../../components/store/RegisterStoreAdminDialog';
import DiscountGrid from '@/components/discount/DiscountGrid';
import dynamic from 'next/dynamic';
const StockReportTableDyn = dynamic(() => import('@/components/report/StockReportTable'), { ssr: false });
import CreateDiscountDialog from '@/components/discount/CreateDiscountDialog';
import StoreGrid from '../../components/store/StoreGrid';
import Navbar from '../../components/Navbar/Index';
import CreateCategoryDialog from '@/components/category/CreateCategoryDialog';
import CategoryGrid from '@/components/category/CategoryGrid';
import { SalesReportChart } from '../../components/report/SalesReportChart';
import { Store } from '@/types/store';
const ProductStockReportTableDyn = dynamic(() => import('@/components/report/ProductStockReportTable'), { ssr: false });
const SalesReportTableDyn = dynamic(() => import('@/components/report/SalesReportTable'), { ssr: false });

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('stores');
  const [reportTab, setReportTab] = useState('summary');
  const { stores, loading, error, fetchStores, fetchStoreByUser, pagination: storePagination, store } = useStoreStore();
  const { users, loading: usersLoading, error: usersError, fetchUsers, selectedRole, setSelectedRole } = useUsersStore();
  const { discounts, loading: discountsLoading, error: discountsError, pagination: discountPagination, fetchDiscount } = useDiscountStore();
  const { user } = useAuthStore();
  const { categories, fetchCategories, deleteCategory } = useProductStore();

  const storeForUser: Store[] = store ? [store] : [];

  // Main tabs
  const tabsData =

    user?.role === 'ADMIN'
      ? [
        { value: 'stores', label: 'Store' },
        { value: 'users', label: 'User' },
        { value: 'discounts', label: 'Discount' },
        { value: 'chart', label: 'Report' },
        { value: 'categories', label: 'Category' }
      ]
      :
      [
        { value: 'stores', label: 'Store' },
        { value: 'discounts', label: 'Discount' },
        { value: 'chart', label: 'Report' },
        { value: 'categories', label: 'Category' }
      ];

  // Report tabs
  const reportTabsData = [
    { value: 'summary', label: 'Summary' },
    { value: 'product', label: 'Product' },
    { value: 'sales', label: 'Sales' }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchStores();
  }, [mounted, fetchStores]);

  useEffect(() => {
    if (!mounted) return;
    if (user?.role === 'ADMIN') {
      fetchUsers({ page: 0, size: 12, role: selectedRole });
    }
  }, [mounted, fetchUsers, selectedRole, user]);

  useEffect(() => {
    if (!mounted) return;
    fetchDiscount();
  }, [mounted, fetchDiscount]);

  useEffect(() => {
    if (!mounted) return;
    if (user?.role !== 'MANAGER') return;

    fetchStoreByUser();
  }, [mounted, fetchStoreByUser, user])

  useEffect(() => {
    if (!mounted) return;
    if (activeTab === 'categories') {
      fetchCategories();
    }
  }, [mounted, activeTab, fetchCategories]);


  useEffect(() => {
    setActiveTab(tabsData[0].value);
  }, [])


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your stores and monitor their status
          </p>
        </div>

        <Tabs defaultValue={tabsData[0]?.value} onValueChange={setActiveTab}>
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

          <TabsContent value='stores'>
            {/* Actions Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Stores</h2>
                  <p className="text-sm text-gray-600">
                    Manage your store network and monitor performance
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button className={cn("bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2", user?.role !== 'ADMIN' && "hidden")}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Store
                  </Button>
                  <Button
                    onClick={() => { fetchStores(0, 12, "") }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Stores Grid */}
            <div className='pt-20'>
              {loading &&
                <div className='w-full h-full text-center justify-center'>
                  Loading store…
                </div>
              }

              {!loading && error && user?.role === 'MANAGER' && (
                <div className="w-full h-full text-center justify-center">
                  {error
                    && 'No store assigned yet'}
                </div>
              )}

              {!loading && !error && user?.role === 'MANAGER' && storeForUser.length === 0 && (
                <div className="w-full h-full text-center justify-center">
                  No store assigned yet
                </div>
              )}
            </div>

            {!loading && !error && user?.role === 'MANAGER' && storeForUser.length > 0 && (
              <StoreGrid
                stores={storeForUser}
                loading={loading}
                error={error}
                pagination={storePagination ? {
                  currentPage: storePagination.page,
                  totalPages: storePagination.totalPages,
                  hasNext: storePagination.hasNext,
                  hasPrevious: storePagination.hasPrevious,
                } : undefined}
                onPageChange={(page) => fetchStores(page, 12, "")}
                showSearchAndFilter
              />
            )}

            {stores && user?.role === 'ADMIN' &&
              <StoreGrid
                stores={stores}
                loading={loading}
                error={error}
                pagination={storePagination ? {
                  currentPage: storePagination.page,
                  totalPages: storePagination.totalPages,
                  hasNext: storePagination.hasNext,
                  hasPrevious: storePagination.hasPrevious,
                } : undefined}
                onPageChange={(page) => fetchStores(page, 12, "")}
                showSearchAndFilter
              />
            }

          </TabsContent>

          <TabsContent value='users'>
            {/* Actions Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Users</h2>
                  <p className="text-sm text-gray-600">
                    Manage your store network and monitor performance
                  </p>
                </div>
                <div className="flex gap-3 items-center w-full sm:w-auto">
                  <div className="w-full sm:w-60">
                    <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as '' | 'CUSTOMER' | 'MANAGER' | 'ADMIN')}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Role</SelectLabel>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="CUSTOMER">Customer</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <RegisterStoreAdmin />
                  <Button
                    onClick={() => fetchUsers({ page: 0, size: 12, role: selectedRole })}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Users Grid */}
            <UserGrid users={users} loading={usersLoading} error={usersError} />
          </TabsContent>

          <TabsContent value='discounts'>
            {/* Actions Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Discount</h2>
                  <p className="text-sm text-gray-600">
                    Manage promotional discounts
                  </p>
                </div>
                <div className="flex gap-3 items-center w-full sm:w-auto">
                  <CreateDiscountDialog />
                  <Button
                    onClick={() => fetchDiscount()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Discounts Grid */}
            <DiscountGrid
              discounts={discounts}
              loading={discountsLoading}
              error={discountsError || undefined}
              pagination={discountPagination ? {
                currentPage: discountPagination.page,
                totalPages: discountPagination.totalPages,
                hasNext: discountPagination.hasNext,
                hasPrevious: discountPagination.hasPrevious,
              } : undefined}
              onPageChange={() => {
                // If backend supports pagination params later, wire here
                fetchDiscount();
              }}
            />
          </TabsContent>

          <TabsContent value='chart'>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Stock Reports</h2>
                  <p className="text-sm text-gray-600">Monthly stock summary across stores and warehouses</p>
                </div>
              </div>
            </div>
            {/** Lazy load to avoid SSR issues with client store hooks */}
            {(storeForUser.length > 0 && user?.role ==='MANAGER') || user?.role === 'ADMIN'
              ?
              <Tabs defaultValue={reportTabsData[0]?.value} onValueChange={setReportTab}>
                <TabsList>
                  {reportTabsData.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={cn(
                        "rounded-none h-full border-b-2 data-[state=active]:shadow-none",
                        reportTab === tab.value
                          ? "border-green-600 text-green-600"
                          : "border-transparent"
                      )}
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value='summary'>
                  <StockReportTableDyn />
                </TabsContent>
                <TabsContent value='product'>
                  <ProductStockReportTableDyn />
                </TabsContent>
                <TabsContent value='sales'>
                  <SalesReportChart />
                  <SalesReportTableDyn />
                </TabsContent>
              </Tabs>
              :
              <p className='w-full text-center pt-20'>
                Need to be assigned to a store first
              </p>
            }

          </TabsContent>
          <TabsContent value='categories'>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
                  <p className="text-sm text-gray-600">Manage your categories</p>
                </div>
                <div className="flex gap-3 items-center w-full sm:w-auto">
                  <div className={cn(user?.role === 'MANAGER' && "hidden")}>
                    <CreateCategoryDialog />
                  </div>
                  <Button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('categories');
                      }
                      fetchCategories();
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
            <CategoryGrid
              categories={categories}
              onDelete={async (id: string) => {
                try {
                  await deleteCategory(id);
                } finally {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('categories');
                  }
                  await fetchCategories();
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
