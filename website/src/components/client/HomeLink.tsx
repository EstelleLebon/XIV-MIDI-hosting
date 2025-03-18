"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';


export function HomeLink() {
    const [isClient, setIsClient] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setIsClient(true);
    }, []);      

    return (
        <div className="text-2xl relative group">
            <Link href="/" onClick={(e) => { if (window.location.pathname === '/') { e.preventDefault(); window.location.reload(); } }}>
                <Image src="/7a27179e37e90a1c77c74e3bfccfc39e.png" alt="Logo" width={70} height={70} />
            </Link>
            {isClient && pathname === '/' && 
                <span className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 px-2 py-1 bg-black text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Refresh
                </span>
            }
            {isClient && pathname !== '/' && 
                <span className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 px-2 py-1 bg-black text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Home
                </span>
            }
        </div>
    );
}

