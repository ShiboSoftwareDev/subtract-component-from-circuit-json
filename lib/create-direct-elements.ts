import type { AnyCircuitElement, SourceTrace } from "circuit-json"
import type { CircuitIndex } from "./circuit-index"
import {
  createDirectPcbTrace,
  createDirectSchematicTrace,
} from "./create-direct-physical-traces"
import { reserveId } from "./reserve-id"
import type { DirectConnection, SourceTraceId } from "./types"

export interface DirectElementResult {
  elements: readonly AnyCircuitElement[]
  sourceTraceIds: readonly SourceTraceId[]
}

export function createDirectElements(
  index: CircuitIndex,
  connections: readonly DirectConnection[],
): DirectElementResult {
  const occupiedIds = new Set(index.elementIds)
  const elements: AnyCircuitElement[] = []
  const sourceTraceIds: SourceTraceId[] = []
  for (const [connectionIndex, connection] of connections.entries()) {
    const sourceTraceId = reserveId(
      `source_trace_subtract_direct_${connectionIndex}`,
      occupiedIds,
    )
    sourceTraceIds.push(sourceTraceId)
    elements.push(createSourceTrace({ index, connection, sourceTraceId }))
    const request = {
      index,
      connection,
      sourceTraceId,
      occupiedIds,
    }
    const pcbTrace = createDirectPcbTrace(request)
    const schematicTrace = createDirectSchematicTrace(request)
    if (pcbTrace) elements.push(pcbTrace)
    if (schematicTrace) elements.push(schematicTrace)
  }
  return { elements, sourceTraceIds }
}

function createSourceTrace({
  index,
  connection,
  sourceTraceId,
}: {
  index: CircuitIndex
  connection: DirectConnection
  sourceTraceId: SourceTraceId
}): SourceTrace {
  const relatedTraces = connection.relatedSourceTraceIds
    .map((traceId) => index.sourceTraceById.get(traceId))
    .filter((trace) => trace !== undefined)
  return {
    type: "source_trace",
    source_trace_id: sourceTraceId,
    connected_source_port_ids: [...connection.sourcePortIds],
    connected_source_net_ids: [
      ...new Set(
        relatedTraces.flatMap((trace) => trace.connected_source_net_ids),
      ),
    ],
    min_trace_thickness: relatedTraces.find(
      (trace) => trace.min_trace_thickness !== undefined,
    )?.min_trace_thickness,
    name: `subtract_direct_${sourceTraceId}`,
  }
}
