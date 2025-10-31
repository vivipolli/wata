# W.A.T.A. Chain — 3-Minute Frontend Demo (Didactic PES Narration)

Total: ≤ 3:00. End-to-end story using an agreement already processed. No live transactions.

## 0:00 – 0:25 Why this matters (Sidebar visible)
"Many programs pay for environmental services, but proving results is slow and expensive. Producers do the work, but verification delays and paperwork block access. Our goal: make proof simple and trustworthy so clean water work gets recognized and paid."

## 0:25 – 0:45 What PES means here (click to Contracts)
"PES here means: if water quality stays good, the producer gets paid. The agreement defines the area, the rules, and the wallets. We keep only essential data on-chain to stay low-cost and privacy-aware."

## 0:45 – 1:20 1) Agreement (Contracts)
"In Contracts, here’s an agreement already created. Think of it as a simple program enrollment: who, where, and how compliance is checked. We’ll follow this exact agreement through the rest of the flow."

## 1:20 – 1:55 2) Monitoring (oracle & compliance)
"In Monitoring, I select that agreement. These are recent turbidity readings—turbidity is a practical proxy for water quality. Bad water is cloudy; good water stays below the limit."
"This section shows compliance at-a-glance. The Oracle Status is our independent referee: it groups readings in a batch and calculates a score. When the score meets the rule, we’re eligible for payment. This one is already validated so we don’t need to click anything now."

## 1:55 – 2:35 3) Approval & Payment (Payments)
"In Payments, I select the same agreement. Here, the batch is COMPLETED with the amount and date—it was approved because the average turbidity stayed within the limit."
"The details include the Audit Hash—think of it as a unique fingerprint of the validated data—and a reference stored on Hedera HFS, a permanent record you can open."
"Blockchain records give public proof for each payment batch, linking to HCS messages and HFS reports so auditors can verify what happened, when, and for whom."

## 2:35 – 2:50 4) Certificate NFT (Payments)
"Each completed payment also issues a certificate NFT. It’s like a tamper-proof receipt: for producers it shows the environmental result; for funders, impact. This one is already received, so I open View Certificate, and from here we can jump to Hedera Explorer to see it on-chain."

## 2:50 – 3:00 Close (stay on Payments)
"Behind the scenes: HTS mints the certificate, HCS/HFS provide timestamped, public references, and our relayer automates HBAR payouts. Simple idea: prove clean water with data, pay on time, and make the proof permanent."