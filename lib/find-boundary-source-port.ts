import type { SourceTrace } from "circuit-json"
import type { CircuitIndex } from "./circuit-index"
import { sourceTracesShareConnectivity } from "./connectivity-identity"
import type { SourcePortId } from "./types"

export function findBoundarySourcePortId({
  index,
  sourceTrace,
  removedSourcePortIds,
  referenceSourcePortId,
  excludedCandidateSourcePortIds = new Set(),
}: {
  index: CircuitIndex
  sourceTrace: SourceTrace
  removedSourcePortIds: ReadonlySet<SourcePortId>
  referenceSourcePortId: SourcePortId
  excludedCandidateSourcePortIds?: ReadonlySet<SourcePortId>
}): SourcePortId | undefined {
  const directlyConnectedPortIds = sourceTrace.connected_source_port_ids.filter(
    (sourcePortId) =>
      !removedSourcePortIds.has(sourcePortId) &&
      !excludedCandidateSourcePortIds.has(sourcePortId),
  )
  if (directlyConnectedPortIds.length > 0) {
    return findNearestSourcePortId({
      index,
      candidateSourcePortIds: directlyConnectedPortIds,
      referenceSourcePortId,
    })
  }
  const candidateSourcePortIds = index.sourceTraces
    .filter((candidateTrace) =>
      sourceTracesShareConnectivity(sourceTrace, candidateTrace),
    )
    .flatMap((candidateTrace) => candidateTrace.connected_source_port_ids)
    .filter(
      (sourcePortId) =>
        !removedSourcePortIds.has(sourcePortId) &&
        !excludedCandidateSourcePortIds.has(sourcePortId),
    )
  return findNearestSourcePortId({
    index,
    candidateSourcePortIds,
    referenceSourcePortId,
  })
}

function findNearestSourcePortId({
  index,
  candidateSourcePortIds,
  referenceSourcePortId,
}: {
  index: CircuitIndex
  candidateSourcePortIds: readonly SourcePortId[]
  referenceSourcePortId: SourcePortId
}): SourcePortId | undefined {
  const uniqueCandidateIds = [...new Set(candidateSourcePortIds)]
  return uniqueCandidateIds.sort((leftSourcePortId, rightSourcePortId) => {
    const distanceDifference =
      getPortDistance({
        index,
        leftSourcePortId: referenceSourcePortId,
        rightSourcePortId: leftSourcePortId,
      }) -
      getPortDistance({
        index,
        leftSourcePortId: referenceSourcePortId,
        rightSourcePortId,
      })
    return (
      distanceDifference || leftSourcePortId.localeCompare(rightSourcePortId)
    )
  })[0]
}

function getPortDistance({
  index,
  leftSourcePortId,
  rightSourcePortId,
}: {
  index: CircuitIndex
  leftSourcePortId: SourcePortId
  rightSourcePortId: SourcePortId
}): number {
  const leftPcbPort = index.pcbPortBySourcePortId.get(leftSourcePortId)
  const rightPcbPort = index.pcbPortBySourcePortId.get(rightSourcePortId)
  if (leftPcbPort && rightPcbPort) {
    return Math.hypot(
      leftPcbPort.x - rightPcbPort.x,
      leftPcbPort.y - rightPcbPort.y,
    )
  }
  const leftSchematicPort =
    index.schematicPortBySourcePortId.get(leftSourcePortId)
  const rightSchematicPort =
    index.schematicPortBySourcePortId.get(rightSourcePortId)
  if (leftSchematicPort && rightSchematicPort) {
    return Math.hypot(
      leftSchematicPort.center.x - rightSchematicPort.center.x,
      leftSchematicPort.center.y - rightSchematicPort.center.y,
    )
  }
  return Number.POSITIVE_INFINITY
}
