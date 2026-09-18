# Handling TINs

A W-9 carries a Social Security Number or an EIN. That makes this the most
sensitive data the platform touches — more so than payment details, because a
card can be reissued and an SSN cannot.

## Rules this module holds to

**The application never stores a full TIN.** `TaxForm` carries `tinLast4` and
nothing more. The full number goes straight to the verification provider and is
not persisted here in any form, encrypted or otherwise. Data you do not hold
cannot leak.

**The full TIN never touches a log.** Not in request logging, not in error
messages, not in analytics. The submit route reads it from the request body,
forwards it, and lets it fall out of scope.

**It never crosses the wire unencrypted**, and never appears in a URL, a query
string or a `GET`.

**It is never returned to the browser.** Once submitted, the payee sees
`•••-••-1234` and nothing else. There is no endpoint that reads a TIN back.

## What that means in practice

Verification and filing belong with a provider that is built for it. Reasonable
options:

- **Stripe Tax / Connect** — already in use for the Stripe payout rail, and
  already filing those 1099s. Nothing to add.
- **Track1099, Tax1099 or Avalara 1099** — take a W-9, run IRS TIN matching,
  e-file the 1099-NEC and post the recipient copy.
- **Intuit / QuickBooks** — its own 1099 wizard can file from vendor payment
  totals, if the platform is the payer of record for those payments.

The submit route in `app/api/tax/w9/route.ts` marks the forwarding seam
explicitly. It deliberately does not write the TIN anywhere, and that is not an
oversight to be fixed later.

## If you decide to store it anyway

Sometimes there is a real reason. If so, at minimum:

- Encrypt at rest with a key held in a KMS, not in the database and not in an
  environment variable next to the connection string
- Restrict decryption to one narrow service role, and log every decryption with
  who and why
- Set a retention period and actually delete — four years after the last filing
  is the usual figure, but confirm it
- Treat the table as in-scope for breach notification in every jurisdiction
  your payees live in

That is a meaningful operational burden, which is the argument for not holding
the data in the first place.

## Not tax advice

Thresholds, form types and filing deadlines are encoded here for the mechanics
to work. They change with legislation — the 1099-NEC threshold moved from $600
to $2,000 for payments after 31 December 2025 — and the liability for getting
them wrong sits with the filer. Have an accountant confirm the model before you
file anything.
