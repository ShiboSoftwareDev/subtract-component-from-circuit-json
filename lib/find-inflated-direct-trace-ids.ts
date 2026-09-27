import type { CircuitJson } from "circuit-json"
import { type CircuitIndex, createCircuitIndex } from "./circuit-index"
import type { DirectConnection, SourcePortId, SourceTraceId } from "./types"

type SourcePortSignature = string
type SourcePortPairSignature = string

export function findInflatedDirectTraceIds({
  originalIndex,
  directConnections,
  inflatedCircuitJson,
}: {
  originalIndex: CircuitIndex
  directConnections: readonly DirectConnection[]
  inflatedCircuitJson: CircuitJson
}): readonly SourceTraceId[] {
  const expectedPairSignatures = new Set(
    directConnections
      .map((connection) =>
        getSourcePortPairSignature({
          index: originalIndex,
          sourcePortIds: connection.sourcePortIds,
        }),
      )
      .filter((signature) => signature !== undefined),
  )
  const inflatedIndex = createCircuitIndex(inflatedCircuitJson)
  return inflatedIndex.sourceTraces
    .filter((sourceTrace) => {
      if (sourceTrace.connected_source_port_ids.length !== 2) return false
      const signature = getSourcePortPairSignature({
        index: inflatedIndex,
        sourcePortIds: sourceTrace.connected_source_port_ids,
      })
      return signature ? expectedPairSignatures.has(signature) : false
    })
    .map((sourceTrace) => sourceTrace.source_trace_id)
}

function getSourcePortPairSignature({
  index,
  sourcePortIds,
}: {
  index: CircuitIndex
  sourcePortIds: readonly SourcePortId[]
}): SourcePortPairSignature | undefined {
  const sourcePortSignatures = sourcePortIds
    .map((sourcePortId) => getSourcePortSignature({ index, sourcePortId }))
    .filter((signature) => signature !== undefined)
  if (sourcePortSignatures.length !== 2) return undefined
  return sourcePortSignatures.sort().join("::")
}

function getSourcePortSignature({
  index,
  sourcePortId,
}: {
  index: CircuitIndex
  sourcePortId: SourcePortId
}): SourcePortSignature | undefined {
  const sourcePort = index.sourcePortById.get(sourcePortId)
  if (!sourcePort?.source_component_id) return undefined
  const sourceComponent = index.sourceComponentById.get(
    sourcePort.source_component_id,
  )
  if (!sourceComponent) return undefined
  return `${sourceComponent.name}>${sourcePort.name}`
}
