"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMenuHierarchy, getMenusById, fetchMenus, updateMenuById, createMenu } from "../../redux/slices/menuSlice";
import TreeView from "../components/menuTree";
import { AppDispatch, RootState } from "../../redux/store";

const MenuDetails = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedMenu, menus } = useSelector((state: RootState) => state.menu);

  // State untuk menyimpan perubahan
  const [id, setId] = useState("");
  const [parentId, setParentId] = useState("");
  const [depth, setDepth] = useState(1); // Default depth 1 jika tidak ada parent
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false); // Untuk indikator loading
  const [message, setMessage] = useState(""); // Untuk menampilkan pesan sukses/gagal

  // Fetch data saat komponen pertama kali dirender
  useEffect(() => {
    dispatch(fetchMenuHierarchy());
    dispatch(fetchMenus());
    setId("");
      setParentId( "");
      setDepth(0);
      setName( "");
  }, [dispatch]);

  // Mengisi awalnya dari selectedMenu
  useEffect(() => {
    if (selectedMenu) {
      setId(selectedMenu.id || "");
      setParentId(selectedMenu.parentId || "");
      setDepth(selectedMenu.depth || 1);
      setName(selectedMenu.name || "");
    }
  }, [selectedMenu]);

  const dispose=()=>{
    setId("");
      setParentId( "");
      setDepth(0);
      setName( "");
  }
  // Update depth berdasarkan parent yang dipilih
  useEffect(() => {
    if (parentId) {
      const parentMenu = menus.find((menu) => menu.id === parentId);
      setDepth((parentMenu?.depth || 0) + 1); // Jika parent ada, depth = parent.depth + 1
    } else {
      setDepth(0); // Jika tidak ada parent, depth = 1
    }
  }, [parentId, menus]);

  // Fungsi untuk menyimpan data ke server
  const handleSave = () => { 
    const data = { name, parentId, depth }; 
    if (id) {
      // Update existing menu
      dispatch(updateMenuById({ id, data }))
        .unwrap()
        .then(() => {
          alert("Menu updated successfully!");
          dispatch(fetchMenus());
          dispatch(fetchMenuHierarchy());
          dispose()
        })
        .catch((error) => {
          alert(`Error updating menu: ${error}`);
        });
    } else {
      // Create new menu
      dispatch(createMenu({data}))
        .unwrap()
        .then(() => {
          alert("Menu created successfully!");
          dispatch(fetchMenus());
          dispatch(fetchMenuHierarchy());
          dispose()
        })
        .catch((error) => {
          alert(`Error create menu: ${error}`);
        });
      }
  
    
  };

  return (
    <div className="flex-1 mt-2">
      <div className="text-gray-500 text-sm flex items-center space-x-2 mb-4">
        <Image src="/icons/icon-title.png" alt="System" width={52} height={52} />
        <span className="text-gray-900 text-4xl font-semibold">Menus</span>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Sidebar Tree View */}
        <div className="w-[349px] mt-4">
          <TreeView onSelect={(id) => dispatch(getMenusById(id))}  onAddSubmenu={(id)=>{
            setId("");
            setName("");
            setParentId(id);
          }}/>
        </div>

        {/* Menu Details */}
        <div className="w-full md:w-full p-4">
          <div className="mt-4 space-y-4 max-w-md mx-auto">
            <label className="block text-gray-600 text-sm">Menu ID</label>
            <input
              type="text"
              value={id}
              className="w-full p-3 border rounded-lg bg-[#F9FAFB] text-gray-500"
              disabled
            />

            <label className="block text-gray-600 text-sm">Depth</label>
            <input
              type="text"
              value={depth}
              className="w-1/2 p-3 border rounded-lg bg-[#EAECF0] text-gray-500"
              disabled
            />

            <label className="block text-gray-600 text-sm">Parent Data</label>
            <select
              className="w-1/2 p-3 border rounded-lg text-gray-600"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">None</option>
              {menus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.name}
                </option>
              ))}
            </select>

            <label className="block text-gray-600 text-sm">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-1/2 p-3 border rounded-lg bg-white text-gray-600"
            />

            {message && <p className="text-sm text-center text-red-500 mt-2">{message}</p>}

            <br />
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-1/2 d-block bg-blue-600 text-white py-3 rounded-3xl font-semibold"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuDetails;
