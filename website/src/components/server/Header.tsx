"use server";
import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { HomeLink } from '../client/HomeLink';


const Header = () => {
    return (
        <nav className="w-full mx-auto h-80px flex items-center justify-between p-4" style={{maxHeight: "80px", backgroundImage: "url('/headbg.png')", backgroundSize: "100%", backgroundPosition: "center"}}>
            <HomeLink />
            <div className="flex gap-4 text-gray-200 relative group">
                <Link href="/solo" className="border rounded-lg bg-gray-600 p-1 hover:text-gray-800 hover:bg-gray-200 transition-colors duration-300">Solos</Link>
                <Link href="/duet" className="border rounded-lg bg-gray-600 p-1 hover:text-gray-800 hover:bg-gray-200 transition-colors duration-300">Duets</Link>
                <Link href="/trio" className="border rounded-lg bg-gray-600 p-1 hover:text-gray-800 hover:bg-gray-200 transition-colors duration-300">Trios</Link>
                <Link href="/quartet" className="border rounded-lg bg-gray-600 p-1 hover:text-gray-800 hover:bg-gray-200 transition-colors duration-300">Quartets</Link>
                <Link href="/quintet" className="border rounded-lg bg-gray-600 p-1 hover:text-gray-800 hover:bg-gray-200 transition-colors duration-300">Quintets</Link>
                <Link href="/sextet" className="border rounded-lg bg-gray-600 p-1 hover:text-gray-800 hover:bg-gray-200 transition-colors duration-300">Sextets</Link>
                <Link href="/septet" className="border rounded-lg bg-gray-600 p-1 hover:text-gray-800 hover:bg-gray-200 transition-colors duration-300">Septets</Link>
                <Link href="/octet" className="border rounded-lg bg-gray-600 p-1 hover:text-gray-800 hover:bg-gray-200 transition-colors duration-300">Octets</Link>
            </div>
            <div className="text-2xl relative group">
                <Link href="https://discord.gg/bard-midi-library-998261522683924491" target="_blank" rel="noopener noreferrer">
                    <Image src="/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg" alt="Discord_Link" width={40} height={40} style={{ width: 40 , height: 40 }}/>
                </Link>
                <span className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 px-2 py-1 bg-black text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Join Discord
                </span>
            </div>
        </nav>
    );
};

export default Header;