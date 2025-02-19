"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import MenuDetails from "./pages/MenuDetails";
import Image from "next/image";

export default function Home() {
  const [activeMenu, setActiveMenu] = useState<string>("Menus");

  return (
    <div className="flex">
      <Sidebar setActiveMenu={setActiveMenu} />
      <main className="flex-1 p-6  ">
        {/* Breadcrumb */}
        <nav className="text-gray-500 text-sm flex items-center space-x-2 mb-4">
           <Image
                                src={"/icons/folder.png"}
                                alt={"System"}
                                width={24}
                                height={24}
                              />
          <span className="text-xl">/</span>
          <span className="text-gray-900 text-xl font-semibold">{activeMenu}</span>
        </nav>

        {/* Konten Berdasarkan Menu Aktif */}
        {activeMenu === "Menus" ? (
          <MenuDetails />
        ) : (
          <h1 className="text-2xl font-bold text-black">Currently in development...</h1>
        )}
      </main>
    </div>
  );
}
