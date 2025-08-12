'use client';

import { useEffect, useMemo, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { API_CONFIG } from '../../config/api';
import { useProductStore } from '../../store/productStore';

export default function CreateProductPage() {
  const { categories, fetchCategories } = useProductStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [categoryID, setCategoryID] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const validate = useMemo(() => {
    return () => {
      const newErrors: Record<string, string> = {};

      if (!name.trim()) newErrors.name = 'Name cannot be blank';
      if (!description.trim()) newErrors.description = 'Description cannot be blank';

      if (!price.trim()) {
        newErrors.price = 'Price is required';
      } else if (isNaN(Number(price)) || Number(price) <= 0) {
        newErrors.price = 'Price must be a positive number';
      }

      if (!weight.trim()) {
        newErrors.weight = 'Weight is required';
      } else if (isNaN(Number(weight)) || Number(weight) <= 0) {
        newErrors.weight = 'Weight must be a positive number';
      }

      if (!categoryID.trim()) newErrors.categoryID = 'Category ID is required';

      return newErrors;
    };
  }, [name, description, price, weight, categoryID]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        weight: Number(weight),
        categoryID: categoryID,
      };

      await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS_CREATE}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      setSubmitSuccess('Product created successfully');
      setName('');
      setDescription('');
      setPrice('');
      setWeight('');
      setCategoryID('');
    } catch (error: unknown) {
      let message = 'Failed to create product';
      if (axios.isAxiosError(error)) {
        const axiosErr = error as AxiosError<{ message?: string }>;
        message = axiosErr.response?.data?.message || axiosErr.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h1 className="text-2xl font-semibold mb-4">Create Product</h1>

      {submitError && (
        <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-700 rounded">{submitError}</div>
      )}
      {submitSuccess && (
        <div className="mb-4 p-3 border border-green-300 bg-green-50 text-green-700 rounded">{submitSuccess}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Weight</label>
            <input
              type="number"
              step="0.01"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={categoryID}
            onChange={(e) => setCategoryID(e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryID && <p className="mt-1 text-sm text-red-600">{errors.categoryID}</p>}
        </div>

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
