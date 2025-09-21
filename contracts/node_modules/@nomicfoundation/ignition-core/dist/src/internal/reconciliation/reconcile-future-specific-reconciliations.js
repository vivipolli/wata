import { FutureType } from "../../types/module.js";
import { reconcileArtifactContractAt } from "./futures/reconcileArtifactContractAt.js";
import { reconcileArtifactContractDeployment } from "./futures/reconcileArtifactContractDeployment.js";
import { reconcileArtifactLibraryDeployment } from "./futures/reconcileArtifactLibraryDeployment.js";
import { reconcileNamedContractAt } from "./futures/reconcileNamedContractAt.js";
import { reconcileNamedContractCall } from "./futures/reconcileNamedContractCall.js";
import { reconcileNamedContractDeployment } from "./futures/reconcileNamedContractDeployment.js";
import { reconcileNamedEncodeFunctionCall } from "./futures/reconcileNamedEncodeFunctionCall.js";
import { reconcileNamedLibraryDeployment } from "./futures/reconcileNamedLibraryDeployment.js";
import { reconcileNamedStaticCall } from "./futures/reconcileNamedStaticCall.js";
import { reconcileReadEventArgument } from "./futures/reconcileReadEventArgument.js";
import { reconcileSendData } from "./futures/reconcileSendData.js";
export async function reconcileFutureSpecificReconciliations(future, executionState, context) {
    switch (future.type) {
        case FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT:
            return reconcileNamedContractDeployment(future, executionState, context);
        case FutureType.CONTRACT_DEPLOYMENT:
            return reconcileArtifactContractDeployment(future, executionState, context);
        case FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT:
            return reconcileNamedLibraryDeployment(future, executionState, context);
        case FutureType.LIBRARY_DEPLOYMENT:
            return reconcileArtifactLibraryDeployment(future, executionState, context);
        case FutureType.CONTRACT_CALL:
            return reconcileNamedContractCall(future, executionState, context);
        case FutureType.STATIC_CALL:
            return reconcileNamedStaticCall(future, executionState, context);
        case FutureType.ENCODE_FUNCTION_CALL:
            return reconcileNamedEncodeFunctionCall(future, executionState, context);
        case FutureType.NAMED_ARTIFACT_CONTRACT_AT:
            return reconcileNamedContractAt(future, executionState, context);
        case FutureType.CONTRACT_AT: {
            return reconcileArtifactContractAt(future, executionState, context);
        }
        case FutureType.READ_EVENT_ARGUMENT: {
            return reconcileReadEventArgument(future, executionState, context);
        }
        case FutureType.SEND_DATA: {
            return reconcileSendData(future, executionState, context);
        }
    }
}
//# sourceMappingURL=reconcile-future-specific-reconciliations.js.map