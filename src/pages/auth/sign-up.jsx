// SignUp.jsx
import { useState } from "react";
import { supabase } from "/src/supaBaseClient";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const handleSignUp = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp(
        {
          email,
          password,
        },
        {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      );

      if (error) throw error;

      setMessage("Por favor, revisa tu correo para confirmar tu cuenta.");

      navigate("/home"); // Redirige inmediatamente
       
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

 

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSignUp}
        className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Registrarse</h2>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        {message && <div className="text-green-500 text-sm mb-4">{message}</div>}

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Cargando..." : "Registrar"}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
