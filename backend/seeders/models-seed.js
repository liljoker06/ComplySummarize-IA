import { Model } from '../models/index.js';

const seedModels = async () => {
  try {
    console.log('🌱 Seeding models...');

    const modelsData = [
      // Modèles Ollama populaires
      {
        name: 'gemma3:1b',
        displayName: 'Gemma 3 1B',
        provider: 'ollama',
        description: 'Modèle Gemma 3 1B - Léger et rapide pour les tâches simples',
        isActive: false, // Sera mis à jour par la synchronisation
        isDefault: false
      },
      {
        name: 'llama3.2:3b',
        displayName: 'Llama 3.2 3B',
        provider: 'ollama',
        description: 'Modèle Llama 3.2 3B - Équilibre entre performance et vitesse',
        isActive: false,
        isDefault: false
      },
      {
        name: 'qwen2.5:7b',
        displayName: 'Qwen 2.5 7B',
        provider: 'ollama',
        description: 'Modèle Qwen 2.5 7B - Excellent pour les tâches multilingues',
        isActive: false,
        isDefault: false
      },

      // Modèles Mistral
      {
        name: 'mistral-8b-2410',
        displayName: 'Mistral 8B (2410)',
        provider: 'mistral',
        description: 'Modèle Mistral 8B optimisé pour les tâches générales',
        isActive: false,
        isDefault: false
      },
      {
        name: 'mistral-small-2501',
        displayName: 'Mistral Small (2501)',
        provider: 'mistral',
        description: 'Modèle Mistral Small dernière version',
        isActive: false,
        isDefault: false
      },
      {
        name: 'mistral-small-2506',
        displayName: 'Mistral Small (2506)',
        provider: 'mistral',
        description: 'Modèle Mistral Small version avancée',
        isActive: false,
        isDefault: false
      },

      // Modèles OpenAI
      {
        name: 'o3-mini',
        displayName: 'GPT-o3 Mini',
        provider: 'openai',
        description: 'Modèle OpenAI o3 Mini optimisé pour la rapidité',
        isActive: false,
        isDefault: false
      },
      {
        name: 'o4-mini',
        displayName: 'GPT-o4 Mini',
        provider: 'openai',
        description: 'Modèle OpenAI o4 Mini dernière génération',
        isActive: false,
        isDefault: false
      }
    ];

    for (const modelData of modelsData) {
      await Model.findOrCreate({
        where: { 
          name: modelData.name,
          provider: modelData.provider 
        },
        defaults: modelData
      });
    }

    console.log('✅ Models seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding models:', error);
  }
};

export default seedModels; 