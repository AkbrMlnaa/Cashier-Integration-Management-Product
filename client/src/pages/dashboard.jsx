import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import MenuContent from "./menu";
import SalesContent from "./penjualan";
import RiwayatTransaksiContent from "./riwayat-transaksi";
import IngredientsContent from "./ingredients";
import {
  addIngredient,
  deleteIngredient,
  getAllIngredients,
  updateIngredient,
  updateIngredientStock,
} from "@/services/ingredients";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  upsertProductIngredients,
} from "@/services/product";
import { errorAlert, successAlert, confirmAlert } from "@/services/alert";
import { addTransaction, getAllTransactions } from "@/services/transaction";
import { ArrowRight, ShoppingBag, Trash2, Menu } from "lucide-react";
import StrukReceipt from "@/components/ui/strukreceipt";

export default function Dashboard({ setAuth, auth }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("menu");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    if (activeMenu === "menu") {
      fetchProducts();
    }
  }, [activeMenu]);

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setMenuItems(data);
    } catch (error) {
      console.error("Gagal fetch product", error);
    }
  };

  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [cart, setCart] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    try {
      const data = await getAllTransactions();
      setTransactions(data || []);
    } catch (error) {
      console.error("Gagal fetch transactions", error);
    }
  };
  useEffect(() => {
    if (activeMenu === "riwayat" || activeMenu === "penjualan") {
      fetchTransactions();
      resetCart();
    }
  }, [activeMenu]);

  const addMenu = async ({ product, ingredients }) => {
    try {
      const newMenu = await addProduct(product);

      if (ingredients.length > 0) {
        await upsertProductIngredients(newMenu.id, ingredients);
      }
      setMenuItems((prev) => [
        ...prev,
        { ...newMenu, ingredients: ingredients },
      ]);

      await successAlert("Berhasil", "Product berhasil ditambahkan");
    } catch (error) {
      console.error("Gagal tambah product", error);
      errorAlert("Gagal", "Product Gagal ditambahkan");
    }
  };

  const updateMenu = async (id, updatedItem) => {
    try {
      const newProductData = updatedItem;

      setMenuItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return { ...item, ...newProductData, id: id };
          }
          return item;
        })
      );

      successAlert("Berhasil", "Product berhasil diupdate");
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      errorAlert("Gagal", "Product gagal diupdate");
    }
  };

  const deleteMenu = async (id) => {
    const result = await confirmAlert(
      "Hapus Produk?",
      "Apakah Anda yakin ingin menghapus produk ini?"
    );

    if (result.isConfirmed) {
      try {
        await deleteProduct(id);
        setMenuItems((prev) => prev.filter((item) => item.id !== id));
        successAlert("Berhasil", "Produk berhasil dihapus");
      } catch (error) {
        console.error("Gagal hapus produk", error);
        errorAlert("Gagal", "Produk gagal dihapus");
      }
    }
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

  const updateCartQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const resetCart = () => {
    setCart([]);
  };

  const checkout = async () => {
    if (cart.length === 0) return;

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const payload = {
      payment_method: paymentMethod,
      total,
      details: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      })),
    };

    const receiptData = {
      total: total,
      details: cart.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    try {
      await addTransaction(payload);

      await fetchTransactions();

      setLastTransaction(receiptData);

      setCart([]);

      setShowReceipt(true);

      successAlert("Berhasil", "Transaksi berhasil dicatat");
    } catch (error) {
      console.error(error);
      errorAlert("Gagal", "Transaksi gagal");
    }
  };

  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    if (activeMenu === "ingredients") {
      fetchIngredients();
      resetCart();
    }
  }, [activeMenu]);

  const fetchIngredients = async () => {
    try {
      const data = await getAllIngredients();
      setIngredients(data);
    } catch (error) {
      console.error("Gagal fetch ingredients", error);
    }
  };

  const handleAddIngredient = async (item) => {
    try {
      const res = await addIngredient(item);
      setIngredients((prev) => [...prev, res]);
      successAlert("Berhasil", "Ingredient berhasil ditambahkan");
    } catch (error) {
      console.error("Gagal tambah ingredient", error);
      errorAlert("Gagal", "Gagal menambah ingredient");
    }
  };

  const handleUpdateIngredient = async (id, item) => {
    try {
      const res = await updateIngredient(id, item);
      setIngredients((prev) => prev.map((ing) => (ing.id === id ? res : ing)));
      successAlert("Berhasil", "Ingredient berhasil diupdate");
    } catch (error) {
      console.error("Gagal update ingredient", error);
      errorAlert("Gagal", "Gagal mengupdate ingredient");
    }
  };

  const handleDeleteIngredient = async (id) => {
    try {
      await deleteIngredient(id);
      setIngredients((prev) => prev.filter((ing) => ing.id !== id));
      successAlert("Berhasil", "Ingredient berhasil dihapus");
    } catch (error) {
      console.error("Gagal hapus ingredient", error);
      errorAlert("Gagal", "Gagal menghapus ingredient");
    }
  };

  const handleUpdateStock = async (id, quantity) => {
    try {
      const updatedStock = await updateIngredientStock(id, quantity);
      setIngredients((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, stock: updatedStock } : item
        )
      );
      successAlert("Berhasil", "Stok berhasil diperbarui");
    } catch (error) {
      console.error("Gagal update stock", error);
      errorAlert("Gagal", "Gagal memperbarui stok");
    }
  };

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
        return (
          <IngredientsContent
            ingredients={ingredients}
            onAddIngredient={handleAddIngredient}
            onUpdateIngredient={handleUpdateIngredient}
            onUpdateIngredientStock={handleUpdateStock}
            onDeleteIngredient={handleDeleteIngredient}
          />
        );
      case "penjualan":
        return <SalesContent transactions={transactions} />;
      case "riwayat":
        return <RiwayatTransaksiContent transactions={transactions} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onSelect={setActiveMenu}
        open={mobileMenuOpen}
        setOpen={setMobileMenuOpen}
        setAuth={setAuth}
        auth={auth}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50/50">
        <div className="md:hidden px-4 py-3 bg-white shadow-sm flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
            >
              <Menu size={24} />
            </button>

            <span className="font-bold text-lg bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              Bintang Sanga'
            </span>
          </div>

          {/* Placeholder penyeimbang layout kanan */}
          <div className="w-8 h-8" />
        </div>

        {/* Konten Utama */}
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pb-32 md:pb-8">
          {renderContent()}
        </div>
      </main>

      {showReceipt && lastTransaction && (
        <StrukReceipt
          data={lastTransaction}
          onClose={() => setShowReceipt(false)}
        />
      )}

      {/* Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 right-0 left-0 md:static bg-white p-4 md:min-w-80 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none border-t z-40">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-2">
              <div className="flex items-center gap-3">
                {/* Icon dengan background halus */}

                <div className="p-2 bg-red-50 text-red-600 rounded-lg shadow-sm">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 leading-tight">
                    Ringkasan Pesanan
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Periksa kembali item anda
                  </p>
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white rounded-xl shadow-md p-3 hover:shadow-xl transition-shadow"
                >
                  {/* Gambar */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 px-3">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <span className="text-sm text-gray-500">
                      Rp {item.price.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {/* Quantity Control */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateCartQuantity(item.id, item.quantity - 1)
                      }
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateCartQuantity(item.id, item.quantity + 1)
                      }
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal & Hapus */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold text-gray-900">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 bg-red-200 text-red-700 rounded-full hover:bg-red-300 transition-colors flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* PILIHAN METODE PEMBAYARAN */}
            <div className="mt-4 px-1">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                Metode Pembayaran
              </p>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    paymentMethod === "cash"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Tunai (Cash)
                </button>
                <button
                  onClick={() => setPaymentMethod("qris")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    paymentMethod === "qris"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  QRIS
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center bg-white rounded-xl p-6 shadow-xl border border-gray-100">
              {/* Bagian Harga */}
              <div className="flex flex-col mb-4 md:mb-0 text-center md:text-left">
                <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">
                  Total
                </span>
                {/* Font weight dikurangi dari extrabold ke bold */}
                <span className="font-bold text-3xl text-gray-900 mt-1">
                  <span className="text-lg font-medium text-gray-500 align-top mr-1">
                    Rp
                  </span>
                  {cart
                    .reduce((sum, item) => sum + item.price * item.quantity, 0)
                    .toLocaleString("id-ID")}
                </span>
              </div>

              {/* Bagian Tombol */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Tombol Reset */}
                <button
                  onClick={resetCart}
                  /* Font diubah menjadi font-medium agar tidak terlalu tebal */
                  className="group flex items-center justify-center gap-2 px-5 py-3.5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 active:scale-95 transition-all duration-200 font-medium"
                  title="Reset Keranjang"
                >
                  <Trash2
                    size={20}
                    className="group-hover:rotate-12 transition-transform"
                  />
                  <span className="hidden md:inline">Reset</span>
                </button>

                {/* Tombol Aksi Utama */}
                <button
                  onClick={checkout}
                  /* Font diubah menjadi font-medium */
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-200 font-medium"
                >
                  Bayar
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
