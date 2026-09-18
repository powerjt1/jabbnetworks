# jabb-sentinel-enterprise — Power Platform edition

The governed, Dataverse-backed edition for regulated tenants. Ships as a Power Platform
**solution** (Power Apps + Power Automate) plus the Sentinel Backend API custom connector.

- `power-apps/` — Canvas/model-driven apps + Power Pages portal.
- `power-automate/` — Cloud flows (orchestration) and Desktop flows (RPA).
- `dataverse-schema.md` — the `sentinel_*` tables and relationships.

Deploy per **[../docs/enterprise.md](../docs/enterprise.md)** and **[../GoLive_v1.md](../GoLive_v1.md)**.
Identity via Managed Identity + Conditional Access; DLP blocks consumer AI; Purview labels PHI/PII.
