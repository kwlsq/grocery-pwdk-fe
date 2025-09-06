"use client"

import "@/app/globals.css"
import { useProductStore } from '@/store/productStore';
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar/Index';
import Footer from '@/components/Footer/Index';
import LocationPrompt from '@/components/location/LocationPrompt';
import ProductGrid from '@/components/product/ProductGrid';
import { HeroSection } from '@/components/HeroSection/Index';
import { useLocationStore } from "@/store/locationStore";

export default function Home() {

  const { products, error, loading } = useProductStore();
  const [mounted, setMounted] = useState(false);

  const { categories, pagination, fetchProducts, fetchCategories } = useProductStore();
  const { status, coords } = useLocationStore();

  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchCategories();
  }, [mounted, fetchCategories]);

  useEffect(() => {
    if (!mounted) return;

    if (
      status === 'granted' &&
      coords?.userLatitude &&
      coords?.userLongitude
    ) {
      fetchProducts(
        currentPage,
        12,
        searchTerm,
        selectedCategory,
        '',
        coords.userLatitude,
        coords.userLongitude,
        1000000
      );
    }
  }, [
    mounted,
    status,
    coords?.userLatitude,
    coords?.userLongitude,
    currentPage,
    searchTerm,
    selectedCategory,
    fetchProducts
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <LocationPrompt />
      <HeroSection />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Welcome to Grocereach
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Your groceries, delivered fast.
          </p>
        </div>

        <ProductGrid
          products={products}
          loading={loading}
          error={error}
          pagination={{
            currentPage,
            totalPages: pagination?.totalPages ?? 0,
            hasNext: pagination?.hasNext ?? false,
            hasPrevious: pagination?.hasPrevious ?? false,
          }}
          onPageChange={(page) => setCurrentPage(page)}
          onSearch={(term, category) => {
            setSearchTerm(term);
            setSelectedCategory(category);
            setCurrentPage(0);
          }}
          categories={categories}
          showSearchAndFilter={true}
        />
      </main>
      <Footer />
    </div>
  );
}