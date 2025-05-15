import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [categoryId, setCategoryId] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchTransactions = async () => {
    try {
      const email = localStorage.getItem("userEmail");
      const token = localStorage.getItem("token");

      const response = await api.get(`/transactions/by-email/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Transações carregadas:", response.data);

      const sorted = response.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setTransactions(sorted);
    } catch (err) {
      console.error("❌ Erro ao carregar transações:", err);
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
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");

    try {
      if (editingId) {
        await api.put(
          `/transactions/${editingId}`, // <-- AQUI ESTAVA O ERRO
          {
            description,
            amount,
            date,
            type,
            categoryId,
            email: localStorage.getItem("userEmail"), // <- correto
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("✅ Transação editada com sucesso");
      } else {
        await api.post(
          "/transactions",
          { description, amount, date, type, categoryId, email },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("✅ Transação criada com sucesso");
      }

      resetForm();
      fetchTransactions();
    } catch (err) {
      console.error("❌ Erro ao criar/editar transação:", err);
    }
  };

  const startEdit = (transaction) => {
    setDescription(transaction.description);
    setAmount(transaction.amount);
    setDate(transaction.date);
    setType(transaction.type);
    setCategoryId(transaction.category.id);
    setEditingId(transaction.id);
    setShowForm(true);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

      <button
        onClick={() => {
          resetForm();
          setShowForm(!showForm);
        }}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        {editingId ? "✏️ Cancelar Edição" : "+ Nova Transação"}
      </button>

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

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
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
                    {t.category?.name || "N/A"}
                  </td>
                  <td className="border px-4 py-2">{t.type}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => startEdit(t)}
                      className="text-black no-underline hover:text-blue-600"
                    >
                      ✏️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
