import { useState } from 'react'
import { ShoppingCart, Plus, Edit2, Trash2, Search } from 'lucide-react'

const dummyMenuItems = [
  { id: 1, name: "Nasi Goreng Spesial", price: 20000, image: "/assets/nasi-goreng.jpg", description: "Nasi goreng dengan telur, ayam, dan sayuran segar." },
  { id: 2, name: "Mie Ayam", price: 15000, image: "/assets/mie-ayam.jpg", description: "Mie ayam dengan pangsit dan kuah kaldu khas." },
  { id: 3, name: "Es Teh Manis", price: 5000, image: "/placeholder.svg", description: "Minuman segar dengan teh pilihan dan gula alami." },
  { id: 4, name: "Ayam Goreng Crispy", price: 25000, image: "/placeholder.svg", description: "Ayam goreng renyah dengan bumbu rahasia." }
]

export default function MenuContent({ 
  cart = [], 
  addToCart = () => {}, 
  menuItems = dummyMenuItems,
  onAddMenu = () => {},
  onUpdateMenu = () => {},
  onDeleteMenu = () => {}
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: "", price: "", image: "", description: "" })

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id)
      setFormData({ ...item, price: item.price })
    } else {
      setEditingId(null)
      setFormData({ name: "", price: "", image: "", description: "" })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { ...formData, price: Number(formData.price) }
    if (editingId) {
      onUpdateMenu(editingId, payload)
    } else {
      onAddMenu(payload)
    }
    closeModal()
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search + Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
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
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center sm:justify-start gap-2 whitespace-nowrap"
        >
          <Plus size={20} />
          Tambah Menu
        </button>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100">
            <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-gray-200 cursor-pointer" onClick={() => addToCart(item)}>
              <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="p-3 sm:p-4">
              <div className="flex items-start justify-between mb-2 gap-2">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 line-clamp-2">{item.name}</h3>
                <span className="bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                  Rp {item.price.toLocaleString("id-ID")}
                </span>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{item.description}</p>

              <div className="flex flex-col sm:flex-row gap-2">
                <button onClick={() => addToCart(item)} className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 text-sm sm:text-base">
                  <ShoppingCart size={18} /> Tambah
                </button>
                <div className="flex gap-2">
                  <button onClick={() => openModal(item)} className="px-2 sm:px-3 py-2 sm:py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => onDeleteMenu(item.id)} className="px-2 sm:px-3 py-2 sm:py-2.5 bg-red-200 text-red-700 rounded-lg hover:bg-red-300">
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
            <h2 className="text-lg sm:text-xl font-bold mb-4">{editingId ? "Edit Menu" : "Tambah Menu"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Menu</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Harga</label>
                <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="0" required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">URL Gambar</label>
                <input type="text" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="/image.jpg" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Deskripsi</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" rows="3" />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">{editingId ? "Update" : "Tambah"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
