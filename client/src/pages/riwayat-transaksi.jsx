"use client";

import { useState } from "react";
import { Calendar, Search } from "lucide-react";

export default function RiwayatTransaksiContent({ transactions }) {
  const [expandedId, setExpandedId] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  function formatDate(datetime) {
    return new Date(datetime).toISOString().split("T")[0];
  }

  function formatTime(datetime) {
    const d = new Date(datetime);
    return d.toTimeString().slice(0, 5);
  }

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

  // Sorting fix
  const sortedTransactions = filteredTransactions.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  // Hitung total pendapatan dari semua transaksi
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
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-red-200">
          <p className="text-red-600 text-xs sm:text-sm font-semibold mb-1">
            Total Transaksi
          </p>
          <p className="text-xl sm:text-2xl font-bold text-red-900">
            {sortedTransactions.length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-200">
          <p className="text-emerald-600 text-xs sm:text-sm font-semibold mb-1">
            Total Pendapatan
          </p>
          <p className="text-lg sm:text-xl font-bold text-emerald-900 break-words">
            Rp {totalFiltered.toLocaleString("id-ID")}
          </p>
        </div>

        {sortedTransactions.length > 0 && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-amber-200 col-span-2 sm:col-span-1">
            <p className="text-amber-600 text-xs sm:text-sm font-semibold mb-1">
              Rata-rata
            </p>
            <p className="text-lg sm:text-xl font-bold text-amber-900 break-words">
              Rp{" "}
              {Math.round(
                totalFiltered / sortedTransactions.length
              ).toLocaleString("id-ID")}
            </p>
          </div>
        )}
      </div>

      {/* FILTERS */}
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

      {/* TRANSACTION LIST */}
      <div className="space-y-2 sm:space-y-4">
        {sortedTransactions.length > 0 ? (
          sortedTransactions.map((transaction) => {
            // Hitung total per transaksi
            const transactionTotal = transaction.details.reduce(
              (sum, d) => sum + d.price * d.quantity,
              0
            );

            return (
              <div
                key={transaction.id}
                className="bg-white rounded-lg sm:rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div
                  onClick={() =>
                    setExpandedId(
                      expandedId === transaction.id ? null : transaction.id
                    )
                  }
                  className="p-3 sm:p-6 cursor-pointer hover:bg-red-50 transition border-b"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm sm:text-base">
                        Transaksi #{transaction.id}
                      </p>

                      <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                        {formatDate(transaction.created_at)} •{" "}
                        {formatTime(transaction.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                      <div className="text-right">
                        <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                          Rp {transactionTotal.toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {transaction.details.length} item
                        </p>
                      </div>

                      <span className="text-gray-400 text-lg flex-shrink-0">
                        {expandedId === transaction.id ? "▼" : "▶"}
                      </span>
                    </div>
                  </div>
                </div>

                {expandedId === transaction.id && (
                  <div className="bg-gradient-to-b from-red-50 to-white p-3 sm:p-6 border-t">
                    <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-xs sm:text-sm flex items-center gap-2">
                      <span className="w-1 h-4 bg-gradient-to-b from-red-600 to-rose-600 rounded-full"></span>
                      Detail Item
                    </h4>

                    <div className="space-y-2 sm:space-y-3">
                      {transaction.details.map((detail, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-2 sm:p-3 bg-white rounded-lg border border-gray-100 text-xs sm:text-sm"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {detail.product?.name ?? "Unknown Product"}
                            </p>
                            <p className="text-gray-600 text-xs sm:text-sm">
                              {detail.quantity} × Rp{" "}
                              {detail.price.toLocaleString("id-ID")}
                            </p>
                          </div>

                          <p className="font-bold text-red-600">
                            Rp{" "}
                            {(detail.price * detail.quantity).toLocaleString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white p-8 sm:p-12 rounded-lg sm:rounded-xl shadow text-center border border-gray-200">
            <Calendar
              size={32}
              className="mx-auto text-gray-300 mb-3 sm:mb-4"
            />
            <p className="text-gray-500 text-sm sm:text-lg">
              Belum ada transaksi
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
