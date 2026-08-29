<script>
    import { goto } from '$app/navigation';

    const features = [
        {
            title: 'Multi-LLM Guardian',
            description: 'Claude, ChatGPT, Azure OpenAI, or local Ollama — your choice',
            icon: '🛡️'
        },
        {
            title: 'Autonomous Coding',
            description: 'OpenCode integration writes, tests, and refactors code',
            icon: '⚡'
        },
        {
            title: 'Real-Time Vigilance',
            description: 'Live telemetry feeds and agent health monitoring',
            icon: '👁️'
        },
        {
            title: 'Enterprise Ready',
            description: 'HIPAA, SOX, FedRAMP compliant architecture',
            icon: '🏛️'
        }
    ];

    function launchSentinel() {
        goto('/dashboard');
    }
</script>

<div class="min-h-screen bg-gradient-to-br from-[#0B1426] via-[#0A1F44] to-[#0B1426]">
    <div class="container mx-auto px-4 py-16">

        <!-- Hero Section -->
        <div class="text-center mb-16">
            <div class="inline-block mb-6">
                <div class="text-7xl mb-2">🛡️</div>
            </div>
            <h1 class="text-7xl font-bold text-white mb-4 tracking-tight">
                JABB <span class="text-[#00D9FF]">Sentinel</span>
            </h1>
            <p class="text-2xl text-blue-300 mb-4 font-light tracking-wide">
                The Guardian of Your AI Agents
            </p>
            <p class="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
                Enterprise-grade AI mission control. Monitor, orchestrate, and protect
                your agents with multi-LLM intelligence, autonomous coding, and
                real-time vigilance — all running locally or in your cloud.
            </p>
            <button
                on:click={launchSentinel}
                class="px-10 py-4 bg-[#00D9FF] hover:bg-[#00B8D9] text-[#0A1F44] font-bold rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/50"
            >
                Activate Sentinel →
            </button>
        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {#each features as feature}
                <div class="bg-[#1E3A8A]/20 backdrop-blur-sm border border-[#00D9FF]/20 rounded-xl p-6 hover:border-[#00D9FF]/60 transition-all group">
                    <div class="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                    <h3 class="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p class="text-gray-400 text-sm">{feature.description}</p>
                </div>
            {/each}
        </div>

        <!-- Editions Section -->
        <div class="bg-[#1E3A8A]/10 backdrop-blur-sm border border-[#00D9FF]/20 rounded-xl p-8 max-w-5xl mx-auto mb-16">
            <h2 class="text-3xl font-bold text-white mb-8 text-center">
                Three Editions. One Sentinel.
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-[#0A1F44]/50 rounded-lg p-6 border border-yellow-500/30">
                    <div class="text-yellow-400 text-sm font-bold mb-2">🟡 LOCAL EDITION</div>
                    <h3 class="text-xl font-bold text-white mb-3">Single User</h3>
                    <p class="text-gray-300 text-sm mb-4">Ollama + OpenCode — 100% local, 100% free</p>
                    <div class="text-3xl font-bold text-yellow-400">$0<span class="text-sm text-gray-400">/month</span></div>
                </div>
                <div class="bg-[#0A1F44]/50 rounded-lg p-6 border border-blue-500/30">
                    <div class="text-blue-400 text-sm font-bold mb-2">🔵 BUSINESS EDITION</div>
                    <h3 class="text-xl font-bold text-white mb-3">Small Business</h3>
                    <p class="text-gray-300 text-sm mb-4">Power Platform + Azure OpenAI</p>
                    <div class="text-3xl font-bold text-blue-400">$25-40<span class="text-sm text-gray-400">/user/mo</span></div>
                </div>
                <div class="bg-[#0A1F44]/50 rounded-lg p-6 border border-cyan-500/30">
                    <div class="text-cyan-400 text-sm font-bold mb-2">🟢 ENTERPRISE EDITION</div>
                    <h3 class="text-xl font-bold text-white mb-3">Enterprise</h3>
                    <p class="text-gray-300 text-sm mb-4">Azure AI Foundry + Copilot Studio + HIPAA</p>
                    <div class="text-3xl font-bold text-cyan-400">$50-100<span class="text-sm text-gray-400">/user/mo</span></div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="text-center mt-16 text-gray-500 border-t border-[#00D9FF]/10 pt-8">
            <p class="text-sm">Built by <span class="text-[#00D9FF]">Julio Thorpe</span> | JABB Networks</p>
            <p class="text-xs mt-2">Version 1.0.0 — Sentinel Local Edition</p>
            <p class="text-xs mt-1">100% Free • 100% Private • 100% Yours</p>
        </div>
    </div>
</div>
