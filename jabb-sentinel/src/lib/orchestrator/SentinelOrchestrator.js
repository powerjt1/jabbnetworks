import { getAIProvider, getOpenCodeProvider } from '$lib/ai/factory.js';
import { SENTINEL_SYSTEM_PROMPT } from '$lib/ai/prompts.js';

/**
 * JABB Sentinel Orchestrator
 * The "Commander" — plans, delegates, validates, and reports
 *
 * Architecture:
 *   SENTINEL (Brain: Ollama/OpenAI/Claude)
 *       ↓
 *   OpenCode (Hands: autonomous coding)
 *       ↓
 *   GitHub/Render (Arms: deployment)
 */
export class SentinelOrchestrator {
    constructor() {
        this.brain = getAIProvider();       // Reasoning engine
        this.hands = getOpenCodeProvider(); // Execution engine
        this.name = 'SENTINEL';
        this.version = '1.0.0';
    }

    /**
     * Execute a complete development task end-to-end
     */
    async executeDevelopmentTask(task) {
        console.log(`\n🛡️  SENTINEL: Received task — "${task}"\n`);
        console.log(`📡 Orchestrator v${this.version} initializing...\n`);

        const executionLog = {
            taskId: this.generateTaskId(),
            task,
            startedAt: new Date().toISOString(),
            steps: []
        };

        try {
            // STEP 1: PLAN (Brain)
            console.log('🧠 [1/4] Planning mission parameters...');
            const plan = await this.plan(task);
            executionLog.steps.push({ phase: 'plan', result: plan });

            if (!plan.success) {
                throw new Error('Planning phase failed: ' + plan.error);
            }
            console.log(`✅ Plan created: ${plan.steps.length} tactical steps\n`);

            // STEP 2: EXECUTE (Hands)
            console.log('🔨 [2/4] Executing via OpenCode...');
            const executionResults = [];
            for (let i = 0; i < plan.steps.length; i++) {
                const step = plan.steps[i];
                console.log(`   → Step ${i + 1}/${plan.steps.length}: ${step.action}`);
                const result = await this.executeStep(step);
                executionResults.push(result);
                console.log(`   ✓ ${result.success ? 'Success' : 'Failed'}\n`);

                if (!result.success && step.critical) {
                    throw new Error(`Critical step failed: ${step.action}`);
                }
            }
            executionLog.steps.push({ phase: 'execute', result: executionResults });

            // STEP 3: VALIDATE (Brain)
            console.log('🔍 [3/4] Validating mission outcome...');
            const validation = await this.validate(task, executionResults);
            executionLog.steps.push({ phase: 'validate', result: validation });

            // STEP 4: REPORT
            console.log('📊 [4/4] Generating mission report...\n');
            executionLog.completedAt = new Date().toISOString();
            executionLog.status = validation.success ? 'SUCCESS' : 'PARTIAL';
            executionLog.validation = validation;

            return executionLog;
        } catch (error) {
            executionLog.status = 'FAILED';
            executionLog.error = error.message;
            executionLog.completedAt = new Date().toISOString();
            return executionLog;
        }
    }

    async plan(task) {
        const planningPrompt = `${SENTINEL_SYSTEM_PROMPT}

You are now in PLANNING MODE. Given this task: "${task}"

Create a step-by-step development plan. For each step:
- action: What OpenCode should do (natural language)
- type: "write-feature" | "fix-bug" | "refactor" | "generate-docs" | "run-tests"
- files: Array of files to focus on (if known)
- critical: Boolean — if false, can continue on failure

Respond ONLY in JSON:
{
  "steps": [
    {
      "action": "description",
      "type": "write-feature",
      "files": ["src/lib/example.js"],
      "critical": true
    }
  ]
}`;

        const result = await this.brain.analyze({ task }, planningPrompt);
        if (!result.success) return result;

        try {
            const jsonMatch = result.content.match(/\{[\s\S]*\}/);
            const plan = JSON.parse(jsonMatch ? jsonMatch[0] : result.content);
            return { success: true, steps: plan.steps };
        } catch (e) {
            return { success: false, error: 'Failed to parse plan: ' + e.message };
        }
    }

    async executeStep(step) {
        switch (step.type) {
            case 'write-feature':
                return this.hands.writeFeature(step.action, step.files || []);
            case 'fix-bug':
                return this.hands.fixBug(step.action);
            case 'refactor':
                return this.hands.refactorCode(step.files || [], step.action);
            case 'generate-docs':
                return this.hands.generateDocs(step.files || []);
            case 'run-tests':
                return this.hands.executeTask(step.action, { runTests: true });
            default:
                return this.hands.executeTask(step.action);
        }
    }

    async validate(task, results) {
        const validationPrompt = `${SENTINEL_SYSTEM_PROMPT}

You are now in VALIDATION MODE. Review these results:

Original task: "${task}"
Results: ${JSON.stringify(results.map(r => ({
    success: r.success,
    filesModified: r.filesModified,
    testsPassed: r.tests?.passed
})), null, 2)}

Respond in JSON:
{
  "success": boolean,
  "summary": "brief summary",
  "issues": ["remaining issues"],
  "nextSteps": ["suggested follow-ups"],
  "confidence": 0.0-1.0
}`;

        return this.brain.analyze({ task, results }, validationPrompt);
    }

    generateTaskId() {
        return `SENTINEL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
