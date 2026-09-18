# Dataverse schema (solution: JABB Sentinel)

Publisher prefix: `sentinel`.

| Table | Purpose | Key columns |
|---|---|---|
| `sentinel_Agent` | Crew agents (JARVIS→Sentinel, Scout, Architect, Ops, Notebook, Workspace, Legacy) | name, role, model, tools, avatar, vip |
| `sentinel_CrewMember` | Human ↔ agent assignments & permissions | user, agent, role |
| `sentinel_Mission` | A unit of work (task/mission) with status & outcome | task, status, startedAt, completedAt, confidence |
| `sentinel_CommBridge` | Conversation transcripts across channels (Teams/Portal/App) | mission, channel, role, content, ts |
| `sentinel_TelemetryLog` | Operational + security telemetry (feeds Azure Monitor/Sentinel) | mission, agent, event, level, ts |

Security: row-level + field-level security; audit enabled on all tables; column encryption for
sensitive fields; sensitivity labels applied via Purview. Custom connector: **Sentinel Backend API**.
