"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { toggleMenu, fetchMenuItems, setHighlightedMenu } from "../../redux/slices/sideBarSlice";
import { RootState } from "../../redux/store";

interface SidebarProps {
  setActiveMenu: (menu: string) => void; // ✅ Pastikan setActiveMenu bertipe function dengan string sebagai parameter
}

export default function Sidebar({ setActiveMenu }:SidebarProps) {
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { menuItems, openMenus, loading } = useSelector((state: RootState) => state.sidebar);

  useEffect(() => {
    dispatch(fetchMenuItems() as any);
  }, [dispatch]);

  if (loading) {
    return <p className="text-white p-4">Loading menu...</p>;
  }
  

  return (
    <div className="relative bg-[#ffffff]">
      <div className={`${!isSidebarOpen ? 'absolute top-6 left-6' : 'hidden'}`}>
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Image src="/icons/menu_open.png" alt="Logo" height={24} width={24} />
          </button>
      </div>
      <div className={`card bg-[#101828] text-white mr-4 h-screen ml-2 p-4 mt-2 flex flex-col transition-all rounded-3xl overflow-hidden w-[240px]p- ${
          isSidebarOpen ? "translate-x-0  w-[240px]" : "-translate-x-48 w-[40px]"
        } `}>
        <div className="flex items-center justify-between h-[84px] rounded-t-xl bg-[#101828]">
          <Image src="/icons/logo.png" alt="Logo" height={21} width={70} />
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Image src="/icons/toggel_sidebar.png" alt="Logo" height={21} width={21} />
          </button>
          
        </div>

        {/* Menu List */}
        <ul className="space-y-2 mt-4">
          {menuItems.map((menu, index) => {
            return (
              <li key={index}>
                <button
                  className={`flex items-center w-full p-2 rounded-lg transition ${
                    openMenus[menu.title] ? "bg-gray-700 text-white" : "bg-transparent text-gray-500"
                  } hover:bg-gray-600`}
                  onClick={() => dispatch(toggleMenu(menu.title))}
                >
                  <div className="w-8 flex justify-center">
                    <Image
                      src={menu.icon}
                      alt={menu.title}
                      width={24}
                      height={24}
                      className={openMenus[menu.title] ? "filter brightness-0 invert" : "opacity-60"}
                    />
                  </div>
                  <span className="flex-1 ml-2 text-left">{menu.title}</span>
                  {menu.children && <span>{openMenus[menu.title] ? "▼" : "▶"}</span>}
                </button>

                {/* Submenu */}
                {menu.children && openMenus[menu.title] && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 space-y-2"
                  >
                    {menu.children.map((child, i) => (
                      <li key={i}>
                        <button
                          className={`flex items-center w-full p-2 rounded-lg transition ${
                            child.highlight
                              ? "bg-green-500 text-black font-semibold"
                              : "hover:bg-gray-700 text-gray-400"
                          }`}
                          onClick={() => {
                            dispatch(setHighlightedMenu(child.title))
                            setActiveMenu(child.title)
                          }}
                        >
                          <div className="w-8 flex justify-center">
                            <Image
                              src={child.icon}
                              alt={child.title}
                              width={20}
                              height={20}
                              className={child.highlight ? "filter brightness-0 invert" : "opacity-60"}
                            />
                          </div>
                          <span className="flex-1 text-left">{child.title}</span>
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
