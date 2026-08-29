# JABB Sentinel — Enterprise Edition (GRC · ALM · Managed Identity)

For regulated organizations (financial services, healthcare, public sector). Runs in **your**
Azure tenant and maps to the controls your security/GRC teams already speak. This is a
solution-architecture and control-mapping document, not a certification claim.

## Editions
| | Local | Business | Enterprise |
|---|---|---|---|
| Hosting | On-device / on-prem | JABB-hosted | Customer Azure tenant |
| AI | Free local (Ollama/OpenCode) | Managed cloud + local | Azure AI Foundry + governed local |
| Identity | Local passcode | SSO (OIDC) | Entra ID P2 (Managed Identity, CA, PIM) |
| Data | Local store | Dataverse (managed) | Dataverse + Purview + private networking |
| Governance | Self-managed | DLP baseline | Full GRC (DLP, Purview, Sentinel, audit) |
| Cost | $0/mo | $25–40/user/mo | $50–100/user/mo |

## Security & compliance (control mapping)
- **SOC 2 / ISO 27001 / NIST 800-53 & CSF** — Entra ID access control, ALM change management,
  Azure Monitor/Sentinel monitoring, Dataverse + Purview audit & classification.
- **PCI-DSS (TD Bank & financial services)** — segmentation via private endpoints, no
  cardholder data in prompts (DLP), strong auth (CA/PIM), logging, Key Vault/HSM key mgmt.
- **HIPAA / HITRUST (NMDP & healthcare)** — PHI under a Microsoft BAA, sensitivity labels +
  DLP for PHI, least privilege, encryption in transit/at rest, full audit for disclosures.

## Identity (Managed Identity first)
Workloads authenticate as themselves via **user-assigned Managed Identities** — no secrets in
apps/flows. **Conditional Access** on every human entry point; **PIM** for just-in-time
elevation; Dataverse security roles + Azure RBAC for defense in depth; quarterly access reviews.

## ALM
Managed Environments (Dev→Test→Prod), Solutions as the unit of deployment, Power Platform
Pipelines or Azure DevOps/GitHub Actions with approvals, Bicep/Terraform for the Azure
footprint, and a CoE toolkit for inventory and DLP posture. Source of truth in Git; every
change is a branch + PR (see `AGENTS.md`).

## Observability & BCDR
Azure Monitor/Log Analytics (KQL) + App Insights + Dataverse audit; Microsoft Sentinel SIEM/
SOAR. Dataverse geo-redundancy + long-term backup; documented RPO/RTO; IaC clean-room rebuild.

## Engagement
1) Discovery & control mapping → 2) Enterprise landing zone (IaC, Managed Environments, DLP,
Managed Identities) → 3) Pilot one governed workflow end-to-end with full audit → 4) Scale via
CoE, pipelines, access reviews. Contact: info@jabbnetworks.com.
