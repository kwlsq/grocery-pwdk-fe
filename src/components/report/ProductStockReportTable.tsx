"use client";

import { useEffect, useMemo, useState } from "react";
import { useStockReportStore } from "@/store/stockReportStore";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ProductStockReportTable() {
  const [month, setMonth] = useState<string>("all");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  const {
    reports,
    loading,
    error,
    productReports,
    productPagination,
    productPage,
    productSize,
    fetchReports,
    fetchProductReports,
    setProductPage,
  } = useStockReportStore();

  useEffect(() => {
    // Ensure summary reports loaded (uses existing defaults in store)
    fetchReports({ page: 0, size: 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const uniqueProducts = useMemo(() => {
    const map = new Map<string, { productID: string; productName: string; productVersion: string }>();
    for (const r of reports) {
      if (!map.has(r.productID)) {
        map.set(r.productID, { productID: r.productID, productName: r.productName, productVersion: r.productVersion });
      }
    }
    return Array.from(map.values());
  }, [reports]);

  const fetchDetails = async (prodId: string) => {
    await fetchProductReports({ productId: prodId, page: 0, size: productSize, month: month === "all" ? undefined : month });
    setProductPage(0);
  };

  useEffect(() => {
    if (!selectedProductId) return;
    // reset to first page on month change
    setProductPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  useEffect(() => {
    if (!selectedProductId) return;
    fetchProductReports({ productId: selectedProductId, page: productPage, size: productSize, month: month === "all" ? undefined : month });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId, productPage]);

  return (
    <div className="space-y-4">
      {!selectedProductId ? (
        <>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {uniqueProducts.map((p) => (
              <div key={p.productID} className="border rounded-md p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.productName}</div>
                  <div className="text-xs text-gray-500">Version: {p.productVersion}</div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedProductId(p.productID);
                    setSelectedProductName(p.productName);
                    fetchDetails(p.productID);
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
            <div className="flex items-center gap-2">
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
              <Button variant="secondary" onClick={() => { setSelectedProductId(""); setSelectedProductName(""); }}>Back</Button>
            </div>
          </div>
          <div className="border rounded-md overflow-hidden">
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


