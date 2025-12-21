"use client";

import { useState } from "react";
import { 
  Calendar, 
  ChevronDown, 
  DollarSign, 
  Search, 
  TrendingUp, 
  Clock, 
  ShoppingBag, 
  Receipt 
} from "lucide-react";
import StrukTransaksi from "@/components/ui/struk";

export default function RiwayatTransaksiContent({ transactions }) {
  const [expandedId, setExpandedId] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions =
    startDate || endDate || searchTerm
      ? (transactions || []).filter((transaction) => {
          const transactionDate = new Date(transaction.created_at);
          const start = startDate
            ? new Date(startDate)
            : new Date("2000-01-01");
          const end = endDate ? new Date(endDate) : new Date("2099-12-31");
          const dateMatch = transactionDate >= start && transactionDate <= end;

          const searchMatch =
            searchTerm === "" ||
            transaction.details.some((d) =>
              d.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            ) ||
            transaction.total.toString().includes(searchTerm);

          return dateMatch && searchMatch;
        })
      : transactions || [];

  // Sorting
  const sortedTransactions = filteredTransactions.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  // Hitung total pendapatan
  const totalFiltered = sortedTransactions.reduce((sum, t) => {
    const transactionTotal = t.details.reduce(
      (s, d) => s + d.price * d.quantity,
      0
    );
    return sum + transactionTotal;
  }, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER STATS */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            Riwayat Transaksi
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            Pantau performa transaksi bisnis
          </p>
        </div>
      </div>

      {/* CARDS STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Transaksi */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-red-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-red-600 text-xs sm:text-sm font-semibold mb-1">
                Total Transaksi
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-red-900">
                {sortedTransactions.length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-600 to-rose-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <TrendingUp size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Total Pendapatan */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-emerald-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-emerald-600 text-xs sm:text-sm font-semibold mb-1">
                Total Pendapatan
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-900 break-words">
                Rp {totalFiltered.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <DollarSign size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Rata-rata */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-amber-200 shadow-sm hover:shadow-md transition sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-amber-600 text-xs sm:text-sm font-semibold mb-1">
                Rata-rata Transaksi
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-amber-900 break-words">
                Rp{" "}
                {sortedTransactions.length > 0
                  ? Math.round(
                      totalFiltered / sortedTransactions.length
                    ).toLocaleString("id-ID")
                  : 0}
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-600 to-orange-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Calendar size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS SECTION */}
      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar size={20} className="text-red-600" />
          Filter Transaksi
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Search */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Cari Item / Nominal
          </label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 sm:left-4 top-2.5 sm:top-3 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari nama item atau nominal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {(startDate || endDate || searchTerm) && (
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setSearchTerm("");
            }}
            className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-300 transition"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* TRANSACTION LIST (UPDATED DESIGN) */}
      <div className="space-y-4">
        {sortedTransactions.length > 0 ? (
          sortedTransactions.map((transaction) => {
            // Hitung total per transaksi
            const transactionTotal = transaction.details.reduce(
              (sum, d) => sum + d.price * d.quantity,
              0
            );
            
            // Cek apakah card sedang dibuka
            const isExpanded = expandedId === transaction.id;

            return (
              <div
                key={transaction.id}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isExpanded
                    ? "border-red-200 shadow-lg ring-1 ring-red-100" 
                    : "border-gray-100 shadow-sm hover:shadow-md hover:border-red-200" 
                }`}
              >
                {/* Header Card (Clickable) */}
                <div
                  onClick={() =>
                    setExpandedId(isExpanded ? null : transaction.id)
                  }
                  className="p-5 cursor-pointer flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-white group"
                >
                  {/* Kiri: Info ID & Waktu */}
                  <div className="flex items-start gap-4">
                    {/* Ikon Struk Bulat */}
                    <div className={`p-3 rounded-full transition-colors ${isExpanded ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400 group-hover:text-red-500 group-hover:bg-red-50"}`}>
                      <Receipt size={24} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 text-base">
                          Order
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-mono tracking-wide border border-gray-200">
                          #{transaction.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(transaction.created_at).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(transaction.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kanan: Harga & Indikator */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pl-14 sm:pl-0">
                    <div className="text-right">
                      <p className="font-bold text-lg sm:text-xl text-gray-900">
                        Rp {transactionTotal.toLocaleString("id-ID")}
                      </p>
                      <div className="flex items-center justify-end gap-1 text-xs font-medium text-gray-500 mt-0.5">
                        <ShoppingBag size={12} />
                        <span>{transaction.details.length} Varian Item</span>
                      </div>
                    </div>

                    {/* Chevron dengan Animasi Rotasi */}
                    <div className={`transition-transform duration-300 text-gray-400 ${isExpanded ? "rotate-180 text-red-500" : ""}`}>
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                {/* Expanded Content (Struk) */}
                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                      <div className="max-w-md mx-auto">
                          {/* Komponen Struk */}
                          <StrukTransaksi transaction={transaction} />
                      </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* Empty State Baru */
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-dashed border-gray-300 text-center">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <Receipt size={40} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Belum Ada Transaksi</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
              Transaksi yang sesuai dengan filter Anda tidak ditemukan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}