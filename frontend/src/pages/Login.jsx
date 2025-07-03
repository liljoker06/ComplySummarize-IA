// Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import logo from "../assets/logo_complysummarize.png";
import illustration from "../assets/login_side_illustration.png";
import { FiEye, FiEyeOff, FiLoader } from "react-icons/fi";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lang, setLang] = useState("fr");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Effacer les erreurs quand on change les champs
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password, clearError]);

  const t = {
    fr: {
      loginTitle: "Se connecter à votre compte",
      email: "Email",
      password: "Mot de passe",
      forgot: "Réinitialiser le mot de passe",
      noAccount: "Vous n'avez pas encore de compte ?",
      signUp: "S'inscrire",
      login: "Connexion",
    },
    en: {
      loginTitle: "Sign in to your account",
      email: "Email",
      password: "Password",
      forgot: "Reset password",
      noAccount: "Don't have an account yet?",
      signUp: "Sign up",
      login: "Log in",
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      return;
    }

    const result = await login(email.trim(), password);
    
    if (result.success) {
      navigate('/');
    }
    // Les erreurs sont gérées automatiquement par le hook useAuth
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-[#1E2A38] dark:text-white transition-colors duration-300">
        

        {/* MAIN SECTION */}
        <main className="flex-1 flex flex-col md:flex-row justify-center items-center px-4 py-8 gap-12">
          {/* LOGIN BOX */}
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 text-black dark:text-white w-full max-w-md p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-lg font-semibold mb-6 text-center">
              {t[lang].loginTitle}
            </h2>

            {/* Affichage des erreurs */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <input
              type="email"
              placeholder={t[lang].email}
              className="w-full mb-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t[lang].password}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full bg-[#407BFF] text-white py-2 rounded hover:bg-[#3366cc] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <FiLoader className="animate-spin" size={16} />}
              {isLoading ? 'Connexion...' : t[lang].login}
            </button>

            <div className="text-sm text-center mt-4">
              <a href="#" className="text-[#407BFF] hover:underline">
                {t[lang].forgot}
              </a>
            </div>

            <div className="text-sm text-center mt-2">
              {t[lang].noAccount} {" "}
              <Link to="/register" className="text-[#407BFF] hover:underline">
                {t[lang].signUp}
              </Link>
            </div>
          </form>

          {/* ILLUSTRATION IMAGE (right side) */}
          <div className="hidden md:block">
            <img src={illustration} alt="Illustration" className="w-80 h-auto" />
          </div>
        </main>

        {/* FOOTER */}
        <footer className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-6 h-6" />
            <span>ComplySummarize_IA</span>
          </div>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="#" className="hover:underline">Politique de confidentialité</a>
            <a href="#" className="hover:underline">Conditions d'utilisation</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
