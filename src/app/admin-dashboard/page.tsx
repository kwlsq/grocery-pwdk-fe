'use client';

import { useEffect, useState } from 'react';
import { useStoreStore } from '../../store/storeStore';
import StoreGrid from '../../components/store/StoreGrid';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { useUsersStore } from '../../store/userStore';
import UserGrid from '@/components/user/UserGrid';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import RegisterStoreAdmin from '../../components/store/RegisterStoreAdminDialog';
import { Button } from '@/components/ui/button';
import { useDiscountStore } from '@/store/discountStore';
import DiscountGrid from '@/components/discount/DiscountGrid';
import dynamic from 'next/dynamic';
const StockReportTableDyn = dynamic(() => import('@/components/report/StockReportTable'), { ssr: false });
import CreateDiscountDialog from '@/components/discount/CreateDiscountDialog';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useWarehouseStore } from '@/store/warehouseStore';
import WarehouseGrid from '@/components/warehouse/WarehouseGrid';
import Navbar from '../../components/Navbar/Index';

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('stores');
  const { stores, loading, error, fetchStores } = useStoreStore();
  const { users, loading: usersLoading, error: usersError, fetchUsers, selectedRole, setSelectedRole } = useUsersStore();
  const { discounts, loading: discountsLoading, error: discountsError, pagination, fetchDiscount } = useDiscountStore();
  const { user } = useAuthStore();
  const { warehouse, fetchWarehouseByUser } = useWarehouseStore();

  // Tab configuration data
  const tabsData =
    user?.role === 'ADMIN'
      ? [
        { value: 'stores', label: 'Store' },
        { value: 'users', label: 'User' },
        { value: 'discounts', label: 'Discount' },
        { value: 'chart', label: 'Report' }
      ]
      : user?.role === 'MANAGER'
        ? [
          { value: 'warehouse', label: 'Warehouse' },
          { value: 'discounts', label: 'Discount' },
          { value: 'chart', label: 'Report' }
        ]
        : [
          { value: 'stores', label: 'Store' },
          { value: 'users', label: 'User' },
          { value: 'discounts', label: 'Discount' },
          { value: 'chart', label: 'Report' }
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
    fetchUsers({ page: 0, size: 12, role: selectedRole });
  }, [mounted, fetchUsers, selectedRole]);

  useEffect(() => {
    if (!mounted) return;
    fetchDiscount();
  }, [mounted, fetchDiscount]);

  useEffect(() => {
    if (!mounted) return;
    if (user?.role !== 'MANAGER') return;
    console.log(user?.role);
    
    fetchWarehouseByUser();
  }, [mounted, fetchWarehouseByUser, user])


  useEffect(() => {
    setActiveTab(tabsData[0].value);
  }, [])


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your stores and monitor their status
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Stores</p>
                <p className="text-2xl font-semibold text-gray-900">{stores.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Active Stores</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stores.filter(store => store.active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive Stores</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stores.filter(store => !store.active).length}
                </p>
              </div>
            </div>
          </div>
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

          <TabsContent value='warehouse'>
            {/* Actions Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Stores</h2>
                  <p className="text-sm text-gray-600">
                    Manage your store network and monitor performance
                  </p>
                </div>
              </div>
            </div>

            {/* Warehouse Grid */}
            <WarehouseGrid warehouses={warehouse ? [warehouse] : []} />
          </TabsContent>

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
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Store
                  </button>
                  <Button
                    onClick={fetchStores}
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
            <StoreGrid stores={stores} loading={loading} error={error} />
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
              pagination={pagination ? {
                currentPage: pagination.page,
                totalPages: pagination.totalPages,
                hasNext: pagination.hasNext,
                hasPrevious: pagination.hasPrevious,
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
            <StockReportTableDyn />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
