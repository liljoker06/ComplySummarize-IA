import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Loader2, UploadCloud, X, Plus, Menu, Send, Moon, Sun } from "lucide-react";
import { useDropzone } from "react-dropzone";

export default function Conversation() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [instruction, setInstruction] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState("gpt-4");
  const fileInputRef = useRef();

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDark);
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const onDrop = (acceptedFiles) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
    noClick: true,
  });

  const handleUpload = async () => {
    if (files.length === 0) return;
    setLoading(true);

    const formData = new FormData();
    files.forEach((file, idx) => {
      formData.append(`document_${idx}`, file);
    });
    formData.append("instruction", instruction);
    formData.append("llm", selectedLLM);

    try {
      const res = await fetch("http://localhost:3000/api/summarize", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setSummary(data);
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex min-h-screen text-sm relative transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {isDragActive && (
        <div className="absolute inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center pointer-events-none">
          <div className="text-2xl font-semibold text-white">Déposer</div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`border-r w-64 p-4 flex flex-col ${sidebarOpen ? "block" : "hidden"} md:flex ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
        <h2 className="text-lg font-semibold mb-4">Conversations</h2>
        <ul className="space-y-2 flex-1 overflow-y-auto">
          <li className="p-2 rounded-lg hover:bg-gray-700/30 cursor-pointer">Résumé du contrat A</li>
          <li className="p-2 rounded-lg hover:bg-gray-700/30 cursor-pointer">Rapport ESG 2023</li>
          <li className="p-2 rounded-lg hover:bg-gray-700/30 cursor-pointer">Audit interne</li>
        </ul>
        <Button className="mt-4">+ Nouvelle conversation</Button>
      </aside>

      {/* Main content */}
      <main {...getRootProps()} className={`flex-1 flex flex-col transition-colors duration-300 relative ${isDragActive ? 'bg-blue-50' : ''}`}>
        <input {...getInputProps()} />

        <header className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h1 className="text-xl font-bold">ComplySummarize IA</h1>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="text-gray-500 hover:text-primary">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-gray-500">
              <Menu />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {summary && (
            <Card className={`mt-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
              <CardContent className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Résumé :</h2>
                  <p className="whitespace-pre-line">{summary.summary}</p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Points clés :</h2>
                  <ul className="list-disc pl-5">
                    {summary.key_points?.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Suggestions d'action :</h2>
                  <ul className="list-disc pl-5">
                    {summary.actions?.map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Input area fixed bottom */}
        <div className={`w-full p-4 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-wrap gap-2 mb-4">
            {files.map((file, index) => (
              <div key={index} className={`px-3 py-1 rounded-full flex items-center space-x-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'}`}>
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={open}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-full flex items-center justify-center"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex items-end gap-2 mb-2">
            <Textarea
              placeholder="Souhaitez-vous un résumé plus court, plus long, ou avec un ton spécifique ? (ex : résumer en 3 points, ou version exhaustive)"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="resize-none h-28 w-full"
            />
            <Button onClick={handleUpload} disabled={loading} className="h-12 w-12 p-0 flex items-center justify-center">
              {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            </Button>
          </div>

          <div className="text-sm text-right">
            <label htmlFor="llm-select" className="mr-2 font-medium">Modèle :</label>
            <select
              id="llm-select"
              value={selectedLLM}
              onChange={(e) => setSelectedLLM(e.target.value)}
              className={`border rounded px-2 py-1 text-sm ${isDarkMode ? 'bg-gray-900 text-white border-gray-600' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="mistral">Mistral</option>
              <option value="llama">LLaMA</option>
            </select>
          </div>
        </div>
      </main>
    </div>
  );
}