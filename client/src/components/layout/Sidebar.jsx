import { confirmAlertLogout, errorAlert, successAlert } from "@/services/alert";
import { api } from "@/services/api";
import {
  X,
  Utensils,
  Package,
  History,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Sidebar({
  onSelect,
  collapsed,
  setCollapsed,
  open,
  setOpen,
  setAuth,
  auth, // <-- kita ambil role disini
}) {
  const navigate = useNavigate();
  const role = auth?.profile?.role;

  const menuItems = [
    { name: "Menu", key: "menu", icon: <Utensils size={20} /> },
    { name: "Ingredients", key: "ingredients", icon: <Package size={20} /> },

    // HANYA MANAGER
    ...(role === "manager"
      ? [
          {
            name: "Riwayat Transaksi",
            key: "riwayat",
            icon: <History size={20} />,
          },
          {
            name: "Penjualan",
            key: "penjualan",
            icon: <TrendingUp size={20} />,
          },
        ]
      : []),
  ];

  const handleLogout = async () => {
    try {
      const { isConfirmed } = await confirmAlertLogout(
        "Logout?",
        "Anda yakin ingin keluar dari aplikasi?"
      );
      if (!isConfirmed) return;

      await api.post("/auth/logout");
      setAuth({ authenticated: false, profile: null });

      await successAlert("Logout", "Berhasil");
      navigate("/login");
    } catch (error) {
      console.error(error);
      errorAlert("Gagal logout", "Terjadi kesalahan pada server");
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static top-0 bottom-0 md:top-5 md:bottom-5 left-0 bg-white border-r shadow-xl p-4 z-50 
  transition-all duration-300 ease-in-out flex flex-col  
  ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
  ${collapsed ? "md:w-[80px]" : "md:w-[260px]"} w-72 overflow-hidden
  rounded-r-xl md:rounded-xl`}
      >
        {/* Close Button — MOBILE */}
        <div className="flex md:hidden justify-end mb-4">
          <button onClick={() => setOpen(false)}>
            <X size={28} />
          </button>
        </div>

        {/* Collapse Button — DESKTOP */}
        <div className="hidden md:flex justify-end mb-6">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-200 transition"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">BS</span>
          </div>

          {!collapsed && (
            <h2 className="hidden md:block text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              Bintang Sanga'
            </h2>
          )}

          <h2 className="md:hidden text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            Bintang Sanga'
          </h2>
        </div>

        {/* MENU LIST */}
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                onSelect(item.key);
                setOpen(false);
              }}
              className={`flex items-center gap-3 w-full p-3 rounded-xl hover:bg-rose-100 hover:text-red-600 transition
                ${collapsed ? "justify-center" : "justify-start"}`}
            >
              <span className="text-red-600">{item.icon}</span>

              {!collapsed && (
                <span className="hidden md:block font-medium text-gray-700">
                  {item.name}
                </span>
              )}

              <span className="font-medium text-gray-700 md:hidden">
                {item.name}
              </span>
            </button>
          ))}
        </nav>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-100 hover:text-red-600 transition text-red-600 font-medium border-t pt-4 mt-4
            ${collapsed ? "justify-center" : "justify-start"}`}
        >
          <LogOut size={20} />
          {!collapsed && <span className="hidden md:block">Logout</span>}
          <span className="font-medium md:hidden">Logout</span>
        </button>
      </aside>
    </>
  );
}
