<script>
  import { goto } from '$app/navigation';
  // The full JARVIS/Sentinel Mission Control ships as a self-contained page in /static.
  // We embed it here so /dashboard is the operational cockpit inside the SvelteKit app.
</script>

<div class="min-h-screen bg-[#0B1426] flex flex-col">
  <div class="flex items-center gap-3 px-4 py-2 border-b border-[#00D9FF]/20 text-white">
    <button on:click={() => goto('/')} class="text-[#00D9FF] text-sm hover:underline">← Home</button>
    <span class="font-bold tracking-wide">🛡️ SENTINEL · Mission Control</span>
    <a href="/mission-control.html" target="_blank" rel="noopener" class="ml-auto text-xs text-gray-400 hover:text-white">Open full screen ↗</a>
  </div>
  <iframe title="Sentinel Mission Control" src="/mission-control.html" class="w-full flex-1" style="border:0;min-height:calc(100vh - 41px)"></iframe>
</div>
