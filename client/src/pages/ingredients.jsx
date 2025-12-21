import { useState } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { confirmAlert, errorAlert } from "@/services/alert";

export default function IngredientsContent({
  ingredients = [],
  onAddIngredient = () => {},
  onUpdateIngredient = () => {},
  onUpdateIngredientStock = () => {},
  onDeleteIngredient = () => {},
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    quantity: 0,
  });

  const filteredIngredients = ingredients.filter((item) =>
    (item?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const stockThreshold = {
    kg: { low: 3, medium: 7 },
    gram: { low: 500, medium: 2500 },
    ml: { low: 500, medium: 2000 },
    liter: { low: 2, medium: 10 },
    pcs: { low: 10, medium: 50 },
    pack: { low: 5, medium: 20 },
    box: { low: 3, medium: 7 },
  };
  const getStockStatus = (quantity, unit) => {
    if (!unit) return "unknown";

    const threshold = stockThreshold[unit.toLowerCase()];

    if (!threshold) return "unknown";

    if (quantity === 0) return "kosong";
    if (quantity <= threshold.low) return "rendah";
    if (quantity <= threshold.medium) return "sedang";
    return "tinggi";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "tinggi":
        return "bg-emerald-100 text-emerald-800";
      case "sedang":
        return "bg-amber-100 text-amber-800";
      case "rendah":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getStatusBadgeText = (status) => {
    switch (status) {
      case "tinggi":
        return "Stok Tinggi";
      case "sedang":
        return "Stok Sedang";
      case "rendah":
        return "Stok Rendah";
      default:
        return "Stok Kosong";
    }
  };

  // 🟦 OPEN MODAL
  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name || "",
        unit: item.unit || "",
        quantity: Number(item.stock?.quantity ?? 0),
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        unit: "",
        quantity: 0,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.unit) {
      errorAlert("Gagal", "Nama dan satuan wajib diisi");
      return;
    }

    if (editingId) {
      onUpdateIngredient(editingId, {
        name: formData.name,
        unit: formData.unit,
      });

      onUpdateIngredientStock(editingId, formData.quantity);
    } else {
      onAddIngredient({
        name: formData.name,
        unit: formData.unit,
      });
    }

    closeModal();
  };

  const handleDelete = async (id) => {
    const result = await confirmAlert(
      "Hapus Ingredient?",
      "Data yang dihapus tidak bisa dikembalikan"
    );

    if (result.isConfirmed) {
      onDeleteIngredient(id);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            Kelola Bahan-bahan
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            Atur Bahan-bahan yang akan digunakan
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari Ingredient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg"
          />
        </div>

        <button
          onClick={() => openModal()}
          className="px-4 py-2.5 
bg-gradient-to-r from-red-600 to-rose-600 
hover:from-red-700 hover:to-rose-700
text-white rounded-lg font-semibold 
flex items-center justify-center sm:justify-start
gap-2 whitespace-nowrap"
        >
          <Plus size={20} />
          Tambah Ingredient
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="bg-gradient-to-r from-red-50 to-rose-50 px-6 py-4 border-b">
          <h2 className="text-lg font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            Daftar Ingredient
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Ingredient
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Satuan
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredIngredients.map((item) => (
                <tr key={item.id} className="hover:bg-rose-50">
                  <td className="px-6 py-3">{item.name}</td>
                  <td className="px-6 py-3 font-semibold">
                    {item.stock?.quantity ?? 0}
                  </td>
                  <td className="px-6 py-3">{item.unit}</td>
                  <td className="px-6 py-3">
                    {(() => {
                      const quantity = item.stock?.quantity ?? 0;
                      const unit = item.unit;

                      const computedStatus = getStockStatus(quantity, unit);

                      return (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            computedStatus
                          )}`}
                        >
                          {getStatusBadgeText(computedStatus)}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <button
                      onClick={() => openModal(item)}
                      className="px-3 py-1.5 bg-yellow-200 text-amber-700 rounded hover:bg-amber-300 transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1.5 bg-red-200 text-red-700 rounded hover:bg-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "Edit Ingredient" : "Tambah Ingredient"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 18 18" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nama Ingredient */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nama Ingredient
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm"
                    placeholder="Contoh: Tepung Terigu"
                    required
                  />
                </div>

                {/* Satuan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Satuan Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm appearance-none"
                  >
                    <option value="">Pilih satuan...</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="gram">Gram (g)</option>
                    <option value="ml">Mililiter (ml)</option>
                    <option value="liter">Liter (L)</option>
                    <option value="pcs">Pcs</option>
                    <option value="pack">Pack</option>
                    <option value="box">Box</option>
                  </select>
                </div>

                {/* Stok (Hanya Muncul Saat Edit) - Tema Rose/Merah */}
                {editingId && (
                  <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                    <label className="block text-xs font-bold text-rose-800 uppercase tracking-wider mb-1.5">
                      Update Stok
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quantity: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2.5 bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-rose-900 font-bold text-sm"
                      />
                      <span className="absolute right-4 top-2.5 text-xs font-medium text-rose-500">
                        {formData.unit}
                      </span>
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-sm font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    // Menggunakan Gradient Red-Rose
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:opacity-90 text-sm font-bold shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                  >
                    {editingId ? "Simpan Perubahan" : "Tambah Ingredient"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
