'use client';

import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useProductStore } from '../../store/productStore';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Product } from '@/types/product';
import { useWarehouseStore } from '@/store/warehouseStore';

const stockSchema = z.object({
  stocks: z.array(
    z.object({
      warehouseId: z.string(),
      quantity: z
        .string()
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'Stock must be a positive number')
    })
  ),
});

type StockFormValues = z.infer<typeof stockSchema>;

interface StockData {
  warehouseId: string;
  warehouseName: string;
  currentStock: number;
  newStock: string;
}

export default function ProductStock({ id, product }: { id: string, product: Product }) {
  const [open, setOpen] = useState(false);
  const { warehouses } = useWarehouseStore();
  const [stockData, setStockData] = useState<StockData[]>([]);
  const { updateProductStock } = useProductStore();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<StockFormValues>({
    resolver: zodResolver(stockSchema),
    mode: 'onBlur',
  });

  // Initialize stock data when component opens
  useEffect(() => {
    if (open) {
      const initialStockData: StockData[] = warehouses.map(warehouse => {
        // Find matching inventory for this warehouse
        const matchingInventory = product.productVersionResponse.inventories.find(
          inv => inv.warehouseID === warehouse.id
        );

        const currentStock = matchingInventory ? matchingInventory.stock : 0;

        return {
          warehouseId: warehouse.id,
          warehouseName: warehouse.name,
          currentStock: currentStock,
          newStock: currentStock.toString(),
        };
      });

      setStockData(initialStockData);

      // Set form default values
      setValue('stocks', initialStockData.map(data => ({
        warehouseId: data.warehouseId,
        quantity: data.newStock,
      })));
    }
  }, [open, warehouses, product.productVersionResponse.inventories, setValue]);

  const handleStockChange = (warehouseId: string, newValue: string) => {
    setStockData(prev =>
      prev.map(item =>
        item.warehouseId === warehouseId
          ? { ...item, newStock: newValue }
          : item
      )
    );
  };


  const onSubmit = async (data: StockFormValues) => {
    try {
      // Only prepare inventories data for items that have changed
      const inventories = data.stocks
        .filter((stock, index) => {
          const originalStock = stockData[index].currentStock;
          const newStock = Number(stock.quantity);
          return newStock !== originalStock; // Only include changed values
        })
        .map(stock => ({
          warehouseID: stock.warehouseId,
          stock: Number(stock.quantity),
        }));

      // Only proceed if there are actually changes to submit
      if (inventories.length === 0) {
        console.log('No changes detected, skipping update');
        setOpen(false);
        return;
      }

      await updateProductStock(id, inventories);

      reset();
      setOpen(false);

    } catch (error: unknown) {
      let message = 'Failed to update product stock';
      if (axios.isAxiosError(error)) {
        const axiosErr = error as AxiosError<{ message?: string }>;
        message = axiosErr.response?.data?.message || axiosErr.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setError('stocks', { message });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          reset();
          setStockData([]);
        }
      }}>
      <DialogTrigger asChild className='w-fit'>
        <Button variant={"secondary"} className='text-gray-400'>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-packages">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 16.5l-5 -3l5 -3l5 3v5.5l-5 3z" /><path d="M2 13.5v5.5l5 3" /><path d="M7 16.545l5 -3.03" /><path d="M17 16.5l-5 -3l5 -3l5 3v5.5l-5 3z" /><path d="M12 19l5 3" /><path d="M17 16.5l5 -3" /><path d="M12 13.5v-5.5l-5 -3l5 -3l5 3v5.5" /><path d="M7 5.03v5.455" /><path d="M12 8l5 -3" />
          </svg>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Stock - {product.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="flex flex-col gap-4">
            <Label className="block text-sm font-medium text-gray-700">
              Stock per Warehouse
            </Label>

            <div className="space-y-3">
              {stockData.map((item, index) => (
                <div key={item.warehouseId} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{item.warehouseName}</h4>
                      <span className="text-sm text-gray-500">
                        Current: {item.currentStock} units
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-gray-600 min-w-fit">New Stock:</Label>
                      <Controller
                        name={`stocks.${index}.quantity`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              handleStockChange(item.warehouseId, e.target.value);
                            }}
                            className="flex-1"
                            placeholder="0"
                          />
                        )}
                      />
                      <span className="text-sm text-gray-500 min-w-fit">units</span>
                    </div>

                    {/* Show difference indicator */}
                    {item.newStock !== item.currentStock.toString() && (
                      <div className="mt-2 text-xs">
                        {Number(item.newStock) > item.currentStock ? (
                          <span className="text-green-600">
                            +{Number(item.newStock) - item.currentStock} units
                          </span>
                        ) : (
                          <span className="text-red-600">
                            {Number(item.newStock) - item.currentStock} units
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Hidden field for warehouse ID */}
                  <input
                    type="hidden"
                    {...register(`stocks.${index}.warehouseId`)}
                    value={item.warehouseId}
                  />
                </div>
              ))}
            </div>

            {/* Display form errors */}
            {errors.stocks && (
              <p className="text-sm text-red-600">
                {errors.stocks.message || 'Please check stock values'}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Stock'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}