import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem("userEmail", email);
        localStorage.setItem("authToken", response.data.token);
        setSuccess(true);
        setMessage("✅ Login efetuado com sucesso!");
        setTimeout(() => {
          setMessage("");
          navigate("/dashboard");
        }, 1000);
      } else {
        setSuccess(false);
        setMessage("Credenciais inválidas.");
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setSuccess(false);
      setMessage("Erro ao iniciar sessão.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
          FinanceFlow
        </h1>
        <h2 className="text-xl font-semibold text-center text-gray-700 mb-4">
          Inicia sessão na tua conta
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
            Entrar
          </button>
          {message && (
            <p
              className={`text-sm text-center ${
                success ? "text-green-600" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </form>
        <p className="text-sm mt-4 text-center text-gray-600">
          Não tens conta?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-green-600 font-semibold hover:underline"
          >
            Regista-te aqui
          </button>
        </p>
      </div>
    </div>
  );
}
