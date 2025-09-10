"use client";

import { useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStockReportStore } from "@/store/stockReportStore";
import { useStoreStore } from "@/store/storeStore";
import { useWarehouseStore } from "@/store/warehouseStore";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";

export default function StockReportTable() {
  const {
    reports,
    loading,
    error,
    pagination,
    page,
    size,
    filters,
    fetchReports,
    setPage,
    setFilters,
  } = useStockReportStore();

  const { stores, fetchStores } = useStoreStore();
  const { warehouse, warehouses, fetchWarehouses, fetchWarehouseByUser } = useWarehouseStore();
  const { user } = useAuthStore();

  const isManager = user?.role === 'MANAGER';

  useEffect(() => {
    fetchStores();

    // If manager, fetch their warehouse first
    if (isManager) {
      fetchWarehouseByUser();
    } else {
      // For non-managers, fetch reports immediately
      fetchReports({ page: 0, size });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to handle manager's warehouse data and auto-filter
  useEffect(() => {
    if (isManager && warehouse) {
      // Set filters with manager's store and warehouse
      const managerFilters = {
        storeId: warehouse.storeID,
        warehouseId: warehouse.id,
      };
      setFilters(managerFilters);

      // Fetch reports with manager's filters
      fetchReports({
        page: 0,
        size,
        filters: managerFilters
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouse, isManager]);

  useEffect(() => {
    if (!isManager && filters.storeId) {
      fetchWarehouses(filters.storeId);
      // reset warehouse when store changes
      setFilters({ ...filters, warehouseId: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.storeId, isManager]);
  useEffect(() => {
    fetchStores();
    fetchReports({ page: 0, size });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filters.storeId) {
      fetchWarehouses(filters.storeId);
      // reset warehouse when store changes
      setFilters({ ...filters, warehouseId: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.storeId]);

  const handlePrev = () => {
    if (pagination?.hasPrevious) {
      const prev = Math.max(0, page - 1);
      setPage(prev);
      fetchReports({ page: prev });
    }
  };

  const handleNext = () => {
    if (pagination?.hasNext) {
      const next = page + 1;
      setPage(next);
      fetchReports({ page: next });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 items-end">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 w-full">
          <Input
            placeholder="Filter by product name"
            value={filters.productName || ""}
            onChange={(e) => setFilters({ ...filters, productName: e.target.value })}
          />
          <Select
            value={filters.storeId || ""}
            onValueChange={(v) => setFilters({ ...filters, storeId: v })}
          >
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
          <Select
            value={filters.warehouseId || ""}
            onValueChange={(v) => setFilters({ ...filters, warehouseId: v })}
            disabled={!filters.storeId}
          >
            <SelectTrigger disabled={user?.role !== 'ADMIN'}>
              <SelectValue placeholder="Select Warehouse" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Warehouses</SelectLabel>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Input
            placeholder="Month (YYYY-MM)"
            value={filters.month || ""}
            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
          />
        </div>
        <Button onClick={() => fetchReports({ page: 0 })} className="sm:ml-2">Apply</Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Additions</TableHead>
              <TableHead className="text-right">Reductions</TableHead>
              <TableHead className="text-right">Final Stock</TableHead>
              <TableHead className="text-right">Avg. Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9}>Loading...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={9} className="text-red-600">{error}</TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>No data</TableCell>
              </TableRow>
            ) : (
              reports.map((r, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    r.productName
                  </TableCell>
                  <TableCell>{r.storeName}</TableCell>
                  <TableCell>{r.warehouseName}</TableCell>
                  <TableCell>{r.month}</TableCell>
                  <TableCell className="text-right text-green-600">{r.totalAddition}</TableCell>
                  <TableCell className="text-right text-red-500">{r.totalReduction}</TableCell>
                  <TableCell className="text-right">{r.finalStock}</TableCell>
                  <TableCell className="text-right">{r.averagePrice.toLocaleString(undefined, { style: 'currency', currency: 'IDR' })}</TableCell>
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


