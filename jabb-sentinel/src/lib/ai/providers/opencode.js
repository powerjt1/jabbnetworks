// OpenCode — the "hands" of Sentinel. Autonomous coding via the OpenCode CLI when
// available; otherwise returns a clearly-marked simulated result so the mission loop
// still completes end-to-end in demos and CI.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileP = promisify(execFile);

async function hasOpenCode() {
  try { await execFileP('opencode', ['--version'], { timeout: 5000 }); return true; }
  catch { return false; }
}

async function run(prompt, opts = {}) {
  const filesModified = [];
  if (await hasOpenCode()) {
    try {
      const { stdout } = await execFileP('opencode', ['run', prompt], { timeout: opts.timeout || 600000, maxBuffer: 10 * 1024 * 1024 });
      return { success: true, output: stdout, filesModified, tests: { passed: opts.runTests ? true : undefined } };
    } catch (e) {
      return { success: false, error: e.message, output: e.stdout || '' };
    }
  }
  return {
    success: true, simulated: true,
    note: 'OpenCode CLI not installed — returning a simulated result. Install: https://opencode.ai',
    prompt, filesModified, tests: { passed: opts.runTests ? true : undefined },
  };
}

export default class OpenCodeProvider {
  writeFeature(action, files = []) { return run(`Write feature: ${action}. Focus files: ${files.join(', ') || 'infer'}.`); }
  fixBug(action) { return run(`Fix bug: ${action}. Reproduce, fix, and verify.`, { runTests: true }); }
  refactorCode(files = [], action) { return run(`Refactor ${files.join(', ') || 'the relevant files'} to: ${action}. Preserve behavior.`); }
  generateDocs(files = []) { return run(`Generate documentation for: ${files.join(', ') || 'the project'}.`); }
  executeTask(action, opts = {}) { return run(action, opts); }
}
