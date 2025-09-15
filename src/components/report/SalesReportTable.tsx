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
  const { stores, fetchStores } = useStoreStore();
  const { categories, fetchCategories } = useProductStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchStores();
    fetchCategories();
    fetchSales({ page: 0, size });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 items-end">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 w-full">
          <Select value={filters.storeId || ""} onValueChange={(v) => setFilters({ ...filters, storeId: v })}>
            <SelectTrigger disabled={user?.role !== 'ADMIN'}>
              <SelectValue placeholder="Select Store" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Stores</SelectLabel>
                {stores.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
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

          <Input
            placeholder="Product ID (optional)"
            value={filters.productId || ""}
            onChange={(e) => setFilters({ ...filters, productId: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Start Month (YYYY-MM)"
              value={filters.startMonth || ""}
              onChange={(e) => setFilters({ ...filters, startMonth: e.target.value })}
            />
            <Input
              placeholder="End Month (YYYY-MM)"
              value={filters.endMonth || ""}
              onChange={(e) => setFilters({ ...filters, endMonth: e.target.value })}
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


