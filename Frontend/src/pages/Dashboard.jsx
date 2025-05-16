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
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

      {/* Filtros de mês e ano */}
      <div className="flex gap-4 mb-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="border p-2"
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
          className="border p-2"
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-300 rounded shadow p-4 text-center">
          <h3 className="text-lg font-semibold">💰 Saldo</h3>
          <p className="text-xl font-bold">
            {(summary?.balance || 0).toFixed(2)} €
          </p>
        </div>
        <div className="bg-white dark:bg-gray-300 rounded shadow p-4 text-center">
          <h3 className="text-lg font-semibold">📈 Receita</h3>
          <p className="text-xl font-bold text-green-500">
            {(summary?.totalsByType?.INCOME || 0).toFixed(2)} €
          </p>
        </div>
        <div className="bg-white dark:bg-gray-300 rounded shadow p-4 text-center">
          <h3 className="text-lg font-semibold">📉 Despesa</h3>
          <p className="text-xl font-bold text-red-500">
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
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        {editingId ? "✏️ Cancelar Edição" : "+ Nova Transação"}
      </button>

      {/* Formulário */}
      {showForm && (
        <form
          onSubmit={handleNewTransaction}
          className="mb-6 grid grid-cols-2 gap-4"
        >
          <input
            type="text"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 col-span-2"
            required
          />
          <input
            type="number"
            placeholder="Valor"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2"
            required
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2"
            required
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border p-2"
          >
            <option value="EXPENSE">Despesa</option>
            <option value="INCOME">Receita</option>
          </select>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="border p-2"
          >
            <option value={1}>Alimentação</option>
            <option value={51}>Transporte</option>
            <option value={101}>Saúde</option>
            <option value={151}>Lazer</option>
          </select>
          <button
            type="submit"
            className="bg-green-600 text-white p-2 rounded col-span-2"
          >
            {editingId ? "Guardar Alterações" : "Adicionar Transação"}
          </button>
        </form>
      )}

      {/* Tabela de transações */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-300">
              <th className="border px-4 py-2">Descrição</th>
              <th className="border px-4 py-2">Valor</th>
              <th className="border px-4 py-2">Data</th>
              <th className="border px-4 py-2">Categoria</th>
              <th className="border px-4 py-2">Tipo</th>
              <th className="border px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  Nenhuma transação encontrada.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="text-center">
                  <td className="border px-4 py-2">{t.description}</td>
                  <td className="border px-4 py-2">{t.amount} €</td>
                  <td className="border px-4 py-2">{t.date}</td>
                  <td className="border px-4 py-2">
                    {t.categoryName || "N/A"}
                  </td>
                  <td className="border px-4 py-2">{t.type}</td>
                  <td className="border px-4 py-2">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => startEdit(t)}
                        className="text-black hover:text-blue-600 transform transition-transform duration-200 hover:scale-125"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(t.id)}
                        className="text-red-500 hover:text-red-700 transform transition-transform duration-200 hover:scale-125"
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
        <div className="bg-white dark:bg-gray-300 p-4 rounded shadow">
          <h3 className="text-lg font-semibold text-center mb-4">
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
            <XAxis dataKey="name" stroke="#8884d8" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="valor" fill="#4f46e5" />
          </BarChart>
        </div>

        {/* Gráfico de pizza: Por categoria */}
        <div className="bg-white dark:bg-gray-300 p-4 rounded shadow">
          <h3 className="text-lg font-semibold text-center mb-4">
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
              fill="#8884d8"
              label
            />
            <Tooltip />
          </PieChart>
        </div>
      </div>
    </div>
  );
}
