'use client';

import { useFieldArray, useFormContext, FieldValues } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from "@/components/ui/input";
import { Label } from '../ui/label';
import { UniqueWarehouse } from '@/types/warehouse';

interface StockField {
  selected: boolean;
  quantity: number;
}

interface FormData extends FieldValues {
  stocks: StockField[];
}

interface WarehouseStockSelectorProps {
  warehouses: UniqueWarehouse[];
}

export default function WarehouseStockSelector({ warehouses }: WarehouseStockSelectorProps) {
  const { watch, setValue, register, formState: { errors } } = useFormContext<FormData>();

  const { fields } = useFieldArray({
    name: 'stocks',
  });

  return (
    <div className="flex flex-col gap-2">
      <Label className="block text-sm font-medium text-gray-700">Stock in warehouse</Label>
      {fields.map((field, index) => {
        const isChecked = watch(`stocks.${index}.selected`);

        return (
          <div key={field.id} className="flex items-center">
            <div className='w-2/3 flex items-center gap-2'>
              <Checkbox
                checked={isChecked}
                onCheckedChange={(checked) =>
                  setValue(`stocks.${index}.selected`, !!checked, {
                    shouldValidate: true,
                  })
                }
              />

              {/* Warehouse name */}
              <p className="w-full">{warehouses[index]?.name}</p>
            </div>
            <Input
              type="number"
              step="0.01"
              {...register(`stocks.${index}.quantity` as const)}
              disabled={!isChecked}
              className='w-1/3'
            />

            {/* Error message */}
            {errors.stocks?.[index]?.quantity && (
              <p className="mt-1 text-sm text-red-600">
                {(errors.stocks[index]?.quantity)?.message}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}