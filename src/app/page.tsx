

import React from 'react';
import Navbar from '@/components/Navbar/Index';
import Footer from '@/components/Footer/Index';
import LocationPrompt from '@/components/Location/LocationPrompt';
import ProductGrid from '@/components/product/ProductGrid';
import { HeroSection } from '@/components/HeroSection/Index';





export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar/>
      <LocationPrompt/>
      <HeroSection/>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Welcome to Grocereach
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Your groceries, delivered fast.
          </p>
        </div>
        
        <ProductGrid />
      </main>
<ProductGrid/>
      <Footer/>
    </div>
  );
}