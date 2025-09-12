"use client"
import React, {useState, useEffect } from 'react';
const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"/></svg>
);
const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>
);
export const HeroSection = () => {
    
    const slides = [
        {
            image: "/hero.jpg",
            title: "Crisp & Fresh Vegetables",
            subtitle: "Get up to 30% off on your first order of farm-fresh veggies.",
        },
        {
            image: "/hero 2.jpg",
            title: "Your Daily Essentials",
            subtitle: "Milk, bread, eggs, and more, delivered to your doorstep.",
        },
        {
            image: "/hero 3.jpg",
            title: "Juicy Organic Fruits",
            subtitle: "Taste the sweetness of nature with our organic fruit collection.",
        },
    ];

    const [current, setCurrent] = useState(0);

    const prev = () => setCurrent((curr) => (curr === 0 ? slides.length - 1 : curr - 1));
    const next = () => setCurrent((curr) => (curr === slides.length - 1 ? 0 : curr + 1));

    useEffect(() => {
        const slideInterval = setInterval(next, 10000); 
        return () => clearInterval(slideInterval);
    }, []);

    return (
        <div className="relative w-full overflow-hidden  shadow-lg">
            <div className="flex transition-transform ease-out duration-500" style={{ transform: `translateX(-${current * 100}%)` }}>
                {slides.map((s, i) => (
                    <div key={i} className="w-full flex-shrink-0 relative">
                        <img src={s.image} alt={s.title} className="w-full h-64 md:h-96 object-cover" />
                       
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            <div className="absolute inset-0 flex items-center justify-between p-4">
                <button onClick={prev} className="p-2 rounded-full shadow bg-white/80 text-gray-800 hover:bg-white">
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <button onClick={next} className="p-2 rounded-full shadow bg-white/80 text-gray-800 hover:bg-white">
                    <ChevronRightIcon className="h-6 w-6" />
                </button>
            </div>

            {/* Indicator Dots */}
            <div className="absolute bottom-4 right-0 left-0">
                <div className="flex items-center justify-center gap-2">
                    {slides.map((_, i) => (
                        <div
                            key={i}
                            className={`transition-all w-3 h-3 bg-white rounded-full ${current === i ? "p-2" : "bg-opacity-50"}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};