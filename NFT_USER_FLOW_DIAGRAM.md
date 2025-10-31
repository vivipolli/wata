# NFT Certificate User Flow - Visual Diagram

## Complete Producer NFT Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PAYMENT EXECUTION (Backend)                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
            ┌───────────────────────────────────────┐
            │  Oracle verifies water quality data   │
            │  Payment threshold met                │
            └───────────────────────────────────────┘
                                    │
                                    ▼
            ┌───────────────────────────────────────┐
            │  HBAR Payment executed via Relayer    │
            └───────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DUAL NFT MINTING (Automatic)                      │
│  ┌─────────────────────────┐    ┌─────────────────────────┐        │
│  │   Producer NFT           │    │   Investor NFT          │        │
│  │   • Environmental data   │    │   • Financial data      │        │
│  │   • Quality score        │    │   • Impact metrics      │        │
│  │   • Agreement info       │    │   • Aggregated data     │        │
│  └─────────────────────────┘    └─────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
            ┌───────────────────────────────────────┐
            │  Check Producer Token Association     │
            └───────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌───────────────────┐         ┌───────────────────────┐
        │   ASSOCIATED ✅    │         │   NOT ASSOCIATED ❌    │
        └───────────────────┘         └───────────────────────┘
                    │                               │
                    ▼                               ▼
    ┌──────────────────────────┐      ┌──────────────────────────┐
    │ Automatic Transfer       │      │ NFT stays in Treasury    │
    │ NFT → Producer Wallet    │      │ producerNftTransferred   │
    │ producerNftTransferred   │      │ = false                  │
    │ = true                   │      └──────────────────────────┘
    └──────────────────────────┘                    │
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND DISPLAY (Payments.tsx)                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌───────────────────────┐       ┌───────────────────────┐
        │  NFT RECEIVED ✅       │       │  NFT AVAILABLE ⏳      │
        │  Status: Transferred  │       │  Status: Pending      │
        └───────────────────────┘       └───────────────────────┘
                    │                               │
                    ▼                               ▼
        ┌───────────────────────┐       ┌───────────────────────┐
        │ [View Certificate]    │       │ Check Association     │
        │ [Hedera Explorer]     │       │ Status                │
        └───────────────────────┘       └───────────────────────┘
                                                    │
                                    ┌───────────────┴───────────────┐
                                    │                               │
                                    ▼                               ▼
                        ┌───────────────────┐         ┌───────────────────┐
                        │  ASSOCIATED ✅     │         │  NOT ASSOCIATED   │
                        │  (edge case)      │         │  (typical)        │
                        └───────────────────┘         └───────────────────┘
                                    │                               │
                                    ▼                               ▼
                    ┌────────────────────────────┐   ┌──────────────────────────┐
                    │ [Receive Certificate Now]  │   │ [Associate Token]        │
                    │ 🎁 READY TO CLAIM          │   │ 🔗 STEP 1                │
                    └────────────────────────────┘   └──────────────────────────┘
                                    │                               │
                                    │                               ▼
                                    │               ┌──────────────────────────┐
                                    │               │ TokenAssociationModal    │
                                    │               │ • Explanation            │
                                    │               │ • Cost: ~$0.05           │
                                    │               │ • [Associate Token]      │
                                    │               └──────────────────────────┘
                                    │                               │
                                    │                               ▼
                                    │               ┌──────────────────────────┐
                                    │               │ Sign with Wallet         │
                                    │               │ (HashConnect)            │
                                    │               └──────────────────────────┘
                                    │                               │
                                    │                               ▼
                                    │               ┌──────────────────────────┐
                                    │               │ Association Complete ✅   │
                                    │               │ Button updates to:       │
                                    │               │ [Receive Certificate]    │
                                    │               └──────────────────────────┘
                                    │                               │
                                    └───────────────┬───────────────┘
                                                    ▼
                                    ┌──────────────────────────────┐
                                    │ User Clicks                  │
                                    │ "Receive Certificate Now"    │
                                    └──────────────────────────────┘
                                                    │
                                                    ▼
                                    ┌──────────────────────────────┐
                                    │ Frontend calls:              │
                                    │ POST /api/nft/claim/{serial} │
                                    └──────────────────────────────┘
                                                    │
                                                    ▼
                                    ┌──────────────────────────────┐
                                    │ Backend:                     │
                                    │ 1. Validates request         │
                                    │ 2. Checks association        │
                                    │ 3. Transfers NFT             │
                                    │ 4. Updates DB                │
                                    └──────────────────────────────┘
                                                    │
                                                    ▼
                                    ┌──────────────────────────────┐
                                    │ NFT RECEIVED ✅               │
                                    │ producerNftTransferred=true  │
                                    └──────────────────────────────┘
                                                    │
                                                    ▼
                        ┌───────────────────────────────────────┐
                        │  FINAL STATE                          │
                        │  ┌─────────────────────────────────┐  │
                        │  │ ✅ NFT Received                 │  │
                        │  │ [View Certificate]              │  │
                        │  │ [View on Hedera Explorer]       │  │
                        │  └─────────────────────────────────┘  │
                        └───────────────────────────────────────┘
                                                    │
                                    ┌───────────────┴───────────────┐
                                    │                               │
                                    ▼                               ▼
                        ┌───────────────────┐         ┌───────────────────┐
                        │ View Certificate  │         │ Hedera Explorer   │
                        │ (Details Modal)   │         │ (HashScan)        │
                        └───────────────────┘         └───────────────────┘
                                    │                               │
                                    ▼                               ▼
                    ┌────────────────────────────┐   ┌──────────────────────┐
                    │ NFTDetailsModal            │   │ https://hashscan.io/ │
                    │ • Certificate Design       │   │ testnet/token/       │
                    │ • Token ID & Serial        │   │ {tokenId}/{serial}   │
                    │ • Payment & Score          │   └──────────────────────┘
                    │ • Agreement Details        │
                    │ • Mint Transaction         │
                    │ • Transfer Transaction     │
                    │ • [View Metadata (IPFS)]   │
                    │ • [View on HashScan]       │
                    └────────────────────────────┘
```

## Component Hierarchy

```
Payments.tsx
    │
    └─── Payment Card (for each completed payment with NFT)
            │
            └─── NFTCertificateButton
                    ├─── Checking State (loading)
                    ├─── None State (no NFT yet)
                    ├─── Pending State (need association)
                    │       └─── TokenAssociationModal
                    │               └─── Wallet Integration (sign tx)
                    ├─── Ready State (associated, not claimed)
                    │       └─── Claim API Call
                    └─── Received State (transferred)
                            └─── NFTDetailsModal
                                    └─── Certificate Display
```

## API Flow

```
Frontend                          Backend                     Hedera Network
   │                                 │                              │
   │──GET /api/nft/check-assoc───────▶                              │
   │                                 │──AccountInfoQuery────────────▶
   │                                 │◀─────tokens list──────────────│
   │◀─────{isAssociated: false}──────│                              │
   │                                 │                              │
   │ User clicks "Associate Token"   │                              │
   │──TokenAssociateTransaction──────┼─────────────────────────────▶
   │◀────Transaction Receipt─────────┼──────────────────────────────│
   │                                 │                              │
   │──POST /api/nft/claim/{serial}───▶                              │
   │                                 │──Check Association───────────▶
   │                                 │◀─────true─────────────────────│
   │                                 │──TransferTransaction─────────▶
   │                                 │◀─────Receipt──────────────────│
   │                                 │──Update DB                   │
   │◀─────{success: true}────────────│                              │
   │                                 │                              │
   │──Refresh payment list───────────▶                              │
   │◀─────Updated payment───────────│                              │
   │  (producerNftTransferred=true)  │                              │
```

## State Machine

```
                    ┌──────────┐
                    │  NONE    │
                    │ (no NFT) │
                    └──────────┘
                          │
                          │ NFT minted
                          ▼
    ┌────────────────────────────────────────┐
    │              CHECKING                   │
    │       (verifying association)           │
    └────────────────────────────────────────┘
                          │
            ┌─────────────┼─────────────┐
            │                           │
            ▼                           ▼
    ┌──────────────┐            ┌──────────────┐
    │   PENDING    │            │   RECEIVED   │
    │ (not assoc)  │            │ (transferred)│
    └──────────────┘            └──────────────┘
            │                           ▲
            │ user associates           │
            ▼                           │
    ┌──────────────┐                   │
    │    READY     │                   │
    │ (associated) │                   │
    └──────────────┘                   │
            │                           │
            │ user claims               │
            └───────────────────────────┘

State Transitions:
• NONE → CHECKING: Payment completed with NFT
• CHECKING → PENDING: Association check returns false
• CHECKING → RECEIVED: Already transferred (edge case)
• PENDING → READY: User successfully associates token
• READY → RECEIVED: User successfully claims NFT
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────┐
│              ERROR SCENARIOS                         │
└─────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐  ┌──────────────┐  ┌──────────────┐
│ User Rejects  │  │ Insufficient │  │ Network      │
│ Transaction   │  │ Balance      │  │ Error        │
└───────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ▼
            ┌──────────────────────────┐
            │  Display Error Message   │
            │  • Clear, user-friendly  │
            │  • Actionable advice     │
            │  • Retry option          │
            └──────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  Log Error to Console    │
            │  (for debugging)         │
            └──────────────────────────┘
```

## Security Flow

```
┌────────────────────────────────────────────────────┐
│           SECURITY CONSIDERATIONS                   │
└────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Ownership    │  │ Association  │  │ Rate         │
│ Verification │  │ Verification │  │ Limiting     │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        │                 │                 │
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Only producer│  │ Must be      │  │ Prevent      │
│ who earned   │  │ associated   │  │ spam claims  │
│ NFT can      │  │ before       │  │ & attacks    │
│ claim it     │  │ transfer     │  └──────────────┘
└──────────────┘  └──────────────┘
        │                 │
        └────────┬────────┘
                 ▼
    ┌──────────────────────┐
    │ Database Validation  │
    │ • Check payment      │
    │ • Check serial       │
    │ • Check status       │
    └──────────────────────┘
                 │
                 ▼
    ┌──────────────────────┐
    │ Transfer NFT         │
    │ • Treasury → User    │
    │ • Update DB          │
    │ • Return TxID        │
    └──────────────────────┘
```

---

**Legend:**
- ✅ Success state
- ⏳ Pending/waiting state
- ❌ Error/blocked state
- 🔗 Action required
- 🎁 Ready for action
- ▶ API call
- ◀ API response

This flow ensures a smooth, secure, and user-friendly experience for producers to claim their environmental NFT certificates!

