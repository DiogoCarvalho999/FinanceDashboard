import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      if (
        response.data.token &&
        response.data.token === "Registo concluído com sucesso."
      ) {
        setMessage("Registo concluído com sucesso.");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setMessage(response.data.token || "Erro ao registar.");
      }
    } catch (err) {
      console.error("Erro no registo:", err);
      setMessage("Erro ao registar.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
          FinanceFlow
        </h1>
        <h2 className="text-xl font-semibold text-center text-gray-700 mb-4">
          Cria a tua conta
        </h2>
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 p-2 rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Palavra-passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-2 rounded"
            required
          />
          <button
            type="submit"
            className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            Registar
          </button>
          {message && (
            <p className="text-sm text-center text-red-500">{message}</p>
          )}
        </form>
        <p className="text-sm mt-4 text-center text-gray-600">
          Já tens conta?{" "}
          <button
            onClick={() => navigate("/")}
            className="text-green-600 font-semibold hover:underline"
          >
            Faz login aqui
          </button>
        </p>
      </div>
    </div>
  );
}
