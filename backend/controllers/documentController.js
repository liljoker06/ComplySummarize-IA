const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { Document, Summary } = require("../models");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.uploadDocument = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded." });

    const doc = await Document.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
    });

    const dataBuffer = fs.readFileSync(path.join(__dirname, "../uploads", file.filename));
    const pdfData = await pdfParse(dataBuffer);

    const prompt = `
Voici un document : 
---
${pdfData.text}
---

Génère un JSON structuré :
{
  "Résumé": "...",
  "PointsClés": ["..."],
  "SuggestionsActions": ["..."]
}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const rawContent = completion.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (e) {
      return res.status(500).json({ error: "Invalid JSON returned by LLM.", rawContent });
    }

    const summary = await Summary.create({
      summaryText: parsed["Résumé"],
      keyPoints: JSON.stringify(parsed["PointsClés"]),
      actionItems: JSON.stringify(parsed["SuggestionsActions"]),
      documentId: doc.id,
    });

    res.json({ document: doc, summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id, { include: Summary });
    if (!doc) return res.status(404).json({ error: "Document not found." });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadDocumentWithInstructions = async (req, res) => {
  try {
    const file = req.file;
    const instructions = req.body.instructions;

    if (!file) return res.status(400).json({ error: "No file uploaded." });
    if (!instructions) return res.status(400).json({ error: "Instructions are required." });

    // Sauvegarder le document en BDD
    const doc = await Document.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
    });

    // Lire le contenu du PDF
    const dataBuffer = fs.readFileSync(path.join(__dirname, "../uploads", file.filename));
    const pdfData = await pdfParse(dataBuffer);

    // Créer un prompt combiné
    const prompt = `
Voici le contenu d'un document PDF :
---
${pdfData.text}
---

Instructions :
---
${instructions}
---

Génère un JSON structuré :
{
  "Réponse": "..."
}
    `;

    // Appel à l'API OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const rawContent = completion.choices[0].message.content;

    // Essayer de parser le JSON
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (e) {
      return res.status(500).json({ error: "Invalid JSON returned by LLM.", rawContent });
    }

    // Sauvegarder en base
    const summary = await Summary.create({
      summaryText: parsed["Réponse"],
      keyPoints: "[]",
      actionItems: "[]",
      documentId: doc.id,
    });

    res.json({ document: doc, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
