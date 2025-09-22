"use client";

import { useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSalesReportStore } from "@/store/salesReportStore";
import { useStoreStore } from "@/store/storeStore";
import { useProductStore } from "@/store/productStore";
import { useAuthStore } from "@/store/authStore";

export default function SalesReportTable() {
  const { sales, loading, error, pagination, page, size, filters, fetchSales, setPage, setFilters } = useSalesReportStore();
  const { uniqueStores, fetchUniqueStores, store, fetchStoreByUser } = useStoreStore();
  const { categories, fetchCategories, uniqueProducts, fetchUniqueProduct } = useProductStore();
  const { user } = useAuthStore();

  // Initial data fetches based on role
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchUniqueStores();
      fetchSales({ page: 0, size });
    } else if (user?.role === 'MANAGER') {
      fetchStoreByUser();
    }

    fetchCategories();
    fetchUniqueProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === 'MANAGER' && store?.id) {
      if (filters.storeId !== store.id) {
        setFilters({ ...filters, storeId: store.id });
      }
      fetchSales({ page: 0, size, filters: { storeId: store.id } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, store?.id]);

  const handlePrev = () => {
    if (pagination?.hasPrevious) {
      const prev = Math.max(0, page - 1);
      setPage(prev);
      fetchSales({ page: prev });
    }
  };

  const handleNext = () => {
    if (pagination?.hasNext) {
      const next = page + 1;
      setPage(next);
      fetchSales({ page: next });
    }
  };

  // Load unique store if empty
  useEffect(() => {
    if (user?.role === 'ADMIN' && uniqueStores.length === 0) {
      fetchUniqueStores();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 items-end">
        <div className="flex justify-between w-full">
          <div className="flex gap-2 w-full">
            <Select value={filters.storeId || (user?.role === 'MANAGER' ? (store?.id || "") : "")} onValueChange={(v) => setFilters({ ...filters, storeId: v })}>
              <SelectTrigger disabled={user?.role !== 'ADMIN'}>
                <SelectValue placeholder="Select Store" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Stores</SelectLabel>
                  {user?.role === 'ADMIN' && uniqueStores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                  {user?.role === 'MANAGER' && store?.id && (
                    <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select value={filters.categoryId || ""} onValueChange={(v) => setFilters({ ...filters, categoryId: v })}>
              <SelectTrigger disabled={user?.role !== 'ADMIN'}>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select value={filters.productId || ""} onValueChange={(v) => setFilters({ ...filters, productId: v })}>
              <SelectTrigger disabled={user?.role !== 'ADMIN'}>
                <SelectValue placeholder="Select Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Products</SelectLabel>
                  {uniqueProducts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 w-fit">
            <Input
              placeholder="Start Month (YYYY-MM)"
              value={filters.startMonth || ""}
              onChange={(e) => setFilters({ ...filters, startMonth: e.target.value })}
              className="w-fit"
            />
            <Input
              placeholder="End Month (YYYY-MM)"
              value={filters.endMonth || ""}
              onChange={(e) => setFilters({ ...filters, endMonth: e.target.value })}
              className="w-fit"
            />
          </div>
        </div>
        <Button onClick={() => fetchSales({ page: 0 })} className="sm:ml-2">Apply</Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Updated</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Store</TableHead>
              <TableHead className="text-right">Total Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5}>Loading...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-red-600">{error}</TableCell>
              </TableRow>
            ) : sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No data</TableCell>
              </TableRow>
            ) : (
              sales.map((r) => (
                <TableRow key={r.orderId}>
                  <TableCell>{new Date(r.updatedAt).toLocaleString()}</TableCell>
                  <TableCell>{r.orderId}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell>{r.storeName}</TableCell>
                  <TableCell className="text-right">{r.totalRevenue.toLocaleString(undefined, { style: 'currency', currency: 'IDR' })}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={handlePrev} className={!pagination.hasPrevious ? "pointer-events-none opacity-50" : ""} href="#" />
            </PaginationItem>
            <span className="px-2 text-sm self-center">
              Page {pagination.page + 1} of {pagination.totalPages}
            </span>
            <PaginationItem>
              <PaginationNext onClick={handleNext} className={!pagination.hasNext ? "pointer-events-none opacity-50" : ""} href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}


