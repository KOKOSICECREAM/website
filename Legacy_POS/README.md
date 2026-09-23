# Legacy POS — old protocol, new token

A copy of the working POS and Customer dapp wired to the **new SKOOP token**, so the
original (non-PunchCard) protocol can keep running while the PunchCard network contracts
roll out separately.

Nothing here touches the live build. `/POS/`, `/Customer_dapp/` and `/Reporting/` at the
repo root are untouched and still run the old token.

| | old (live, untouched) | this folder |
|---|---|---|
| token | `0xfd3ce21c…` KOKOS SKOOPS, 888,888,888 supply | `0xBa147713adF122A8Fc224e52Cb431D7919831939` SKOOP PunchCard, 100,000,000 supply |
| escrow | `0x4db1DA87…` | **not deployed yet** |
| pools | USDC/3000 + WETH/3000 | **none exist yet** |

Both tokens are 6 decimals and symbol `SKOOP`, so no amount-handling changed.

## This build cannot take payments yet

It ships with the escrow and pool addresses set to `0x000…0`. A guard at the top of each
file detects that, shows a red banner, and blocks the checkout path. That is deliberate —
without it the register would try to capture a payment against the zero address and fail
somewhere inside the customer's wallet, mid-sale.

Fill in the two addresses in each file and the banner disappears on its own.

## What has to be redeployed

Verified on-chain, not just read from source — both contracts store the token as
`immutable`, so the address cannot be changed after deploy:

```
Escrow V3   0x4db1DA87…  skoopToken -> 0xfd3ce21c…  (immutable)
Treasury V3 0x187b746a…  skoopToken -> 0xfd3ce21c…  (immutable)
```

**Must redeploy**

1. **`KOKOSPaymentEscrowV3`** — required. Every POS payment goes through it.
   `constructor(skoopToken_, usdcToken_, initialSigner_, treasury_)`
2. **`KOKOSTreasuryV3`** — required only if you want USDC settlements to auto burn/LP.
   `constructor(skoopToken_, usdcToken_, swapRouter_, positionManager_)`
   The escrow constructor takes a treasury address, so **deploy the treasury first**.
   Reusing the old treasury technically works (it only receives USDC) but its
   `swapAndBurn` would buy and burn the *old* token.

**Does not need redeploying**

- **Rewards vault** — the POS does not use one. `autoSendReward()` is a plain
  `token.transfer()` from the connected signer wallet, so rewards work as soon as that
  wallet holds the new token.
- **USDC, WETH, Uniswap router / quoter / factory / position manager** — all external and
  token-agnostic.

**Not a contract, but required before this build works**

- **A Uniswap V3 pool for the new token.** There is currently none at any fee tier against
  USDC or WETH. Without it: no price quote, so the dapp cannot buy SKOOP, the POS price
  pill is blank, and — because the reward amount is derived from `skoopPriceUSD` — the POS
  refuses SKOOP checkouts outright with "Waiting for SKOOP price…". Seed the pool at the
  same 3000 fee tier the old pools use.

## Deploy inputs (verified against the live contracts)

Only the **new token CA is needed to deploy**. Neither constructor takes or touches a
pool — the escrow never mentions one, and the treasury only uses `poolFee` (mutable,
default 3000) at settle time. Pools are a *runtime* dependency, not a deploy dependency.

```
KOKOSTreasuryV3(skoopToken_, usdcToken_, swapRouter_, positionManager_)
  skoopToken_       0xBa147713adF122A8Fc224e52Cb431D7919831939
  usdcToken_        0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
  swapRouter_       0x2626664c2603336E57B271c5C0b26F421741e481
  positionManager_  0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1   <-- NOT the live value

KOKOSPaymentEscrowV3(skoopToken_, usdcToken_, initialSigner_, treasury_)
  skoopToken_       0xBa147713adF122A8Fc224e52Cb431D7919831939
  usdcToken_        0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
  initialSigner_    0x4eCc3f03c018208Ae5932eAB91bbD82F37F56D9B   (current POS signer)
  treasury_         <address of the treasury deployed in step 2>
```

### Do not copy the live treasury's positionManager

The deployed treasury at `0x187b746a…` holds
`positionManager = 0x03a520b32c04BF3BeEF7beB72E919cF822ed34F2`, and **that address has no
code on Base**. The real Uniswap V3 `NonfungiblePositionManager` is the `…34f1` above —
verified: 24,384 bytes, `name() = "Uniswap V3 Positions NFT-V1"`, factory matches the V3
factory. The two differ only in the last character.

Because `positionManager` is `immutable`, the live treasury's LP path can never work:
`settle()` splits 60/40, and the 40% branch calls `positionManager.mint(...)` on a
codeless address, which reverts the whole transaction. On-chain state agrees —
`totalUSDCDeployed = 0`, `totalSkoopBurned = 0`, `lpPositionId = 0`: `settle()` has never
completed. The existing treasury can still burn-only if the owner calls
`setSplit(10000, 0)`, which skips the LP branch.

Use the `…34f1` address for the new deployment and this is simply fixed.

## The local sources match what is deployed

Checked against the verified source on Basescan, not assumed. Comments, imports, pragma
and whitespace normalised, then hashed:

```
KOKOSPaymentEscrowV3  local == deployed 0x4db1DA87…   sha256 557324d3fd97db04…
KOKOSTreasuryV3       local == deployed 0x187b746a…   sha256 566d99c9b88e533f…
```

So redeploying from `~/KOKOS/BASE contracts/` reproduces current production behaviour
exactly. The 2026-09-20 edit to `KOKOSTreasuryV3.sol` was the header comment correcting
the `positionManager` address — comment-only, no code change, which is why the normalised
hashes still match.

**Compiler settings to reproduce and verify:** `v0.8.24+commit.e11b9ed9`, optimizer
**enabled**, **200 runs**.

A local `forge build` will not produce byte-identical bytecode, and that is expected: the
deployed artifacts were flattened with mixed OpenZeppelin versions (5.0.0, 5.0.1, 5.1.0,
5.3.0, 5.4.0, 5.5.0, 5.6.0 all appear inline), whereas a clean `forge install` pins one
version. Same source, different dependency snapshot — it changes bytecode, not behaviour.

## Checklist to go live

1. Deploy `KOKOSTreasuryV3` (args above). Needs only the token CA — no pool required.
2. Deploy `KOKOSPaymentEscrowV3` with that treasury address.
3. Create the USDC/SKOOP pool (fee 3000) for the new token and seed liquidity. Required
   before the apps can price anything, and before the treasury's `settle()` can swap.
4. Put those addresses into **both** files (`BRAND.escrowContract` / `BRAND.skoopPool` in
   the POS, `CFG.ESCROW` / `POOL_*` in the dapp). The banner clears itself.
5. Fund the POS signer wallet with the new token so rewards can send.
6. Take one small live payment end to end before using it in the shop.

## Notes on the copy

- **The POS QR was re-pointed** to `/Legacy_POS/Customer_dapp/`. Left as-is it sent
  customers to the live dapp, which talks to the old token and old escrow — they would
  have paid the wrong contract.
- **No service worker here, on purpose.** The live dapp's `sw.js` deletes every cache that
  is not its own on activate, so a second SW on this origin would fight it and each would
  evict the other's app shell. A legacy build also wants to be always-fresh rather than
  installable over the real dapp.
- Manifests are scoped to `/Legacy_POS/…` with distinct names, and both pages are
  `noindex`, so this cannot install over or outrank the live apps.
- `Reporting/` was not copied. It reads the escrow by address; once the new escrow exists,
  point a copy at it if you want settlement reporting for this token.
