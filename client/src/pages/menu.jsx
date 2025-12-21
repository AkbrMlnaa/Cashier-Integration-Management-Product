import { useEffect, useState } from "react";
import { ShoppingCart, Plus, Edit2, Trash2, Search } from "lucide-react";
import { getAllIngredients } from "@/services/ingredients";
import { updateProduct, upsertProductIngredients } from "@/services/product";
import { errorAlert } from "@/services/alert";

export default function Menu({
  // eslint-disable-next-line no-unused-vars
  cart = [],
  addToCart = () => {},
  menuItems = [],
  onAddMenu = () => {},
  onUpdateMenu = () => {},
  onDeleteMenu = () => {},
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    image: null,
    ingredients: [
      {
        ingredient_id: "",
        quantity: "",
      },
    ],
  });
  const [ingredientslist, setIngredientsList] = useState([]);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const data = await getAllIngredients();
        setIngredientsList(data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchIngredients();
  }, []);

  const categories = ["Minuman", "Makanan"];

  const filteredItems = menuItems.filter((item) => {
    const name = item?.name?.toLowerCase() || "";
    const category = item?.category?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    return name.includes(query) || category.includes(query);
  });

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        category: item.category,
        price: item.price,
        image: null,
        ingredients: item.ingredients
          ?.filter((i) => i?.ingredient_id || i?.ingredient?.id)
          .map((i) => ({
            ingredient_id: i.ingredient_id ?? i.ingredient?.id ?? "",
            quantity: i.quantity ?? "",
          })) || [{ ingredient_id: "", quantity: "" }],
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        category: "",
        price: "",
        image: null,
        ingredients: [{ ingredient_id: "", quantity: "" }],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: "",
      category: "",
      price: "",
      image: null,
      ingredients: [{ ingredient_id: "", quantity: "" }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ingredientsPayload = formData.ingredients
      .filter((i) => i.ingredient_id && i.quantity)
      .map((i) => ({
        ingredient_id: Number(i.ingredient_id),
        quantity: Number(i.quantity),
      }));

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        stock: 0,
        image: formData.image,
      };

      if (ingredientsPayload.length === 0) {
        errorAlert(
          "Gagal",
          "Resep wajib diisi. Mohon tambahkan minimal satu bahan baku."
        );
        return;
      }

      if (editingId) {
        const updatedProductResponse = await updateProduct(editingId, payload);

        const updatedProductData =
          updatedProductResponse.data || updatedProductResponse;

        await upsertProductIngredients(editingId, ingredientsPayload);

        onUpdateMenu(editingId, {
          ...updatedProductData,
          ingredients: updatedProductData.ingredients, // ambil dari backend
        });
      } else {
        onAddMenu({ product: payload, ingredients: ingredientsPayload });
      }

      closeModal();
    } catch (err) {
      console.error(err);
      errorAlert(
        "Gagal",
        editingId ? "Product gagal diupdate" : "Product gagal ditambahkan"
      );
    }
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        { ingredient_id: "", quantity: "" },
      ],
    });
  };

  const removeIngredient = (index) => {
    const updated = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: updated });
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...formData.ingredients];
    updated[index][field] = value;

    setFormData({
      ...formData,
      ingredients: updated,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search + Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          Tambah Menu
        </button>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => addToCart(item)}
          >
            {/* Image */}
            <div className="relative w-full h-32 sm:h-36 overflow-hidden">
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {/* Price Badge */}
              <div className="absolute top-2 right-2 bg-rose-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm">
                Rp {(Number(item.price) || 0).toLocaleString("id-ID")}
              </div>
            </div>

            {/* Content */}
            <div className="p-2 sm:p-3 flex flex-col gap-1">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2">
                {item.name}
              </h3>
              <span className="text-gray-500 text-xs sm:text-sm">
                {item.category}
              </span>

              {/* Edit & Delete buttons */}
              <div className="flex gap-1 mt-1 justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(item);
                  }}
                  className="p-1 bg-yellow-200 text-amber-700 rounded-full hover:bg-yellow-300 transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteMenu(item.id);
                  }}
                  className="p-1 bg-red-200 text-red-700 rounded-full hover:bg-red-300 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "Edit Menu" : "Tambah Menu Baru"}
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

            <div className="overflow-y-auto p-6 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Informasi Produk
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nama Menu
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm"
                      placeholder="Contoh: Nasi Goreng Spesial"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Harga (Rp)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400 text-sm">
                          Rp
                        </span>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm"
                          placeholder="0"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Kategori
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm appearance-none"
                        required
                      >
                        <option value="">Pilih Kategori</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Gambar Produk
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.files[0] })
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-600 hover:file:bg-rose-100 transition-all text-gray-500"
                    />
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Resep & Bahan Baku
                    </h3>
                    <span className="text-xs text-gray-400">
                      {formData.ingredients.length} Item
                    </span>
                  </div>

                  <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    {formData.ingredients.length === 0 && (
                      <p className="text-center text-sm text-gray-400 py-2 italic">
                        Belum ada bahan baku.
                      </p>
                    )}

                    {formData.ingredients.map((item, index) => (
                      <div key={index} className="flex gap-3 items-start group">
                        <div className="flex-1">
                          <select
                            value={item.ingredient_id}
                            onChange={(e) =>
                              handleIngredientChange(
                                index,
                                "ingredient_id",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                          >
                            <option value="">Pilih Bahan...</option>
                            {ingredientslist.map((ing) => (
                              <option key={ing.id} value={ing.id}>
                                {ing.name} (Stok: {ing.stock?.quantity || 0}{" "}
                                {ing.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-24 relative">
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) =>
                              handleIngredientChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-center"
                          />
                        </div>

                        {formData.ingredients.length > 0 && (
                          <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Bahan"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              <line x1="10" x2="10" y1="11" y2="17" />
                              <line x1="14" x2="14" y1="11" y2="17" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addIngredient}
                      className="w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg text-sm font-medium hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                      Tambah Bahan Baku
                    </button>
                  </div>
                </div>

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
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:opacity-90 text-sm font-bold shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                  >
                    {editingId ? "Simpan Perubahan" : "Simpan Menu"}
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
