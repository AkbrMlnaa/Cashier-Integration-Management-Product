import { useState } from "react";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function SalesContent({ transactions = [] }) {
  const [filterPeriode, setFilterPeriode] = useState("harian");

  const data = transactions || [];

  const groupTransactionsByPeriode = () => {
    const grouped = {};

    data.forEach((t) => {
      const dateObj = new Date(t.created_at);
      let key = "";

      if (filterPeriode === "harian") {
        key = dateObj.toISOString().split("T")[0];
      } else if (filterPeriode === "mingguan") {
        const week = Math.floor((dateObj.getDate() - dateObj.getDay()) / 7) + 1;
        key = `Minggu ${week}`;
      } else if (filterPeriode === "bulanan") {
        key = dateObj.toISOString().slice(0, 7);
      }

      if (!grouped[key]) grouped[key] = { count: 0, revenue: 0 };

      const transactionTotal = t.details.reduce(
        (sum, d) => sum + d.price * d.quantity,
        0
      );

      grouped[key].count += 1;
      grouped[key].revenue += transactionTotal;
    });

    return grouped;
  };

  const groupedData = groupTransactionsByPeriode();

  const totalRevenue = data.reduce(
    (sum, t) => sum + t.details.reduce((s, d) => s + d.price * d.quantity, 0),
    0
  );

  const totalTransactions = data.length;
  const avgTransaction =
    totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

  const topMenus = {};
  data.forEach((t) => {
    t.details.forEach((d) => {
      if (!topMenus[d.product?.name])
        topMenus[d.product?.name] = { qty: 0, revenue: 0 };
      topMenus[d.product?.name].qty += d.quantity;
      topMenus[d.product?.name].revenue += d.price * d.quantity;
    });
  });

  const topMenuList = Object.entries(topMenus)
    .map(([menu, values]) => ({ menu, ...values }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3);

  const chartData = Object.entries(groupedData)
    .map(([periode, item]) => ({
      periode,
      revenue: item.revenue,
      count: item.count,
      avgTransaction: item.revenue / item.count,
    }))
    .sort((a, b) =>
      a.periode.localeCompare(b.periode, undefined, { numeric: true })
    );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            Analisis Penjualan
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            Pantau performa penjualan bisnis
          </p>
        </div>

        {/* FILTER PERIODE */}
        <div className="flex flex-wrap gap-2">
          {["harian", "mingguan", "bulanan"].map((period) => (
            <button
              key={period}
              onClick={() => setFilterPeriode(period)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium capitalize transition duration-200 flex items-center gap-2 text-xs sm:text-sm ${
                filterPeriode === period
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/30"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Calendar size={16} />
              {period === "harian"
                ? "Harian"
                : period === "mingguan"
                ? "Mingguan"
                : "Bulanan"}
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
              <p className="text-red-600 text-xs sm:text-sm font-semibold mb-1">
                Total Transaksi
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-red-900">
                {totalTransactions}
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-600 to-rose-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <TrendingUp size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-emerald-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-emerald-600 text-xs sm:text-sm font-semibold mb-1">
                Total Pendapatan
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-900 break-words">
                Rp {totalRevenue.toLocaleString("id-ID")}
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
                Rp {avgTransaction.toLocaleString("id-ID")}
              </p>
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
          <div className="bg-white rounded-lg sm:rounded-xl shadow border border-gray-200 overflow-hidden p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Riwayat Penjualan (Grafik)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <defs>
                  {/* Bar Transaksi merah */}
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#FCA5A5" stopOpacity={0.3} />
                  </linearGradient>

                  {/* Line Pendapatan hijau */}
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#6EE7B7" stopOpacity={0.3} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

                <XAxis
                  dataKey="periode"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#555", fontSize: 12 }}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#555", fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#555", fontSize: 12 }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    padding: "10px 14px",
                  }}
                  itemStyle={{ color: "#333", fontWeight: 600 }}
                  formatter={(value, name) => {
                    if (name === "Pendapatan")
                      return [`Rp ${value.toLocaleString("id-ID")}`, name];
                    if (name === "Rata-rata")
                      return [
                        `Rp ${Math.round(value).toLocaleString("id-ID")}`,
                        name,
                      ];
                    return [value, name];
                  }}
                />

                <Legend verticalAlign="top" align="right" iconType="circle" />

                {/* Bar Transaksi */}
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  fill="url(#colorCount)"
                  name="Transaksi"
                  radius={[10, 10, 0, 0]}
                />

                {/* Line Pendapatan */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="url(#colorRevenue)"
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 2, fill: "#fff" }}
                  name="Pendapatan"
                />

                {/* Line Rata-rata transaksi */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgTransaction"
                  stroke="#F59E0B" // amber/yellow
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 1, fill: "#FCD34D" }} // variasi warna kuning
                  name="Rata-rata"
                  strokeDasharray="5 5" // garis putus-putus untuk rata-rata
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP MENU SIDEBAR */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 px-4 sm:px-6 py-3 sm:py-4 border-b">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              Menu Terlaris
            </h2>
          </div>
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {topMenuList.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-red-600 to-rose-600 text-white w-8 sm:w-10 h-8 sm:h-10 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                    {item.menu}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5 sm:mt-1">
                    {item.qty} porsi terjual
                  </p>
                  <div className="mt-1 sm:mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-600 to-rose-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (item.revenue /
                            Math.max(...topMenuList.map((m) => m.revenue))) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs font-semibold text-red-600 mt-1 sm:mt-2">
                    Rp {item.revenue.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PERIOD BREAKDOWN TABLE */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-50 to-rose-50 px-4 sm:px-6 py-3 sm:py-4 border-b">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Analisis per Periode (
            {filterPeriode === "harian"
              ? "Harian"
              : filterPeriode === "mingguan"
              ? "Mingguan"
              : "Bulanan"}
            )
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-600">
                  Periode
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-600">
                  Transaksi
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-600">
                  Revenue
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-600">
                  Rata-rata
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedData).map(([periode, item], idx) => (
                <tr
                  key={periode}
                  className={`border-b hover:bg-red-50 transition ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-3 sm:px-6 py-2 sm:py-4 font-semibold text-gray-900">
                    {periode}
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <span className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold">
                      {item.count}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 font-semibold text-emerald-600">
                    Rp {item.revenue.toLocaleString("id-ID")}
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-600">
                    Rp{" "}
                    {Math.round(item.revenue / item.count).toLocaleString(
                      "id-ID"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
