'use client';

import { useState } from 'react';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';

export default function SalesContent({ transactions = [], menuItems = [] }) {
  const [filterPeriode, setFilterPeriode] = useState('harian');

  // Mock data for demo
  const salesData = [
    { id: 1, menu: "Nasi Goreng", qty: 15, total: 375000, date: "2025-01-15" },
    { id: 2, menu: "Mie Ayam", qty: 12, total: 240000, date: "2025-01-15" },
    { id: 3, menu: "Soto Ayam", qty: 8, total: 144000, date: "2025-01-15" },
    { id: 4, menu: "Nasi Goreng", qty: 10, total: 250000, date: "2025-01-14" },
    { id: 5, menu: "Mie Ayam", qty: 18, total: 360000, date: "2025-01-14" },
  ];

  const groupTransactionsByPeriode = () => {
    const grouped = {};
    const data = transactions.length > 0 ? transactions : salesData;

    data.forEach(t => {
      let key;
      if (filterPeriode === 'harian') {
        key = t.date;
      } else if (filterPeriode === 'mingguan') {
        const date = new Date(t.date);
        const week = Math.floor((date.getDate() - date.getDay()) / 7);
        key = `Minggu ${week + 1}`;
      } else if (filterPeriode === 'bulanan') {
        key = t.date.substring(0, 7);
      }

      if (!grouped[key]) {
        grouped[key] = { total: 0, count: 0, revenue: 0 };
      }
      grouped[key].count += 1;
      grouped[key].revenue += t.total;
    });

    return grouped;
  };

  const data = transactions.length > 0 ? transactions : salesData;
  const groupedData = groupTransactionsByPeriode();
  const totalRevenue = data.reduce((sum, item) => sum + item.total, 0);
  const totalTransactions = data.length;
  const avgTransaction = Math.round(totalRevenue / totalTransactions);

  // Get top menu items
  const topMenus = {};
  data.forEach(item => {
    if (!topMenus[item.menu]) {
      topMenus[item.menu] = { qty: 0, revenue: 0 };
    }
    topMenus[item.menu].qty += item.qty;
    topMenus[item.menu].revenue += item.total;
  });

  const topMenuList = Object.entries(topMenus)
    .map(([menu, data]) => ({ menu, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">Analitik Penjualan</h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Pantau performa penjualan bisnis Anda</p>
        </div>
        
        {/* FILTER PERIODE */}
        <div className="flex flex-wrap gap-2">
          {['harian', 'mingguan', 'bulanan'].map(period => (
            <button
              key={period}
              onClick={() => setFilterPeriode(period)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium capitalize transition duration-200 flex items-center gap-2 text-xs sm:text-sm ${
                filterPeriode === period
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar size={16} />
              {period === 'harian' ? 'Harian' : period === 'mingguan' ? 'Mingguan' : 'Bulanan'}
            </button>
          ))}
        </div>
      </div>

      {/* SUMMARY CARDS - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-red-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-red-600 text-xs sm:text-sm font-semibold mb-1">Total Revenue</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-900 break-words">Rp {totalRevenue.toLocaleString("id-ID")}</p>
            </div>
            <div className="bg-gradient-to-br from-red-600 to-rose-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <DollarSign size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-emerald-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-emerald-600 text-xs sm:text-sm font-semibold mb-1">Total Transaksi</p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-900">{totalTransactions}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <TrendingUp size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Rata-rata */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-amber-200 shadow-sm hover:shadow-md transition sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-amber-600 text-xs sm:text-sm font-semibold mb-1">Rata-rata Transaksi</p>
              <p className="text-2xl sm:text-3xl font-bold text-amber-900 break-words">Rp {avgTransaction.toLocaleString("id-ID")}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-600 to-orange-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Calendar size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* MAIN TABLE */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg sm:rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-rose-50 px-4 sm:px-6 py-3 sm:py-4 border-b">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Riwayat Penjualan</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-600">Menu</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-600">Qty</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-600">Total</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-600">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => (
                    <tr key={item.id} className={`border-b hover:bg-red-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 font-medium text-gray-900">{item.menu}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-600">
                        <span className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold">{item.qty}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 font-semibold text-emerald-600">Rp {item.total.toLocaleString("id-ID")}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-600 text-xs sm:text-sm">{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* TOP MENU SIDEBAR */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 px-4 sm:px-6 py-3 sm:py-4 border-b">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Menu Terlaris</h2>
          </div>
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {topMenuList.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-red-600 to-rose-600 text-white w-8 sm:w-10 h-8 sm:h-10 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm">{item.menu}</p>
                  <p className="text-xs text-gray-600 mt-0.5 sm:mt-1">{item.qty} porsi terjual</p>
                  <div className="mt-1 sm:mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-600 to-rose-600 h-2 rounded-full" 
                      style={{ width: `${(item.revenue / Math.max(...topMenuList.map(m => m.revenue))) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs font-semibold text-red-600 mt-1 sm:mt-2">Rp {item.revenue.toLocaleString("id-ID")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PERIOD BREAKDOWN TABLE */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-50 to-rose-50 px-4 sm:px-6 py-3 sm:py-4 border-b">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Analisis per Periode ({filterPeriode === 'harian' ? 'Harian' : filterPeriode === 'mingguan' ? 'Mingguan' : 'Bulanan'})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-600">Periode</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-600">Transaksi</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-600">Revenue</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-600">Rata-rata</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedData).map(([periode, item], idx) => (
                <tr key={periode} className={`border-b hover:bg-red-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 font-semibold text-gray-900">{periode}</td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <span className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold">{item.count}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 font-semibold text-emerald-600">Rp {item.revenue.toLocaleString("id-ID")}</td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-600">Rp {Math.round(item.revenue / item.count).toLocaleString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
