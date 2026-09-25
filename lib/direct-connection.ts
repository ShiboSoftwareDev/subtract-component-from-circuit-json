import type { CircuitIndex } from "./circuit-index"
import type { SourceComponentId, SourcePortId, SourceTraceId } from "./types"

export interface DirectConnection {
  sourcePortIds: readonly [SourcePortId, SourcePortId]
  relatedSourceTraceIds: readonly SourceTraceId[]
}

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
      .filter((port) =>
        port.source_component_id
          ? removedComponentIds.has(port.source_component_id)
          : false,
      )
      .map((port) => port.source_port_id),
  )
  const touchedTraces = index.sourceTraces.filter((trace) =>
    trace.connected_source_port_ids.some((portId) =>
      removedSourcePortIds.has(portId),
    ),
  )
  const directConnections: DirectConnection[] = []
  addSurvivingTraceConnections(
    directConnections,
    touchedTraces,
    removedSourcePortIds,
  )
  addSafeComponentBypasses(
    directConnections,
    index,
    removedComponentIds,
    removedSourcePortIds,
  )
  return {
    removedSourcePortIds,
    touchedSourceTraceIds: new Set(
      touchedTraces.map((trace) => trace.source_trace_id),
    ),
    directConnections: deduplicateConnections(directConnections),
  }
}

function addSurvivingTraceConnections(
  connections: DirectConnection[],
  traces: CircuitIndex["sourceTraces"],
  removedPortIds: ReadonlySet<SourcePortId>,
): void {
  for (const trace of traces) {
    const survivingPortIds = trace.connected_source_port_ids.filter(
      (portId) => !removedPortIds.has(portId),
    )
    const anchorPortId = survivingPortIds[0]
    if (!anchorPortId) continue
    for (const endPortId of survivingPortIds.slice(1)) {
      connections.push({
        sourcePortIds: [anchorPortId, endPortId],
        relatedSourceTraceIds: [trace.source_trace_id],
      })
    }
  }
}

function addSafeComponentBypasses(
  connections: DirectConnection[],
  index: CircuitIndex,
  removedComponentIds: ReadonlySet<SourceComponentId>,
  removedPortIds: ReadonlySet<SourcePortId>,
): void {
  for (const componentId of removedComponentIds) {
    const component = index.sourceComponentById.get(componentId)
    if (!component) continue
    const componentPortIds = index.sourcePorts
      .filter((port) => port.source_component_id === componentId)
      .map((port) => port.source_port_id)
    const incidentTraces = index.sourceTraces.filter((trace) =>
      trace.connected_source_port_ids.some((portId) =>
        componentPortIds.includes(portId),
      ),
    )
    if (incidentTraces.length !== 2) continue
    const boundaryPortIds = incidentTraces.map((trace) =>
      trace.connected_source_port_ids.find(
        (portId) => !removedPortIds.has(portId),
      ),
    )
    const [leftPortId, rightPortId] = boundaryPortIds
    if (!leftPortId || !rightPortId || leftPortId === rightPortId) continue
    if (!isSafeBypass(component, incidentTraces)) continue
    connections.push({
      sourcePortIds: [leftPortId, rightPortId],
      relatedSourceTraceIds: incidentTraces.map(
        (trace) => trace.source_trace_id,
      ),
    })
  }
}

function isSafeBypass(
  component: CircuitIndex["sourceComponents"][number],
  traces: CircuitIndex["sourceTraces"],
): boolean {
  const isZeroOhm =
    component.ftype === "simple_resistor" &&
    Reflect.get(component, "resistance") === 0
  if (isZeroOhm) return true
  const [leftTrace, rightTrace] = traces
  if (!leftTrace || !rightTrace) return false
  const hasSharedNet = leftTrace.connected_source_net_ids.some((netId) =>
    rightTrace.connected_source_net_ids.includes(netId),
  )
  const hasSharedKey = Boolean(
    leftTrace.subcircuit_connectivity_map_key &&
      leftTrace.subcircuit_connectivity_map_key ===
        rightTrace.subcircuit_connectivity_map_key,
  )
  return hasSharedNet || hasSharedKey
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
