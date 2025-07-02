/**
 * Service d'anonymisation simple des données personnelles (PII)
 * Détecte et anonymise automatiquement les informations sensibles
 */
class PIIService {
    constructor() {
        this.patterns = [
            {
                regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
                replacement: '[EMAIL_ANONYME]'
            },
            {
                regex: /(?:\+33|0)[1-9](?:[.-\s]?\d{2}){4}/g,
                replacement: '[TEL_ANONYME]'
            },
            {
                regex: /[12]\d{2}(0[1-9]|1[0-2])\d{2}\d{3}\d{3}\d{2}/g,
                replacement: '[SECU_ANONYME]'
            },
            {
                regex: /FR\d{2}\s?(\d{4}\s?){5}\d{3}/g,
                replacement: '[IBAN_ANONYME]'
            },
            {
                regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
                replacement: '[CARTE_ANONYME]'
            },
            {
                regex: /\d+\s+(?:rue|avenue|boulevard|place|impasse|allée|chemin|route)\s+[^\n,]+,?\s*\d{5}\s+[A-Za-z\s-]+/gi,
                replacement: '[ADRESSE_ANONYME]'
            },
            {
                regex: /\b\d{5}\b/g,
                replacement: '[CP_ANONYME]'
            },
            {
                regex: /\b(?:0[1-9]|[12]\d|3[01])[-/](?:0[1-9]|1[0-2])[-/](?:19|20)\d{2}\b/g,
                replacement: '[DATE_ANONYME]'
            }
        ];
    }

    /**
     * Anonymise un texte en masquant toutes les PII détectées. 
     */
    anonymizeText(text) {
        let anonymizedText = text;
        let detectedCount = 0;

        for (const pattern of this.patterns) {
            const matches = anonymizedText.match(pattern.regex);
            if (matches) {
                detectedCount += matches.length;
                anonymizedText = anonymizedText.replace(pattern.regex, pattern.replacement);
            }
        }

        return {
            anonymizedText: anonymizedText,
            piiDetected: detectedCount > 0,
            detectedCount: detectedCount
        };
    }
}

export default new PIIService(); 