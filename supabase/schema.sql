-- JABB Networks schema
-- Apply with: psql "$DATABASE_URL" -f supabase/schema.sql
-- or paste into the Supabase SQL editor.

create type user_role as enum ('client', 'freelancer');
create type job_status as enum ('draft', 'open', 'in_review', 'awarded', 'closed');
create type proposal_status as enum ('submitted', 'shortlisted', 'accepted', 'declined', 'withdrawn');
create type contract_status as enum ('active', 'paused', 'completed', 'cancelled');
create type milestone_status as enum ('pending', 'active', 'submitted', 'approved', 'paid');
create type budget_type as enum ('fixed', 'hourly');
create type experience_level as enum ('entry', 'intermediate', 'expert');
create type availability_status as enum ('available', 'limited', 'booked');

-- Profiles extend auth.users rather than replacing it.
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role user_role not null default 'freelancer',
  name text not null,
  title text not null default '',
  company text,
  location text default '',
  timezone text default 'UTC',
  bio text default '',
  skills text[] not null default '{}',
  hourly_rate numeric(10, 2),
  rating numeric(2, 1) default 0,
  review_count int default 0,
  jobs_completed int default 0,
  success_rate int default 0,
  verified boolean default false,
  availability availability_status default 'available',
  certifications text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles on delete cascade,
  title text not null,
  summary text not null default '',
  scope text not null default '',
  status job_status not null default 'open',
  skills text[] not null default '{}',
  budget_type budget_type not null default 'fixed',
  budget_min numeric(12, 2) not null default 0,
  budget_max numeric(12, 2) not null default 0,
  experience_level experience_level not null default 'expert',
  estimated_duration text default '',
  environments text[] not null default '{}',
  due_date date,
  featured boolean default false,
  created_at timestamptz not null default now()
);

create index jobs_status_created_idx on jobs (status, created_at desc);
create index jobs_skills_idx on jobs using gin (skills);

create table proposals (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs on delete cascade,
  freelancer_id uuid not null references profiles on delete cascade,
  status proposal_status not null default 'submitted',
  cover_letter text not null default '',
  bid_amount numeric(12, 2) not null default 0,
  budget_type budget_type not null default 'fixed',
  estimated_duration text default '',
  created_at timestamptz not null default now(),
  unique (job_id, freelancer_id)
);

create table contracts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs on delete cascade,
  client_id uuid not null references profiles on delete cascade,
  freelancer_id uuid not null references profiles on delete cascade,
  status contract_status not null default 'active',
  total_value numeric(12, 2) not null default 0,
  paid_to_date numeric(12, 2) not null default 0,
  started_at date not null default current_date,
  due_date date,
  created_at timestamptz not null default now()
);

-- Milestones hang off a job (the client's plan), a proposal (the
-- freelancer's counter-plan) or a contract (the agreed plan).
create table milestones (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs on delete cascade,
  proposal_id uuid references proposals on delete cascade,
  contract_id uuid references contracts on delete cascade,
  title text not null,
  description text default '',
  amount numeric(12, 2) not null default 0,
  due_date date,
  status milestone_status not null default 'pending',
  deliverables text[] not null default '{}',
  position int not null default 0,
  created_at timestamptz not null default now(),
  constraint milestone_has_parent check (
    num_nonnulls(job_id, proposal_id, contract_id) = 1
  )
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs on delete set null,
  subject text not null default '',
  created_at timestamptz not null default now()
);

create table conversation_participants (
  conversation_id uuid not null references conversations on delete cascade,
  profile_id uuid not null references profiles on delete cascade,
  last_read_at timestamptz,
  primary key (conversation_id, profile_id)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations on delete cascade,
  sender_id uuid not null references profiles on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index messages_conversation_idx on messages (conversation_id, created_at);

create table attachments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs on delete cascade,
  proposal_id uuid references proposals on delete cascade,
  message_id uuid references messages on delete cascade,
  uploaded_by uuid not null references profiles on delete cascade,
  name text not null,
  size_bytes bigint not null default 0,
  kind text not null default 'other',
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- Notes are private to their author.
create table notes (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null,
  author_id uuid not null references profiles on delete cascade,
  body text not null,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create index notes_entity_author_idx on notes (entity_id, author_id);

-- Row level security ------------------------------------------------------

alter table profiles enable row level security;
alter table jobs enable row level security;
alter table proposals enable row level security;
alter table contracts enable row level security;
alter table milestones enable row level security;
alter table conversations enable row level security;
alter table conversation_participants enable row level security;
alter table messages enable row level security;
alter table attachments enable row level security;
alter table notes enable row level security;

create policy "profiles are readable by everyone"
  on profiles for select using (true);
create policy "you may edit your own profile"
  on profiles for update using (auth.uid() = id);
create policy "you may create your own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "open jobs are readable by everyone"
  on jobs for select using (status <> 'draft' or client_id = auth.uid());
create policy "clients manage their own jobs"
  on jobs for all using (client_id = auth.uid()) with check (client_id = auth.uid());

-- A proposal is visible to its author and to the client who owns the job.
create policy "proposals visible to author and job owner"
  on proposals for select using (
    freelancer_id = auth.uid()
    or exists (
      select 1 from jobs
      where jobs.id = proposals.job_id and jobs.client_id = auth.uid()
    )
  );
create policy "freelancers manage their own proposals"
  on proposals for all using (freelancer_id = auth.uid())
  with check (freelancer_id = auth.uid());

create policy "contracts visible to both parties"
  on contracts for select using (
    client_id = auth.uid() or freelancer_id = auth.uid()
  );

create policy "milestones follow their parent"
  on milestones for select using (
    exists (select 1 from jobs j where j.id = milestones.job_id)
    or exists (
      select 1 from proposals p
      where p.id = milestones.proposal_id and p.freelancer_id = auth.uid()
    )
    or exists (
      select 1 from contracts c
      where c.id = milestones.contract_id
        and (c.client_id = auth.uid() or c.freelancer_id = auth.uid())
    )
  );

create policy "conversations visible to participants"
  on conversations for select using (
    exists (
      select 1 from conversation_participants cp
      where cp.conversation_id = conversations.id and cp.profile_id = auth.uid()
    )
  );

create policy "participants see their own rows"
  on conversation_participants for select using (profile_id = auth.uid());

create policy "messages visible to participants"
  on messages for select using (
    exists (
      select 1 from conversation_participants cp
      where cp.conversation_id = messages.conversation_id
        and cp.profile_id = auth.uid()
    )
  );
create policy "participants may send messages"
  on messages for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from conversation_participants cp
      where cp.conversation_id = messages.conversation_id
        and cp.profile_id = auth.uid()
    )
  );

create policy "attachments readable by uploader"
  on attachments for select using (uploaded_by = auth.uid());
create policy "you may upload attachments"
  on attachments for insert with check (uploaded_by = auth.uid());

create policy "notes are private to their author"
  on notes for all using (author_id = auth.uid())
  with check (author_id = auth.uid());

-- Payments ----------------------------------------------------------------

create type escrow_status as enum (
  'unfunded', 'funding', 'funded', 'releasing', 'released', 'refunded', 'failed'
);
create type funding_method as enum ('ach', 'card');
create type payout_rail as enum ('stripe', 'paypal');
create type connect_status as enum ('not_started', 'onboarding', 'restricted', 'active');

-- Where the freelancer's money goes. Stripe Connect holds their identity and
-- tax details, not this database.
create table payout_accounts (
  profile_id uuid primary key references profiles on delete cascade,
  rail payout_rail not null default 'stripe',
  status connect_status not null default 'not_started',
  stripe_account_id text unique,
  paypal_email text,
  payouts_enabled boolean not null default false,
  requirements_due text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- Linked via Plaid. Account and routing numbers are deliberately absent: Plaid
-- hands Stripe a processor token and neither number ever reaches this table.
create table bank_accounts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles on delete cascade,
  institution text not null,
  last4 text not null check (length(last4) = 4),
  account_type text not null default 'checking',
  stripe_payment_method_id text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- One row per milestone. This is the system of record for held money, so it
-- carries the uniqueness constraint that stops a milestone being funded twice.
create table escrows (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null unique references milestones on delete cascade,
  contract_id uuid not null references contracts on delete cascade,
  status escrow_status not null default 'unfunded',
  amount_cents bigint not null check (amount_cents > 0),
  funding_method funding_method not null default 'ach',
  payout_rail payout_rail not null default 'stripe',
  stripe_payment_intent_id text unique,
  stripe_transfer_id text unique,
  paypal_payout_batch_id text unique,
  failure_reason text,
  funded_at timestamptz,
  released_at timestamptz,
  created_at timestamptz not null default now()
);

create index escrows_contract_idx on escrows (contract_id, status);

-- Append-only ledger. Never update a row here; correct with a compensating
-- entry so the history of what moved stays intact for reconciliation.
create table transactions (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references contracts on delete cascade,
  milestone_id uuid references milestones on delete set null,
  kind text not null check (kind in ('funding', 'release', 'refund', 'fee')),
  amount_cents bigint not null,
  fee_cents bigint not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'settled', 'failed')),
  method text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  settled_at timestamptz
);

create index transactions_contract_idx on transactions (contract_id, created_at desc);

-- Stripe retries webhooks, and the same event will arrive more than once.
-- Inserting the event id first makes handlers idempotent.
create table processed_webhook_events (
  id text primary key,
  provider text not null default 'stripe',
  processed_at timestamptz not null default now()
);

alter table payout_accounts enable row level security;
alter table bank_accounts enable row level security;
alter table escrows enable row level security;
alter table transactions enable row level security;

create policy "you see your own payout account"
  on payout_accounts for select using (profile_id = auth.uid());

create policy "you see your own bank accounts"
  on bank_accounts for all using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Escrow is readable by both sides of the contract but writable by neither:
-- only the service role, acting from a webhook or a route handler, moves money.
create policy "escrow visible to both parties"
  on escrows for select using (
    exists (
      select 1 from contracts c
      where c.id = escrows.contract_id
        and (c.client_id = auth.uid() or c.freelancer_id = auth.uid())
    )
  );

create policy "transactions visible to both parties"
  on transactions for select using (
    exists (
      select 1 from contracts c
      where c.id = transactions.contract_id
        and (c.client_id = auth.uid() or c.freelancer_id = auth.uid())
    )
  );
