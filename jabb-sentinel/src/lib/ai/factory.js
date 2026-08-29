import OpenAIProvider from './providers/openai.js';
import ClaudeProvider from './providers/claude.js';
import AzureOpenAIProvider from './providers/azure-openai.js';
import OllamaProvider from './providers/ollama.js';
import OpenCodeProvider from './providers/opencode.js';

/**
 * JABB Sentinel — AI Provider Factory
 * The brain of the Sentinel. Routes tasks to the optimal AI provider.
 */
export function getAIProvider() {
    const provider = process.env.AI_PROVIDER || 'openai';

    switch (provider.toLowerCase()) {
        case 'openai': return new OpenAIProvider();
        case 'claude':
        case 'anthropic': return new ClaudeProvider();
        case 'azure':
        case 'azure-openai': return new AzureOpenAIProvider();
        case 'ollama': return new OllamaProvider();
        default: throw new Error(`Unknown AI provider: ${provider}`);
    }
}

/**
 * Get OpenCode provider for autonomous coding tasks
 * The "hands" of the Sentinel — executes code changes autonomously
 */
export function getOpenCodeProvider() {
    return new OpenCodeProvider();
}

/**
 * All available providers with Sentinel-specific metadata
 */
export function getAvailableProviders() {
    return [
        {
            id: 'openai',
            name: 'OpenAI (ChatGPT)',
            type: 'chat',
            sentinelTier: 'cloud',
            models: ['gpt-4o', 'gpt-4-turbo'],
            cost: 'Pay-per-token',
            privacy: 'Cloud',
            bestFor: 'General purpose, highest accuracy'
        },
        {
            id: 'claude',
            name: 'Anthropic (Claude)',
            type: 'chat',
            sentinelTier: 'cloud',
            models: ['claude-3-5-sonnet-20251022'],
            cost: 'Pay-per-token',
            privacy: 'Cloud',
            bestFor: 'Complex reasoning, long context'
        },
        {
            id: 'azure',
            name: 'Azure OpenAI',
            type: 'chat',
            sentinelTier: 'enterprise',
            models: ['gpt-4o'],
            cost: 'Pay-per-token',
            privacy: 'Enterprise (HIPAA/FedRAMP)',
            bestFor: 'Regulated industries, compliance'
        },
        {
            id: 'ollama',
            name: 'Ollama (Local LLM)',
            type: 'chat',
            sentinelTier: 'local',
            models: ['llama3.1', 'mistral', 'deepseek-coder'],
            cost: 'FREE',
            privacy: '100% Local — Zero data exfiltration',
            bestFor: 'Privacy, offline, zero cost'
        },
        {
            id: 'opencode',
            name: 'OpenCode (AI Coding Agent)',
            type: 'code',
            sentinelTier: 'local',
            capabilities: ['write-feature', 'fix-bug', 'refactor', 'generate-docs', 'run-tests'],
            cost: 'FREE',
            privacy: '100% Local',
            bestFor: 'Autonomous code generation'
        }
    ];
}
