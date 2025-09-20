'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDownIcon } from 'lucide-react';
import { useDiscountStore } from '@/store/discountStore';
import { z } from 'zod';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';

const discountSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().min(1, 'Description is required').max(500),
    value: z.number().min(0, 'Value must be positive'),
    minPurchase: z.number().min(0, 'Minimum purchase must be positive'),
    startAt: z.date({ message: 'Start date is required' }),
    endAt: z.date({ message: 'End date is required' }),
    type: z.enum(['PRODUCT_DISCOUNT', 'TRANSACTION_DISCOUNT', 'SHIPPING_DISCOUNT', 'REFERRAL']),
    unit: z.enum(['PERCENTAGE', 'NOMINAL', 'PRODUCT'])
  })
  .refine((data) => data.endAt > data.startAt, {
    message: 'End date must be after start date',
    path: ['endAt'],
  })
  .refine((data) => (data.unit === 'PERCENTAGE' ? data.value <= 100 : true), {
    message: 'Percentage discount cannot exceed 100%',
    path: ['value'],
  });

type DiscountFormValue = z.infer<typeof discountSchema>;

export default function CreateDiscountDialog() {
  const [open, setOpen] = useState(false);
  const [openStart, setOpenStart] = useState(false); // separate state for Start Popover
  const [openEnd, setOpenEnd] = useState(false); // separate state for End Popover
  const { createDiscount, loading } = useDiscountStore();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DiscountFormValue>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      name: '',
      description: '',
      value: 0,
      minPurchase: 0,
      startAt: undefined,
      endAt: undefined,
      type: 'PRODUCT_DISCOUNT',
    },
  });

  const onSubmit = async (data: DiscountFormValue) => {
    try {

      await createDiscount({
        name: data.name.trim(),
        description: data.description.trim(),
        value: data.value,
        minPurchase: data.minPurchase,
        startAt: data.startAt.toISOString(),
        endAt: data.endAt.toISOString(),
        type: data.type,
        unit: data.unit
      });

      toast.success('Discount created successfully!');
      reset();
      setOpen(false);
    } catch (error) {
      toast.error('Failed to create discount: ' + error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
          </svg>
          Create Discount
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Discount</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} className={errors.name ? 'border-red-500' : ''} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} className={errors.description ? 'border-red-500' : ''} />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          {/* Type */}
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Type</SelectLabel>
                      <SelectItem value="PRODUCT_DISCOUNT">Product Discount</SelectItem>
                      <SelectItem value="TRANSACTION_DISCOUNT">Transaction Discount</SelectItem>
                      <SelectItem value="SHIPPING_DISCOUNT">Shipping Discount</SelectItem>
                      <SelectItem value="REFERRAL">Referral</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
          </div>

          {/* Unit */}
          <div className="grid gap-2">
            <Label htmlFor="unit">Unit</Label>
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Unit</SelectLabel>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="NOMINAL">Nominal</SelectItem>
                      <SelectItem value="PRODUCT">Product</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.unit && <p className="text-sm text-red-500">{errors.unit.message}</p>}
          </div>

          {/* Value */}
          <div className="grid gap-2">
            <Label htmlFor="value">Value</Label>
            <Input id="value" type="number" {...register('value', { valueAsNumber: true })} />
            {errors.value && <p className="text-sm text-red-500">{errors.value.message}</p>}
          </div>

          {/* Minimum Purchase */}
          <div className="grid gap-2">
            <Label htmlFor="minPurchase">Minimum Purchase</Label>
            <Input id="minPurchase" type="number" {...register('minPurchase', { valueAsNumber: true })} />
            {errors.minPurchase && <p className="text-sm text-red-500">{errors.minPurchase.message}</p>}
          </div>

          {/* Start Date */}
          <div className="grid gap-2">
            <Label>Start Date</Label>
            <Controller
              name="startAt"
              control={control}
              render={({ field }) => {
                return (
                  <Popover open={openStart} onOpenChange={setOpenStart}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {field.value ? field.value.toLocaleDateString() : 'Select date'}
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setOpenStart(false);
                        }}
                        disabled={(date) => date < new Date()} // No past dates
                      />
                    </PopoverContent>
                  </Popover>
                );
              }}
            />
            {errors.startAt && <p className="text-sm text-red-500">{errors.startAt.message}</p>}
          </div>

          {/* End Date */}
          <div className="grid gap-2">
            <Label>End Date</Label>
            <Controller
              name="endAt"
              control={control}
              render={({ field }) => {
                return (
                  <Popover open={openEnd} onOpenChange={setOpenEnd}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {field.value ? field.value.toLocaleDateString() : 'Select date'}
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setOpenEnd(false);
                        }}
                        disabled={(date) =>
                          date <= (control._formValues.startAt || new Date())
                        } // end date must be after start date
                      />
                    </PopoverContent>
                  </Popover>
                );
              }}
            />
            {errors.endAt && <p className="text-sm text-red-500">{errors.endAt.message}</p>}
          </div>


          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
