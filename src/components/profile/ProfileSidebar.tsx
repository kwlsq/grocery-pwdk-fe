'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg> );
const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> );

export const ProfileSidebar = () => {
    const pathname = usePathname();

    const navItems = [
        { href: '/profile', label: 'My Profile', icon: UserCircleIcon },
        { href: '/addresses', label: 'My Addresses', icon: MapPinIcon },
    ];

    return (
        <aside className="md:col-span-1">
            <nav className="space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                isActive
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Icon className={`mr-3 h-6 w-6 ${
                                isActive
                                    ? 'text-emerald-500'
                                    : 'text-gray-400 group-hover:text-gray-500'
                            }`} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};

