# Dual NFT Certificate Implementation Summary

## Overview
Successfully implemented a dual NFT certificate system where each payment generates two soulbound NFTs:
1. **Producer NFT** - Contains environmental data (water quality metrics)
2. **Investor NFT** - Contains financial and impact data

Both NFTs share the same audit hash ensuring traceability and authenticity.

## Changes Made

### 1. Database Schema (✅ Completed)
**File:** `backend/prisma/schema.prisma`

Added 4 new fields to the `payments` model:
- `investor_nft_token_id` (String?)
- `investor_nft_serial` (Int?)
- `investor_nft_transaction_id` (String?)
- `investor_nft_metadata_uri` (String?)

Migration created: `20251030164824_add_investor_nft_fields`

### 2. Type Definitions (✅ Completed)
**File:** `backend/src/types/index.ts`

Updated `Payment` interface to include investor NFT fields.

### 3. NFT Service Extension (✅ Completed)
**File:** `backend/src/services/nft.ts`

#### New Interfaces:
- `MintDualCertificatesParams` - Extends MintCertificateParams with investor address and batch data
- `DualCertificateResult` - Contains both producer and investor NFT results

#### New Methods:
- `mintDualCertificates()` - Main method that mints both NFTs
- `buildProducerMetadata()` - Creates metadata focused on environmental data
- `buildInvestorMetadata()` - Creates metadata focused on financial impact
- `mintSingleCertificate()` - Private helper method for minting individual NFTs

#### Metadata Attributes:

**Producer NFT:**
- Certificate Type: "Producer - Environmental"
- Quality Score
- Payment Received
- Readings Count
- Average Turbidity (NTU)
- HCS/HFS references
- Transferable: "No (Soulbound)"

**Investor NFT:**
- Certificate Type: "Investor - Financial Impact"
- Payment Disbursed
- Quality Score
- Environmental Impact: "Water Quality Preservation"
- Producer Address
- HCS reference
- Transferable: "No (Soulbound)"

### 4. Relayer Service Update (✅ Completed)
**File:** `backend/src/services/relayer.ts`

Updated `executeHBARPayment()` method to:
- Fetch batch data for environmental metrics
- Get investor address from agreement
- Call `mintDualCertificates()` instead of `mintCertificate()`
- Store both producer and investor NFT data
- Return certificate object with both NFTs

Updated `PaymentCheckResult` interface to support dual certificate structure.

### 5. Database Service Update (✅ Completed)
**File:** `backend/src/services/orm/prismaDatabase.ts`

#### Updated `PaymentData` interface:
Added investor NFT fields

#### Updated `createPayment()` method:
Now saves all 4 investor NFT fields to database

#### Updated `getPaymentsByAgreement()` method:
Added investor NFT fields to select statement

### 6. Payment Routes Update (✅ Completed)
**File:** `backend/src/routes/payments.ts`

Updated `appendCertificateInfo()` function to return nested structure:
```typescript
certificate: {
  producer: { tokenId, serialNumber, metadataUri, transactionId },
  investor: { tokenId, serialNumber, metadataUri, transactionId } | undefined
}
```

Updated `PaymentCheckResult` interface to match new structure.

## Key Features

### Dual Minting Logic
1. When a payment is executed, the system:
   - Fetches the batch data for environmental metrics
   - Gets the investor address from the agreement
   - Calls `mintDualCertificates()` with all required data
   
2. The NFT service:
   - Builds separate metadata for producer (environmental focus) and investor (financial focus)
   - Uploads metadata to Pinata (with HFS fallback capability)
   - Mints both NFTs on Hedera using the same token ID
   - Returns both NFT results

3. Both NFTs share:
   - Same Agreement ID
   - Same Audit Hash (for traceability)
   - Same Quality Score
   - Same HCS Transaction ID

### Metadata Storage
- Primary: Pinata IPFS (configured with @pinata/sdk)
- Fallback: HFS (Hedera File Service) - ready but not currently used in mintSingleCertificate
- Metadata URIs stored in database for both NFTs

### Soulbound Implementation
- Metadata includes "Transferable: No (Soulbound)" attribute
- Actual soulbound enforcement requires Hedera token configuration at token creation time
- Token must be created with `supplyType: FINITE` and `freezeDefault: true`

## Database Migration

Run the following to apply the migration:
```bash
cd backend
npx prisma migrate deploy
```

For development:
```bash
npx prisma migrate dev
```

## Environment Variables

The following environment variables are required:

### Required (already configured):
- `HEDERA_ACCOUNT_ID` - Hedera account for transactions
- `HEDERA_PRIVATE_KEY` - Private key for signing
- `NFT_CERTIFICATION_TOKEN_ID` - Token ID for minting certificates
- `PINATA_API_KEY` - Pinata API key for IPFS
- `PINATA_API_SECRET` - Pinata secret key

### Optional:
- `NFT_CERT_METADATA_BASE_URI` - Base URI for certificate metadata

## API Response Changes

Payment responses now include nested certificate structure:

```json
{
  "success": true,
  "message": "Payment executed successfully",
  "amount": 100,
  "hcsTransactionId": "0.0.123@1234567890.123456789",
  "hfsFileId": "0.0.456",
  "certificate": {
    "producer": {
      "tokenId": "0.0.789",
      "serialNumber": 1,
      "metadataUri": "https://gateway.pinata.cloud/ipfs/Qm...",
      "transactionId": "0.0.123@1234567890.987654321"
    },
    "investor": {
      "tokenId": "0.0.789",
      "serialNumber": 2,
      "metadataUri": "https://gateway.pinata.cloud/ipfs/Qm...",
      "transactionId": "0.0.123@1234567890.987654322"
    }
  }
}
```

## Testing Recommendations

1. **Test NFT minting with missing investor address**
   - System should log warning but continue
   - Only producer NFT should be minted

2. **Test Pinata fallback**
   - Simulate Pinata failure
   - Verify system handles gracefully

3. **Verify shared audit hash**
   - Check both NFTs reference same audit hash
   - Ensures traceability between certificates

4. **Confirm metadata accuracy**
   - Producer NFT should have environmental metrics
   - Investor NFT should have financial/impact data

5. **Test existing payment retrieval**
   - Verify backward compatibility
   - Old payments without investor NFT should work

## Backwards Compatibility

The implementation maintains full backwards compatibility:
- Old payments without investor NFTs continue to work
- API returns `investor: undefined` when investor NFT doesn't exist
- All new fields are optional (nullable) in database

## Next Steps

1. **Token Configuration**: Ensure the NFT token is configured as soulbound on Hedera
   - Use `supplyType: FINITE`
   - Use `freezeDefault: true`
   - This prevents transfers and makes NFTs truly soulbound

2. **Frontend Updates**: Update frontend to display both NFTs
   - Show producer certificate to producers
   - Show investor certificate to investors
   - Display shared audit hash for verification

3. **HFS Fallback**: Optionally implement HFS fallback in `mintSingleCertificate` if Pinata reliability becomes an issue

4. **Monitoring**: Add metrics for:
   - NFT minting success/failure rates
   - Dual minting success (both vs. one)
   - Metadata upload times

## Files Modified

1. `backend/prisma/schema.prisma` - Added investor NFT fields
2. `backend/src/types/index.ts` - Updated Payment interface
3. `backend/src/services/nft.ts` - Added dual minting functionality
4. `backend/src/services/relayer.ts` - Updated to use dual minting
5. `backend/src/services/orm/prismaDatabase.ts` - Updated PaymentData and queries
6. `backend/src/routes/payments.ts` - Updated certificate response structure

## Migration Files Created

1. `backend/prisma/migrations/20251030164824_add_investor_nft_fields/migration.sql`

## Compilation Status

✅ TypeScript compilation successful
✅ All type errors resolved
✅ Ready for deployment

