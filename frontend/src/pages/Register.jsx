// Register.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import logo from "../assets/logo_complysummarize.png";
import illustration from "../assets/login_side_illustration.png";
import { FiEye, FiEyeOff, FiLoader } from "react-icons/fi";

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError, isAuthenticated } = useAuth();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lang, setLang] = useState("fr");
  const [validationErrors, setValidationErrors] = useState({});
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
    setValidationErrors({});
  }, [firstName, lastName, email, password, confirmPassword, clearError]);

  const t = {
    fr: {
      registerTitle: "Créer un compte",
      firstName: "Prénom",
      lastName: "Nom",
      email: "Email",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      haveAccount: "Vous avez déjà un compte ?",
      signIn: "Se connecter",
      register: "S'inscrire",
      passwordMismatch: "Les mots de passe ne correspondent pas",
      passwordTooShort: "Le mot de passe doit contenir au moins 6 caractères",
      emailInvalid: "Adresse email invalide",
      fieldRequired: "Ce champ est requis",
    },
    en: {
      registerTitle: "Create your account",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm password",
      haveAccount: "Already have an account?",
      signIn: "Sign in",
      register: "Register",
      passwordMismatch: "Passwords do not match",
      passwordTooShort: "Password must be at least 6 characters",
      emailInvalid: "Invalid email address",
      fieldRequired: "This field is required",
    },
  };

  const validateForm = () => {
    const errors = {};

    if (!firstName.trim()) errors.firstName = t[lang].fieldRequired;
    if (!lastName.trim()) errors.lastName = t[lang].fieldRequired;
    if (!email.trim()) {
      errors.email = t[lang].fieldRequired;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = t[lang].emailInvalid;
    }
    if (!password) {
      errors.password = t[lang].fieldRequired;
    } else if (password.length < 6) {
      errors.password = t[lang].passwordTooShort;
    }
    if (!confirmPassword) {
      errors.confirmPassword = t[lang].fieldRequired;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = t[lang].passwordMismatch;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password: password,
    };

    const result = await register(userData);
    
    if (result.success) {
      navigate('/');
    }
    // Les erreurs sont gérées automatiquement par le hook useAuth
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

            {/* Affichage des erreurs globales */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Prénom */}
            <div className="mb-4">
              <input
                type="text"
                placeholder={t[lang].firstName}
                className={`w-full px-4 py-2 border rounded bg-white dark:bg-gray-700 text-sm ${
                  validationErrors.firstName 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              {validationErrors.firstName && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.firstName}</p>
              )}
            </div>

            {/* Nom */}
            <div className="mb-4">
              <input
                type="text"
                placeholder={t[lang].lastName}
                className={`w-full px-4 py-2 border rounded bg-white dark:bg-gray-700 text-sm ${
                  validationErrors.lastName 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              {validationErrors.lastName && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <input
                type="email"
                placeholder={t[lang].email}
                className={`w-full px-4 py-2 border rounded bg-white dark:bg-gray-700 text-sm ${
                  validationErrors.email 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {validationErrors.email && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div className="mb-4 relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t[lang].password}
                className={`w-full px-4 py-2 border rounded bg-white dark:bg-gray-700 text-sm ${
                  validationErrors.password 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
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
              {validationErrors.password && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirmer mot de passe */}
            <div className="mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t[lang].confirmPassword}
                className={`w-full px-4 py-2 border rounded bg-white dark:bg-gray-700 text-sm ${
                  validationErrors.confirmPassword 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {validationErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#407BFF] text-white py-2 rounded hover:bg-[#3366cc] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <FiLoader className="animate-spin" size={16} />}
              {isLoading ? 'Création...' : t[lang].register}
            </button>

            <div className="text-sm text-center mt-4">
              {t[lang].haveAccount} {" "}
              <Link to="/login" className="text-[#407BFF] hover:underline">
                {t[lang].signIn}
              </Link>
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
