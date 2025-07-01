import { Model } from '../models/index.js';

const modelsData = [
  {
    name: 'gpt-4o',
    displayName: 'GPT-4o',
    provider: 'openai',
    modelVersion: 'gpt-4o-2024-08-06',
    description: 'Modèle GPT-4o optimisé pour la compréhension multimodale et le raisonnement',
    capabilities: {
      summarization: true,
      questionAnswering: true,
      textAnalysis: true,
      documentProcessing: true,
      multilingual: true
    },
    pricing: {
      inputTokens: 0.0025, // per 1K tokens
      outputTokens: 0.01   // per 1K tokens
    },
    maxTokens: 4096,
    contextWindow: 128000,
    isActive: true,
    isDefault: true,
    configuration: {
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    }
  },
  {
    name: 'gpt-3.5-turbo',
    displayName: 'GPT-3.5 Turbo',
    provider: 'openai',
    modelVersion: 'gpt-3.5-turbo-0125',
    description: 'Modèle GPT-3.5 rapide et économique pour les tâches générales',
    capabilities: {
      summarization: true,
      questionAnswering: true,
      textAnalysis: true,
      documentProcessing: true,
      multilingual: true
    },
    pricing: {
      inputTokens: 0.0005,
      outputTokens: 0.0015
    },
    maxTokens: 4096,
    contextWindow: 16385,
    isActive: true,
    isDefault: false,
    configuration: {
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    }
  },
  {
    name: 'claude-3-5-sonnet',
    displayName: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    modelVersion: '20241022',
    description: 'Modèle Claude 3.5 Sonnet excellent pour l\'analyse de documents complexes',
    capabilities: {
      summarization: true,
      questionAnswering: true,
      textAnalysis: true,
      documentProcessing: true,
      multilingual: true,
      longContext: true
    },
    pricing: {
      inputTokens: 0.003,
      outputTokens: 0.015
    },
    maxTokens: 8192,
    contextWindow: 200000,
    isActive: true,
    isDefault: false,
    configuration: {
      temperature: 0.7,
      top_p: 1,
      max_tokens: 4096
    }
  },
  {
    name: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro',
    provider: 'google',
    modelVersion: 'gemini-1.5-pro-002',
    description: 'Modèle Gemini 1.5 Pro avec contexte étendu pour les documents longs',
    capabilities: {
      summarization: true,
      questionAnswering: true,
      textAnalysis: true,
      documentProcessing: true,
      multilingual: true,
      longContext: true
    },
    pricing: {
      inputTokens: 0.00125,
      outputTokens: 0.005
    },
    maxTokens: 8192,
    contextWindow: 2000000,
    isActive: true,
    isDefault: false,
    configuration: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40
    }
  }
];

/**
 * Fonction pour initialiser les modèles
 */
export const seedModels = async () => {
  try {
    console.log('🌱 Initialisation des modèles IA...');
    
    for (const modelData of modelsData) {
      const [model, created] = await Model.findOrCreate({
        where: { name: modelData.name },
        defaults: modelData
      });
      
      if (created) {
        console.log(`✅ Modèle créé: ${model.displayName}`);
      } else {
        console.log(`ℹ️  Modèle existant: ${model.displayName}`);
      }
    }
    
    console.log('🎉 Initialisation des modèles terminée');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des modèles:', error);
    throw error;
  }
};

export default seedModels; 