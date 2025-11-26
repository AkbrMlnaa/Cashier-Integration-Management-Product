import { useState } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";

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

  const getStatusColor = (status) => {
    switch (status) {
      case "tinggi":
        return "bg-emerald-100 text-emerald-800";
      case "sedang":
        return "bg-amber-100 text-amber-800";
      case "rendah":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        return "Tidak Diketahui";
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

  
  const handleSubmit = (e) => {
    e.preventDefault();

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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari bahan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg"
          />
        </div>

        <button
          onClick={() => openModal()}
          className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg flex gap-2"
        >
          <Plus size={20} />
          Tambah Bahan
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="bg-gradient-to-r from-red-50 to-rose-50 px-6 py-4 border-b">
          <h2 className="text-lg font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            Daftar Bahan Baku
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-sm font-semibold">Bahan</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Jumlah</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Satuan</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredIngredients.map((item) => (
                <tr key={item.id} className="hover:bg-rose-50">
                  <td className="px-6 py-3">{item.name}</td>
                  <td className="px-6 py-3 font-semibold">{item.stock?.quantity ?? 0}</td>
                  <td className="px-6 py-3">{item.unit}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                      {getStatusBadgeText(item.status)}
                    </span>
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <button
                      onClick={() => openModal(item)}
                      className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteIngredient(item.id)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4">
            <h2 className="text-xl font-bold">
              {editingId ? "Edit Bahan" : "Tambah Bahan"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama */}
              <div>
                <label className="block text-sm mb-1 font-semibold">Nama Bahan</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Satuan */}
              <div>
                <label className="block text-sm mb-1 font-semibold">Satuan</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
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

              {/* Stok (hanya saat edit) */}
              {editingId && (
                <div>
                  <label className="block text-sm mb-1 font-semibold">Stok</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 rounded-lg flex-1"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg flex-1"
                >
                  {editingId ? "Update" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
