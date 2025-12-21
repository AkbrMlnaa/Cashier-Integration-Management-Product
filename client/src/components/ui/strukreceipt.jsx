import { X, Printer } from "lucide-react";
import { useRef } from "react";

const StrukReceipt = ({ data, onClose }) => {
  const printAreaRef = useRef();

  const handlePrint = () => {
    // Logic print khusus area struk
    const printContent = printAreaRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload untuk mengembalikan state React (cara paling aman untuk print parsial tanpa library tambahan)
  };

  // Format tanggal
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const currentDate = new Date().toLocaleDateString("id-ID", dateOptions);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* AREA STRUK (Scrollable preview) */}
        <div className="overflow-y-auto p-6 bg-gray-100 flex justify-center">
          {/* Kertas Struk */}
          <div
            ref={printAreaRef}
            className="bg-white p-4 shadow-sm w-[300px] text-xs font-mono text-gray-800 leading-tight"
            style={{ minHeight: "400px" }}
          >
            {/* Header Toko */}
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold uppercase mb-1">BINTANG SANGA'</h1>
              <p>Jl. Raya Telang, Kamal</p>
              <p>Bangkalan, Madura</p>
              <p className="mt-2 text-[10px]">{currentDate}</p>
            </div>

            {/* Separator */}
            <div className="border-b-2 border-dashed border-gray-400 my-2"></div>

            {/* List Item */}
            <div className="space-y-2">
              {data.details.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between font-bold">
                    <span>{item.name}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>
                      {item.quantity} x {item.price.toLocaleString("id-ID")}
                    </span>
                    <span>
                      Rp {(item.quantity * item.price).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Separator */}
            <div className="border-b-2 border-dashed border-gray-400 my-2"></div>

            {/* Totals */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL</span>
                <span>Rp {data.total.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Bayar (Cash)</span>
                <span>Rp {data.total.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center space-y-2">
              <p>*** TERIMA KASIH ***</p>
              <p className="text-[10px] mt-4">Simpan struk ini sebagai bukti pembayaran yang sah.</p>
            </div>
          </div>
        </div>

        {/* Footer Modal Action */}
        <div className="p-4 border-t flex gap-3 bg-white rounded-b-lg">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
          >
            Tutup (Tanpa Cetak)
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
          >
            <Printer size={18} />
            Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrukReceipt;