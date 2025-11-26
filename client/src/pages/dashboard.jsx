// Dashboard.jsx
import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import MenuContent from "./menu";
import SalesContent from "./penjualan";
import RiwayatTransaksiContent from "./riwayat-transaksi";
import IngredientsContent from "./ingredients";
import { addIngredient, deleteIngredient, getAllIngredients, updateIngredient, updateIngredientStock } from "@/services/ingredients";

export default function Dashboard({ setAuth }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("menu");

  // State utama
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: "Nasi Goreng",
      price: 20000,
      image: "/assets/nasi-goreng.jpg",
      description: "Nasi goreng dengan telur, ayam, dan sayuran segar.",
    },
    {
      id: 2,
      name: "Mie Ayam",
      price: 15000,
      image: "/assets/mie-ayam.jpg",
      description: "Mie ayam dengan pangsit dan kuah kaldu khas.",
    },
    {
      id: 3,
      name: "Es Teh Manis",
      price: 5000,
      image: "/placeholder.svg",
      description: "Minuman segar dengan teh pilihan dan gula alami.",
    },
    {
      id: 4,
      name: "Ayam Goreng Crispy",
      price: 25000,
      image: "/placeholder.svg",
      description: "Ayam goreng renyah dengan bumbu rahasia.",
    },
  ]);
  const [cart, setCart] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // CRUD Menu
  const addMenu = (item) => {
    const newItem = { ...item, id: Date.now() };
    setMenuItems((prev) => [...prev, newItem]);
  };

  const updateMenu = (id, updatedItem) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedItem } : item))
    );
  };

  const deleteMenu = (id) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Cart
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.id === item.id);
      if (existing)
        return prev.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // Dashboard.jsx (tambahan di bagian cart)
  const updateCartQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      // Jika quantity 0 atau negatif, hapus item
      setCart((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // Hapus satu item dari cart
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Reset seluruh cart
  const resetCart = () => {
    setCart([]);
  };

  const checkout = () => {
    if (cart.length === 0) return;
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const transaction = {
      id: Date.now(),
      date: new Date().toLocaleString("id-ID"),
      items: cart,
      total,
    };
    setTransactions((prev) => [transaction, ...prev]);
    setCart([]);
  };

  const [ingredients,setIngredients] = useState([])

  useEffect(() =>{
    if (activeMenu === "ingredients") {
      fetchIngredients()
    }
  },[activeMenu])

  const fetchIngredients = async () => {
    try {
      const data = await getAllIngredients()
    setIngredients(data)
    } catch (error) {
      console.error("Gagal fetch ingredients", error)
    }
  }

   const handleAddIngredient = async (item) => {
  try {
    const res = await addIngredient(item);
    setIngredients(prev => [...prev, res]); 
  } catch (error) {
    console.error("Gagal tambah ingredient", error);
  }
};


  const handleUpdateIngredient = async (id, item) => {
  try {
    const res = await updateIngredient(id, item);
    setIngredients(prev =>
      prev.map(ing => ing.id === id ? res : ing)
    );
  } catch (error) {
    console.error("Gagal update ingredient", error);
  }
};


  const handleDeleteIngredient = async (id) => {
    try {
      await deleteIngredient(id);
      setIngredients(prev => prev.filter(ing => ing.id !== id));
    } catch (error) {
      console.error("Gagal hapus ingredient", error);
    }
  };

 const handleUpdateStock = async (id, quantity) => {
  try {
    const updatedStock = await updateIngredientStock(id, quantity);

    setIngredients(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, stock: updatedStock }
          : item
      )
    );
  } catch (error) {
    console.error("Gagal update stock", error);
  }
};



  

  // Render konten
  const renderContent = () => {
    switch (activeMenu) {
      case "menu":
        return (
          <MenuContent
            menuItems={menuItems}
            addToCart={addToCart}
            onAddMenu={addMenu}
            onUpdateMenu={updateMenu}
            onDeleteMenu={deleteMenu}
          />
        );
      case "ingredients":
        return <IngredientsContent 
        ingredients={ingredients}
        onAddIngredient={handleAddIngredient}
        onUpdateIngredient={handleUpdateIngredient}
        onUpdateIngredientStock={handleUpdateStock}
        onDeleteIngredient={handleDeleteIngredient}
        />;
      case "penjualan":
        return <SalesContent transactions={transactions} />;
      case "riwayat":
        return <RiwayatTransaksiContent transactions={transactions} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onSelect={setActiveMenu}
        open={false}
        setOpen={() => {}}
        setAuth={setAuth}
      />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 lg:p-8">{renderContent()}</div>
      </main>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 right-0 left-0 md:static border-t bg-card p-4 md:min-w-80">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Cart ({cart.length})</h3>

            {/* Tabel Cart */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Menu</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Subtotal</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2 text-center flex items-center justify-center gap-1">
                        <button
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity - 1)
                          }
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity + 1)
                          }
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          +
                        </button>
                      </td>
                      <td className="p-2 text-right">
                        Rp{" "}
                        {(item.price * item.quantity).toLocaleString("id-ID")}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="px-2 py-1 bg-red-200 text-red-700 rounded hover:bg-red-300"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total & Aksi */}
            <div className="flex justify-between items-center mt-2">
              <span className="font-bold text-lg">
                Total: Rp{" "}
                {cart
                  .reduce((sum, item) => sum + item.price * item.quantity, 0)
                  .toLocaleString("id-ID")}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={resetCart}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Reset Cart
                </button>
                <button
                  onClick={checkout}
                  className="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded hover:opacity-90"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
