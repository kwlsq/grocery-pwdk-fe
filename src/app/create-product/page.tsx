'use client';

import { useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { API_CONFIG } from '../../config/api';
import { useProductStore } from '../../store/productStore';
import { useWarehouseStore } from '@/store/warehouseStore';
import { z } from 'zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

const productSchema = z.object({
  name: z.string().min(1, 'Name cannot be blank'),
  description: z.string().min(1, 'Description cannot be blank'),
  price: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Price must be a positive number'),
  weight: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Weight must be a positive number'),
  categoryID: z.string().min(1, 'Category ID is required'),
  stocks: z.array(
    z.object({
      warehouseId: z.string(),
      selected: z.boolean(),
      quantity: z
        .string()
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'Quantity must be a positive number')
        .optional(),
    })
  ),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function CreateProductPage() {
  const { categories, fetchCategories } = useProductStore();
  const { warehouses } = useWarehouseStore();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      weight: '',
      categoryID: '',
      stocks: warehouses.map((w) => ({
        warehouseId: w.id,
        selected: false,
        quantity: '',
      })),
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const { fields } = useFieldArray({
    control,
    name: 'stocks',
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const payload = {
        name: data.name.trim(),
        description: data.description.trim(),
        price: Number(data.price),
        weight: Number(data.weight),
        categoryID: data.categoryID,
      };

      await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS_CREATE}`,
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      reset();
      alert('✅ Product created successfully');
    } catch (error: unknown) {
      let message = 'Failed to create product';
      if (axios.isAxiosError(error)) {
        const axiosErr = error as AxiosError<{ message?: string }>;
        message = axiosErr.response?.data?.message || axiosErr.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setError('name', { message });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h1 className="text-2xl font-semibold mb-4">Create Product</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <Input type="text" {...register('name')} placeholder='Input your product name' />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <Textarea
          {...register('description')}
            placeholder="Your product's description"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        {/* Price & Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <Input type="number" step="0.01" {...register('price')} placeholder="Product prices" />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Weight</label>
            <Input type="number" step="0.01" {...register('weight')} />
            {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            {...register('categoryID')}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryID && <p className="mt-1 text-sm text-red-600">{errors.categoryID.message}</p>}
        </div>

        {/* Stock per warehouse */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Stock</label>
          {fields.map((field, index) => {
            const isChecked = watch(`stocks.${index}.selected`);

            return (
              <div key={field.id} className="flex items-center gap-5">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    setValue(`stocks.${index}.selected`, !!checked, {
                      shouldValidate: true,
                    })
                  }
                />

                {/* Warehouse name */}
                <p className="w-full">{warehouses[index].name}</p>

                <Input
                  type="number"
                  step="0.01"
                  {...register(`stocks.${index}.quantity` as const)}
                  disabled={!isChecked}
                />

                {/* Error message */}
                {errors.stocks?.[index]?.quantity && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.stocks[index]?.quantity?.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>


        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            {isSubmitting ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
