import { HederaService } from '../services/hedera';
import { PrismaDatabase } from '../services/orm/prismaDatabase';
import { RelayerService } from '../services/relayer';
export default function paymentRoutes(hederaService: HederaService, database: PrismaDatabase, relayerService: RelayerService): import("express-serve-static-core").Router;
//# sourceMappingURL=payments.d.ts.map