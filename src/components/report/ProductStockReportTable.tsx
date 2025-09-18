"use client";

import { useEffect, useMemo, useState } from "react";
import { useStockReportStore } from "@/store/stockReportStore";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProductStore } from "@/store/productStore";
import { useStoreStore } from "@/store/storeStore";
import { useWarehouseStore } from "@/store/warehouseStore";
import { useAuthStore } from "@/store/authStore";

export default function ProductStockReportTable() {
  const [month, setMonth] = useState<string>("all");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  const {
    loading,
    error,
    productReports,
    productPagination,
    productPage,
    productSize,
    fetchProductReports,
    setProductPage,
  } = useStockReportStore();

  const { uniqueProducts, fetchUniqueProduct } = useProductStore();
  const { stores, store, fetchStores, fetchStoreByUser } = useStoreStore();
  const { uniqueWarehouses, fetchUniqueWarehouse } = useWarehouseStore();
  const { user } = useAuthStore();

  const isManager = user?.role === 'MANAGER';
  const [storeId, setStoreId] = useState<string>("");
  const [warehouseId, setWarehouseId] = useState<string>("");

  useEffect(() => {
    // Load stores and products; set manager's store if applicable
    fetchStores();
    if (isManager) {
      fetchStoreByUser();
    }
    fetchUniqueProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize fixed store for manager and load its warehouses
  useEffect(() => {
    if (isManager && store) {
      setStoreId(store.id);
      fetchUniqueWarehouse(store.id);
      setWarehouseId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, isManager]);

  // When non-manager selects a store, load its warehouses and reset selected warehouse
  useEffect(() => {
    if (!isManager) {
      if (storeId) {
        fetchUniqueWarehouse(storeId);
        setWarehouseId("");
      } else if (warehouseId) {
        setWarehouseId("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, isManager]);

  const monthOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [{ value: "all", label: "All months" }];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      opts.push({ value: `${y}-${m}`, label: `${y}-${m}` });
    }
    return opts;
  }, []);

  useEffect(() => {
    if (!selectedProductId) return;
    // reset to first page on month change
    setProductPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  useEffect(() => {
    if (!selectedProductId) return;
    fetchProductReports({
      productId: selectedProductId,
      page: productPage,
      size: productSize,
      month: month === "all" ? undefined : month,
      storeId: storeId || undefined,
      warehouseId: warehouseId || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId, productPage, storeId, warehouseId, month]);

  return (
    <div className="space-y-4">
      {!selectedProductId ? (
        <>
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Month</span>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Month</SelectLabel>
                    {monthOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Store</span>
              <Select
                value={isManager ? (store?.id || "") : storeId}
                onValueChange={(v) => { if (!isManager) setStoreId(v); }}
              >
                <SelectTrigger className="w-56" disabled={isManager}>
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
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Warehouse</span>
              <Select
                value={warehouseId}
                onValueChange={setWarehouseId}
                disabled={isManager ? !store?.id : !storeId}
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Warehouses</SelectLabel>
                    {uniqueWarehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {uniqueProducts.map((p) => (
              <div key={p.id} className="border rounded-md p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.name}</div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedProductId(p.id);
                    setSelectedProductName(p.name);
                  }}
                >
                  View
                </Button>
              </div>
            ))}
            {uniqueProducts.length === 0 && (
              <div className="text-gray-500">No products found.</div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="font-semibold">{selectedProductName}</div>
            <div className="flex flex-wrap items-end gap-2">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Month</SelectLabel>
                    {monthOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={isManager ? (store?.id || "") : storeId}
                onValueChange={(v) => { if (!isManager) setStoreId(v); }}
              >
                <SelectTrigger className="w-56" disabled={isManager}>
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
                value={warehouseId}
                onValueChange={setWarehouseId}
                disabled={isManager ? !store?.id : !storeId}
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Warehouses</SelectLabel>
                    {uniqueWarehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button variant="secondary" onClick={() => { setSelectedProductId(""); setSelectedProductName(""); }}>Back</Button>
            </div>
          </div>
          <div className="border rounded-md overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Journal</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7}>Loading...</TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-red-600">{error}</TableCell>
                  </TableRow>
                ) : productReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>No data</TableCell>
                  </TableRow>
                ) : (
                  productReports.map((it, idx) => (
                    <TableRow key={`${it.timestamp}-${idx}`}>
                      <TableCell>{new Date(it.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{it.warehouseName}</TableCell>
                      <TableCell>{it.productVersion}</TableCell>
                      <TableCell>{it.stockChange}</TableCell>
                      <TableCell>{it.journal}</TableCell>
                      <TableCell>{Number(it.price).toFixed(2)}</TableCell>
                      <TableCell>{it.changeType}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => productPagination?.hasPrevious && setProductPage(Math.max(0, productPage - 1))} disabled={!productPagination?.hasPrevious}>Previous</Button>
            <Button variant="outline" onClick={() => productPagination?.hasNext && setProductPage(productPage + 1)} disabled={!productPagination?.hasNext}>Next</Button>
          </div>
        </>
      )}
    </div>
  );
}


