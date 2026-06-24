# KOKOS SKOOP — Real Ice Cream. Real Crypto. Real Value.

**KOKOS Ice Cream** is a beloved Nashville institution. Now it's also one of the first brick-and-mortar retail businesses in the world running a fully on-chain payment and loyalty system — live, in production, on Base.

This isn't a whitepaper. This is a working cash register connected to a blockchain.

---

## The Big Idea

Most loyalty programs give you points that expire, can't be traded, and are worth fractions of a cent. KOKOS flips that.

When you pay for ice cream with **SKOOP**, you earn more SKOOP back. That SKOOP lives in your wallet. It has a market price. It trades on Uniswap. And every purchase that uses SKOOP removes tokens from circulation permanently — burning them on-chain, forever.

The more people love KOKOS ice cream, the less SKOOP exists. The less SKOOP exists, the more each token is worth. Supporters of a real Nashville business get real economic upside — not airline miles.

This is tokenized loyalty with teeth.

---

## SKOOP Token

| Property | Value |
|---|---|
| Name | KOKOS SKOOP |
| Symbol | SKOOP |
| Chain | Base (Ethereum L2) |
| Contract | `0xfd3ce21c5acd8bbbe576d0e2336c210c3cebeb92` |
| Total Supply | 888,888,888 |
| Decimals | 6 |
| Tradeable | Yes — Uniswap V3 on Base |

---

## The Economic Flywheel

```
Customer buys ice cream with SKOOP
        ↓
Tokens held in escrow on-chain
        ↓
Business settles: tokens burned forever
        ↓
Circulating supply decreases
        ↓
Scarcity increases with every scoop sold
        ↓
Early supporters benefit from real demand
```

No staking APY. No emissions schedule. No artificial inflation. Just a small business selling ice cream and burning tokens every time they do.

---

## How a Purchase Works

KOKOS uses a custom signed payment intent system — the same cryptographic security model used in professional escrow protocols, built for a POS terminal.

1. **Cashier builds the order** on the KOKOS POS tablet — items, tax, total
2. **POS signs a payment intent** — a compact 206-byte payload cryptographically signed by the store's wallet, encoding the exact amount, receipt ID, cart hash, and expiry
3. **QR code is displayed** at checkout
4. **Customer scans** with the KOKOS Customer DApp on their phone
5. **Customer's wallet approves and pays** — one tap to approve SKOOP, one tap to confirm. The smart contract verifies the store's signature on-chain before accepting the payment.
6. **Funds are captured in escrow** — visible on-chain immediately, verifiable by anyone
7. **Batch settlement burns the tokens** — SKOOP payments are burned. USDC payments are settled to treasury.

Every step is on-chain. Every receipt is a blockchain transaction. Nothing is simulated.

---

## Customer Rewards

KOKOS automatically rewards customers for every purchase — no punch card, no app sign-up, no points that disappear.

| Payment Method | Reward |
|---|---|
| Pay with SKOOP | **10% back in SKOOP** (auto-sent instantly) |
| Pay with Square / Cash | **5% back in SKOOP** (sent by cashier) |

Rewards come from the **KOKOS Reward Vault** — a dedicated on-chain treasury funded by the project. There is a daily distribution cap of **888,888 SKOOP** to ensure the vault sustains long-term loyalty payouts.

These rewards aren't points. They're tokens. They trade. They can be held, sold, or saved to pay for the next scoop.

---

## Why This Matters

Crypto has promised real-world utility for years. KOKOS is actually doing it — no vaporware, no testnet demo, no "coming soon."

A customer in Nashville walks up to a window, orders a Trio, scans a QR, taps approve in their Coinbase Wallet, and the transaction is recorded permanently on Base. They walk away with ice cream and SKOOP in their wallet. The business burns tokens. The supply drops.

That's the loop. It runs today.

For the Nashville community: supporting KOKOS isn't just buying ice cream — it's participating in something genuinely new. Early holders of SKOOP benefit directly from the growth of a real local brand. As KOKOS expands, as more scoops are sold, as more tokens are burned, the economics favor those who showed up early.

---

## Tokenomics

| Allocation | Amount | % |
|---|---|---|
| Rewards Treasury | 311,111,111 | 35% |
| Liquidity | 177,777,777 | 20% |
| Treasury Reserve | 177,777,777 | 20% |
| Team (Vesting) | 133,333,333 | 15% |
| Marketing / Community | 88,888,890 | 10% |

**Total Supply: 888,888,888 SKOOP** — chosen intentionally. Every burn permanently reduces this number. There is no minting function.

---

## Team Vesting

The team allocation is locked in a vesting contract — no early dumps.

- **Cliff:** 90 days
- **Duration:** 2 years total
- **Release:** Linear after cliff

Contract: `0xDC91CF84B455602948Fed6cFd3D21c3EdA599bF3`

---

## The Technology Stack

Six custom frontends, all open source, all connected to the same on-chain contracts:

| App | Purpose |
|---|---|
| **POS** | Cashier tablet — builds orders, signs payment intents, generates QR codes, sends rewards |
| **Customer DApp** | Customer phone — scans QR, approves + pays in one flow, tracks rewards |
| **Reporting** | Owner dashboard — scans the chain for all captured payments, settlement controls, tokenomics overview |
| **Reward Vault Bank** | Vault management — monitors signer balances, tops up the reward distribution wallet |
| **SKOOP Info** | Public token page — price, supply, pool data |
| **Screensaver** | In-store display — live SKOOP price ticker |

All payment QR codes use a compact binary K2 format (206 bytes), cryptographically signed by the store's POS wallet, verified on-chain by the escrow contract before any funds move.

---

## Smart Contracts (Base Mainnet)

| Contract | Address |
|---|---|
| SKOOP Token | `0xfd3ce21c5acd8bbbe576d0e2336c210c3cebeb92` |
| Payment Escrow V2 | `0x4db1DA8719f2e51F016d5D54D1175C9f49749121` |
| Reward Vault | `0xAd2Ef0D447137454e6ED8D152414B491858D2EbE` |
| Treasury | `0x187b746aB9e369c01A540aE098dB29fb0c7AbcdA` |
| Team Vesting | `0xDC91CF84B455602948Fed6cFd3D21c3EdA599bF3` |
| USDC/SKOOP Pool | `0x64Ef20F32445EB0A86f4b97CA895fE508AF253CD` |
| ETH/SKOOP Pool | `0xc1d89ca13d5cbc24b92e9f40b36d43da347c5198` |

All contracts are on Base (Chain ID: 8453). Verify on [Basescan](https://basescan.org).

---

## Security Design

- **No transfer tax** — tokens move freely
- **No hidden minting** — supply can only decrease
- **Signed payment intents** — the escrow contract verifies the store's signature before accepting any payment; a forged QR cannot capture funds
- **Escrow model** — captured funds cannot be withdrawn arbitrarily; they can only be returned to the payer (void) or burned (settlement)
- **No admin withdrawal** — the escrow contract has no function to extract funds to an arbitrary address

---

## Get SKOOP

Trade SKOOP on Uniswap V3 on Base:

- USDC/SKOOP: `0x64Ef20F32445EB0A86f4b97CA895fE508AF253CD`
- ETH/SKOOP: `0xc1d89ca13d5cbc24b92e9f40b36d43da347c5198`

Or earn it by buying ice cream.

---

## KOKOS Ice Cream

Nashville, TN

> *The best ice cream in Nashville just became the most interesting crypto project in Nashville.*

---

*SKOOP is a utility token tied to a real-world business. It carries the same risks as any early-stage token and any small business. This is not financial advice. Buy ice cream responsibly.*
