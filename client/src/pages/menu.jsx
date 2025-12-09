import { useEffect, useState } from "react";
import { ShoppingCart, Plus, Edit2, Trash2, Search } from "lucide-react";
import { getAllIngredients } from "@/services/ingredients";
import {
  addProduct,
  updateProduct,
  upsertProductIngredients,
} from "@/services/product";
import { errorAlert, successAlert } from "@/services/alert";

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

  const categories = ["Minuman", "Makanan", "Snack", "Dessert", "Topping"];

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
        ingredients: item.ingredients?.map((i) => ({
          ingredient_id: i.ingredient.id,
          quantity: i.quantity,
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

      if (editingId) {
        const updatedMenu = await updateProduct(editingId, payload);
        await upsertProductIngredients(editingId, ingredientsPayload);
        onUpdateMenu(editingId, {
          ...updatedMenu,
          ingredients: ingredientsPayload,
        });
      } else {
        const newMenu = await addProduct(payload); 
        await upsertProductIngredients(newMenu.id, ingredientsPayload);
        onAddMenu({ ...newMenu, ingredients: ingredientsPayload });
        successAlert("Berhasil", "Product berhasil ditambahkan");
      }

      closeModal();
    } catch (err) {
      console.error(err);
      errorAlert("Gagal", "Product gagal ditambahkan");
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100"
          >
            <div
              className="relative w-full h-40 sm:h-48 overflow-hidden bg-gray-200 cursor-pointer"
              onClick={() => addToCart(item)}
            >
              <img
                src={
                  item.image_url && item.image_url !== ""
                    ? item.image_url
                    : "https://via.placeholder.com/300x200?text=No+Image"
                }
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="p-3 sm:p-4">
              <div className="flex items-start justify-between mb-2 gap-2">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 line-clamp-2">
                  {item.name}
                </h3>
                <span>
                  Rp {(Number(item.price) || 0).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                <p>Kategori: {item.category}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => addToCart(item)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 
bg-gradient-to-r from-emerald-700 to-green-800 
hover:from-emerald-800 hover:to-green-900 
text-white rounded-lg font-semibold 
flex items-center justify-center gap-2 
shadow-md hover:shadow-xl active:scale-95 
text-sm sm:text-base"
                >
                  <ShoppingCart size={18} />Tambah
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(item)}
                    className="px-2 sm:px-3 py-2 sm:py-2.5 bg-yellow-200 text-amber-700 rounded-lg hover:bg-yellow-300"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDeleteMenu(item.id)}
                    className="px-2 sm:px-3 py-2 sm:py-2.5 bg-red-200 text-red-700 rounded-lg hover:bg-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-4">
              {editingId ? "Edit Menu" : "Tambah Menu"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Nama Menu
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Harga
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  required
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Gambar
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.files[0] })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  placeholder="/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Ingredients
                </label>

                {formData.ingredients.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-center">
                    <select
                      value={item.ingredient_id}
                      onChange={(e) =>
                        handleIngredientChange(
                          index,
                          "ingredient_id",
                          e.target.value
                        )
                      }
                      className="flex-1 px-2 py-2 border rounded-lg text-sm"
                    >
                      <option value="">Pilih Ingredient</option>
                      {ingredientslist.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} ({ing.stock?.quantity || 0} {ing.unit})
                        </option>
                      ))}
                    </select>

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
                      className="w-20 px-2 py-2 border rounded-lg text-sm"
                    />

                    {formData.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="px-2 py-2 bg-red-500 text-white rounded"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addIngredient}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm"
                >
                  + Tambah Ingredient
                </button>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
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
