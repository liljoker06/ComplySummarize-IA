import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Loader2, UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";

export default function Conversation() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [instruction, setInstruction] = useState("");

  const onDrop = (acceptedFiles) => {
    setFiles(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const handleUpload = async () => {
    if (files.length === 0) return;
    setLoading(true);

    const formData = new FormData();
    files.forEach((file, idx) => {
      formData.append(`document_${idx}`, file);
    });
    formData.append("instruction", instruction);

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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-lg bg-white p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          ComplySummarize IA – Espace de conversation
        </h1>

        <CardContent className="flex flex-col gap-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-100'}`}
          >
            <input {...getInputProps()} />
            {
              isDragActive
                ? <p className="text-blue-600">Déposez les fichiers ici...</p>
                : <p className="text-gray-600">Faites glisser et déposez des fichiers PDF ici, ou cliquez pour sélectionner</p>
            }
            <p className="text-sm text-gray-400 mt-1">Formats supportés : PDF – Sélection multiple autorisée</p>
          </div>

          {files.length > 0 && (
            <div className="bg-gray-50 border p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Fichiers sélectionnés :</p>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                {files.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}

          <Textarea
            placeholder="Souhaitez-vous un résumé plus court, plus long, ou avec un ton spécifique ? (ex : résumer en 3 points, ou version exhaustive)"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            className="resize-none h-28"
          />

          <Button onClick={handleUpload} disabled={loading} className="flex items-center gap-2 self-center">
            {loading ? <Loader2 className="animate-spin" /> : <UploadCloud />} Générer le résumé
          </Button>
        </CardContent>

        {summary && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Résumé :</h2>
            <p className="text-gray-600 whitespace-pre-line">{summary.summary}</p>
            <h2 className="text-xl font-semibold text-gray-700">Points clés :</h2>
            <ul className="list-disc pl-6 text-gray-600">
              {summary.key_points?.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
            <h2 className="text-xl font-semibold text-gray-700">Suggestions d'action :</h2>
            <ul className="list-disc pl-6 text-gray-600">
              {summary.actions?.map((action, idx) => (
                <li key={idx}>{action}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
