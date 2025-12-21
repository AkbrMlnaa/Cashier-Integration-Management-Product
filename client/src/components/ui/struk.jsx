import { CreditCard } from 'lucide-react'; 

export default function StrukTransaksi({ transaction }) {
  const total = transaction.details.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 space-y-4">
      {/* Header Struk */}
      <div className="flex justify-between border-b pb-2">
        <p className="font-bold text-gray-900">Detail Transaksi</p>
        <p className="text-gray-600 text-sm">
          {new Date(transaction.created_at).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Item List */}
      <div className="space-y-2">
        {transaction.details.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center text-sm sm:text-base"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.product?.name}</p>
              <p className="text-gray-500 text-xs sm:text-sm">
                {item.quantity} × Rp {item.price.toLocaleString("id-ID")}
              </p>
            </div>
            <p className="font-semibold text-gray-600">
              Rp {(item.price * item.quantity).toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>

      {/* Footer: Metode Pembayaran & Total */}
      <div className="border-t pt-3 space-y-2">
        
        {/* Tambahan: Metode Pembayaran */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            {/* Ikon opsional, jika tidak pakai lucide-react bisa dihapus */}
            <CreditCard size={16} /> 
            <span>Metode Pembayaran</span>
          </div>
          <span className="font-medium text-gray-900 uppercase tracking-wide">
            {/* Pastikan backend mengirim field ini, atau ganti string default */}
            {transaction.payment_method || "Tunai"} 
          </span>
        </div>

        {/* Total (Bagian Lama) */}
        <div className="flex justify-between items-center pt-1">
          <p className="font-bold text-gray-900 text-lg">Total</p>
          <p className="font-bold text-red-600 text-xl">
            Rp {total.toLocaleString("id-ID")}
          </p>
        </div>
      </div>
    </div>
  );
}