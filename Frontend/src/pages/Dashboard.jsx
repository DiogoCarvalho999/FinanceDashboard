import { useEffect, useState } from "react";
import api from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import dayjs from "dayjs";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [categoryId, setCategoryId] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState(null);

  const fetchSummary = async () => {
    try {
      const email = localStorage.getItem("userEmail");

      const response = await api.get("/transactions/summary/by-email", {
        params: {
          email,
          start: getStartOfMonth(),
          end: getEndOfMonth(),
        },
      });

      const { balance, totalsByType, totalsByCategory } = response.data;

      setSummary({
        balance,
        totalsByType: totalsByType || {},
        totalsByCategory: totalsByCategory || {},
      });
    } catch (error) {
      console.error("❌ Erro ao buscar resumo:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const email = localStorage.getItem("userEmail");

      const response = await api.get("/transactions/by-email", {
        params: {
          email,
          start: getStartOfMonth(),
          end: getEndOfMonth(),
        },
      });

      setTransactions(response.data);
    } catch (error) {
      console.error("❌ Erro ao buscar transações:", error);
    }
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setDate("");
    setType("EXPENSE");
    setCategoryId(1);
    setEditingId(null);
    setShowForm(false);
  };

  const handleNewTransaction = async (e) => {
    e.preventDefault();

    try {
      const email = localStorage.getItem("userEmail");

      // Validação básica (opcional)
      if (!description || !amount || !date || !type || !categoryId || !email) {
        alert("Por favor preencha todos os campos.");
        return;
      }

      const transactionData = {
        description,
        amount: parseFloat(amount),
        date,
        type,
        categoryId,
        email,
      };

      if (editingId) {
        await api.put(`/transactions/${editingId}`, transactionData);
      } else {
        await api.post("/transactions", transactionData);
      }

      resetForm();
      fetchTransactions();
      fetchSummary();
    } catch (error) {
      console.error("❌ Erro ao criar/editar transação:", error);
      alert("Erro ao guardar transação. Verifica os dados e tenta novamente.");
    }
  };

  const startEdit = (transaction) => {
    setDescription(transaction.description);
    setAmount(transaction.amount);
    setDate(transaction.date);
    setType(transaction.type);
    setCategoryId(transaction.categoryId);
    setEditingId(transaction.id);
    setShowForm(true);
  };

  const getStartOfMonth = () => {
    return dayjs(
      `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`
    ).format("YYYY-MM-DD");
  };

  const getEndOfMonth = () => {
    return dayjs(`${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`)
      .endOf("month")
      .format("YYYY-MM-DD");
  };

  useEffect(() => {
    console.log("🕵️ useEffect triggered", selectedMonth, selectedYear);
    fetchTransactions();
    fetchSummary();
  }, [selectedMonth, selectedYear]);

  const handleDeleteTransaction = async (id) => {
    const token = localStorage.getItem("token");

    if (!window.confirm("Tens a certeza que queres apagar esta transação?"))
      return;

    try {
      await api.delete(`/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Transação apagada com sucesso");
      fetchTransactions(); // recarrega a lista atualizada
      fetchSummary();
    } catch (err) {
      console.error("❌ Erro ao apagar transação:", err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Botão de logout */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="text-red-600 font-semibold hover:text-red-800"
        >
          🚪 Logout
        </button>
      </div>

      <h2 className="text-3xl font-bold mb-6 text-green-700 transition-all duration-300">
        📊 Painel Financeiro
      </h2>

      {/* Filtros de mês e ano */}
      <div className="flex flex-wrap gap-4 mb-8">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="border border-gray-300 rounded px-4 py-2 shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {dayjs().month(i).format("MMMM")}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="border border-gray-300 rounded px-4 py-2 shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {Array.from({ length: 5 }, (_, i) => {
            const year = dayjs().year() - 2 + i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      </div>

      {/* Saldo, Receita, Despesa */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Saldo */}
        <div
          className={`rounded-xl p-6 shadow text-center hover:scale-105 transition-all duration-300
    ${summary?.balance >= 0 ? "bg-green-100" : "bg-red-100"}`}
        >
          <h3
            className={`text-lg font-semibold ${
              summary?.balance >= 0 ? "text-green-700" : "text-red-700"
            }`}
          >
            💰 Saldo
          </h3>
          <p
            className={`text-2xl font-bold ${
              summary?.balance >= 0 ? "text-green-800" : "text-red-800"
            }`}
          >
            {(summary?.balance || 0).toFixed(2)} €
          </p>
        </div>

        {/* Receita */}
        <div className="bg-white border border-green-200 rounded-xl p-6 shadow text-center hover:scale-105 transition-all duration-300">
          <h3 className="text-lg font-semibold text-green-700">📈 Receita</h3>
          <p className="text-2xl font-bold text-green-600">
            {(summary?.totalsByType?.INCOME || 0).toFixed(2)} €
          </p>
        </div>

        {/* Despesa */}
        <div className="bg-white border border-red-200 rounded-xl p-6 shadow text-center hover:scale-105 transition-all duration-300">
          <h3 className="text-lg font-semibold text-red-600">📉 Despesa</h3>
          <p className="text-2xl font-bold text-red-500">
            {(summary?.totalsByType?.EXPENSE || 0).toFixed(2)} €
          </p>
        </div>
      </div>

      {/* Botão de nova transação */}
      <button
        onClick={() => {
          resetForm();
          setShowForm(!showForm);
        }}
        className={`mb-6 px-6 py-3 rounded-lg font-semibold transition duration-300 shadow transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400
 ${
   showForm
     ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
     : "bg-green-600 text-white hover:bg-green-700"
 }`}
      >
        {editingId ? "✏️ Cancelar Edição" : "+ Nova Transação"}
      </button>

      {/* Formulário */}
      {showForm && (
        <form
          onSubmit={handleNewTransaction}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-white p-6 rounded-lg shadow border border-gray-100"
        >
          <input
            type="text"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            type="number"
            placeholder="Valor"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="EXPENSE">Despesa</option>
            <option value="INCOME">Receita</option>
          </select>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value={1}>Alimentação</option>
            <option value={51}>Transporte</option>
            <option value={101}>Saúde</option>
            <option value={151}>Lazer</option>
          </select>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-md font-semibold transition-all duration-300 col-span-1 md:col-span-2 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400
"
          >
            {editingId ? "💾 Guardar Alterações" : "➕ Adicionar Transação"}
          </button>
        </form>
      )}

      {/* Tabela de transações */}
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-100">
        <table className="min-w-full table-auto">
          <thead className="bg-green-100 text-green-800 text-sm">
            <tr>
              <th className="px-6 py-3 text-left">Descrição</th>
              <th className="px-6 py-3 text-left">Valor (€)</th>
              <th className="px-6 py-3 text-left">Data</th>
              <th className="px-6 py-3 text-left">Categoria</th>
              <th className="px-6 py-3 text-left">Tipo</th>
              <th className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800 divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 text-center text-gray-500 italic"
                >
                  Nenhuma transação encontrada neste período.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-green-50 transition-colors duration-200"
                >
                  <td className="px-6 py-3 text-left">{t.description}</td>
                  <td className="px-6 py-3 text-left">
                    {t.amount.toFixed(2)} €
                  </td>
                  <td className="px-6 py-3 text-left">{t.date}</td>
                  <td className="px-6 py-3 text-left">
                    {t.categoryName || "N/A"}
                  </td>
                  <td className="px-6 py-3 text-left">{t.type}</td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => startEdit(t)}
                        className="text-green-600 hover:text-green-800 transition-transform transform hover:scale-125"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(t.id)}
                        className="text-red-500 hover:text-red-700 transition-transform transform hover:scale-125"
                        title="Apagar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {/* Gráfico de barras: Receita vs Despesa */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h3 className="text-lg font-semibold text-center text-green-700 mb-4">
            📊 Por Tipo
          </h3>
          <BarChart
            width={300}
            height={250}
            data={[
              { name: "Receita", valor: summary?.totalsByType?.INCOME || 0 },
              { name: "Despesa", valor: summary?.totalsByType?.EXPENSE || 0 },
            ]}
          >
            <XAxis dataKey="name" stroke="#4caf50" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="valor" fill="#4caf50" />
          </BarChart>
        </div>

        {/* Gráfico de pizza: Por categoria */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h3 className="text-lg font-semibold text-center text-green-700 mb-4">
            🥧 Por Categoria
          </h3>
          <PieChart width={300} height={250}>
            <Pie
              data={Object.entries(summary?.totalsByCategory || {}).map(
                ([name, value]) => ({ name, value })
              )}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#81c784"
              label
            />
            <Tooltip />
          </PieChart>
        </div>
      </div>
    </div>
  );
}
