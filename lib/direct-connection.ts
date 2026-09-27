import type { CircuitIndex } from "./circuit-index"
import { getDanglingPcbTraceRepairConnections } from "./dangling-pcb-trace-repair"
import { getSafeComponentBypassConnections } from "./safe-component-bypass"
import type {
  DirectConnection,
  SourceComponentId,
  SourcePortId,
  SourceTraceId,
} from "./types"

export interface RemovalConnections {
  removedSourcePortIds: ReadonlySet<SourcePortId>
  touchedSourceTraceIds: ReadonlySet<SourceTraceId>
  directConnections: readonly DirectConnection[]
}

export function resolveRemovalConnections(
  index: CircuitIndex,
  removedComponentIds: ReadonlySet<SourceComponentId>,
): RemovalConnections {
  const removedSourcePortIds = new Set(
    index.sourcePorts
      .filter((sourcePort) =>
        sourcePort.source_component_id
          ? removedComponentIds.has(sourcePort.source_component_id)
          : false,
      )
      .map((sourcePort) => sourcePort.source_port_id),
  )
  const touchedTraces = index.sourceTraces.filter((sourceTrace) =>
    sourceTrace.connected_source_port_ids.some((sourcePortId) =>
      removedSourcePortIds.has(sourcePortId),
    ),
  )
  const touchedSourceTraceIds = new Set(
    touchedTraces.map((sourceTrace) => sourceTrace.source_trace_id),
  )
  const directConnections: DirectConnection[] = []
  addSurvivingTraceConnections({
    connections: directConnections,
    traces: touchedTraces,
    removedPortIds: removedSourcePortIds,
  })
  directConnections.push(
    ...getSafeComponentBypassConnections({
      index,
      removedComponentIds,
      removedSourcePortIds,
    }),
    ...getDanglingPcbTraceRepairConnections({
      index,
      removedSourcePortIds,
      touchedSourceTraceIds,
    }),
  )
  return {
    removedSourcePortIds,
    touchedSourceTraceIds,
    directConnections: deduplicateConnections(directConnections),
  }
}

function addSurvivingTraceConnections({
  connections,
  traces,
  removedPortIds,
}: {
  connections: DirectConnection[]
  traces: CircuitIndex["sourceTraces"]
  removedPortIds: ReadonlySet<SourcePortId>
}): void {
  for (const sourceTrace of traces) {
    const survivingPortIds = sourceTrace.connected_source_port_ids.filter(
      (sourcePortId) => !removedPortIds.has(sourcePortId),
    )
    const anchorPortId = survivingPortIds[0]
    if (!anchorPortId) continue
    for (const endPortId of survivingPortIds.slice(1)) {
      connections.push({
        sourcePortIds: [anchorPortId, endPortId],
        relatedSourceTraceIds: [sourceTrace.source_trace_id],
      })
    }
  }
}

function deduplicateConnections(
  connections: readonly DirectConnection[],
): readonly DirectConnection[] {
  const seenKeys = new Set<string>()
  return connections.filter((connection) => {
    const pairKey = [...connection.sourcePortIds].sort().join("::")
    if (seenKeys.has(pairKey)) return false
    seenKeys.add(pairKey)
    return true
  })
}
