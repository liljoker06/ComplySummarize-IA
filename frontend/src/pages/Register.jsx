// Register.jsx
import { useState, useEffect } from "react";
import logo from "../assets/logo_complysummarize.png";
import illustration from "../assets/login_side_illustration.png";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const t = {
    fr: {
      registerTitle: "Créer un compte",
      email: "Email",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      haveAccount: "Vous avez déjà un compte ?",
      signIn: "Se connecter",
      register: "S'inscrire",
    },
    en: {
      registerTitle: "Create your account",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm password",
      haveAccount: "Already have an account?",
      signIn: "Sign in",
      register: "Register",
    },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    // TODO: Registration logic
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-[#1E2A38] dark:text-white transition-colors duration-300">
        {/* HEADER */}
        <header className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-10 h-10" />
            <div>
              <div className="font-bold text-xl">ComplySummarize_IA</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">Empowering AI Governance</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-gray-200 dark:bg-gray-800 text-sm px-3 py-1 rounded"
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-gray-100 dark:bg-[#2C3A4B] border border-gray-300 dark:border-gray-600 text-sm p-2 rounded"
            >
              <option value="fr">🇫🇷 Français</option>
              <option value="en">🌍 English</option>
            </select>
          </div>
        </header>

        {/* MAIN SECTION */}
        <main className="flex-1 flex flex-col md:flex-row justify-center items-center px-4 py-8 gap-12">
          {/* REGISTER BOX */}
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 text-black dark:text-white w-full max-w-md p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-lg font-semibold mb-6 text-center">
              {t[lang].registerTitle}
            </h2>

            <input
              type="email"
              placeholder={t[lang].email}
              className="w-full mb-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type={showPassword ? "text" : "password"}
              placeholder={t[lang].password}
              className="w-full mb-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              type={showPassword ? "text" : "password"}
              placeholder={t[lang].confirmPassword}
              className="w-full mb-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full bg-[#407BFF] text-white py-2 rounded hover:bg-[#3366cc] transition"
            >
              {t[lang].register}
            </button>

            <div className="text-sm text-center mt-4">
              {t[lang].haveAccount} {" "}
              <a href="#" className="text-[#407BFF] hover:underline">
                {t[lang].signIn}
              </a>
            </div>
          </form>

          {/* ILLUSTRATION IMAGE */}
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
