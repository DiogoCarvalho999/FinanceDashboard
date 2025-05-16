import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../api";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EFF"];

const FinanceSummary = ({ email }) => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");
        const start = "2025-05-01";
        const end = "2025-05-31";

        const response = await api.get(`/transactions/summary/by-email`, {
          params: { email, start, end },
          headers: { Authorization: `Bearer ${token}` },
        });

        setSummary(response.data);
      } catch (err) {
        console.error("Erro ao buscar resumo:", err);
      }
    };

    fetchSummary();
  }, [email]);

  if (!summary) return <p>🔄 A carregar resumo financeiro...</p>;

  const categoryData = Object.entries(summary.totalsByCategory).map(
    ([name, value]) => ({ name, value })
  );
  const typeData = Object.entries(summary.totalsByType).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
      {/* Balanço Total */}
      <div className="bg-white shadow rounded p-4 text-center">
        <h2 className="text-xl font-bold mb-2">💸 Balanço Total</h2>
        <p
          className={`text-2xl font-semibold ${
            summary.balance >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {summary.balance.toFixed(2)} €
        </p>
      </div>

      {/* Totais por Categoria */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-bold mb-4 text-center">📊 Por Categoria</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
              dataKey="value"
            >
              {categoryData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Totais por Tipo */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-bold mb-4 text-center">📈 Por Tipo</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={typeData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinanceSummary;
