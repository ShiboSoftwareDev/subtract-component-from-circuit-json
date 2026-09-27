import type { CircuitIndex } from "./circuit-index"
import { sourceTracesShareConnectivity } from "./connectivity-identity"
import { findBoundarySourcePortId } from "./find-boundary-source-port"
import type { DirectConnection, SourceComponentId, SourcePortId } from "./types"

export function getSafeComponentBypassConnections({
  index,
  removedComponentIds,
  removedSourcePortIds,
}: {
  index: CircuitIndex
  removedComponentIds: ReadonlySet<SourceComponentId>
  removedSourcePortIds: ReadonlySet<SourcePortId>
}): readonly DirectConnection[] {
  const connections: DirectConnection[] = []
  for (const componentId of removedComponentIds) {
    const component = index.sourceComponentById.get(componentId)
    if (!component) continue
    const componentPortIds = index.sourcePorts
      .filter((port) => port.source_component_id === componentId)
      .map((port) => port.source_port_id)
    const incidentTraces = index.sourceTraces.filter((trace) =>
      trace.connected_source_port_ids.some((sourcePortId) =>
        componentPortIds.includes(sourcePortId),
      ),
    )
    if (incidentTraces.length !== 2) continue
    if (!isSafeBypass({ component, incidentTraces })) continue
    const boundaryPortIds = incidentTraces.map((sourceTrace) => {
      const removedPortId = sourceTrace.connected_source_port_ids.find(
        (sourcePortId) => removedSourcePortIds.has(sourcePortId),
      )
      if (!removedPortId) return undefined
      return findBoundarySourcePortId({
        index,
        sourceTrace,
        removedSourcePortIds,
        referenceSourcePortId: removedPortId,
      })
    })
    const [leftPortId, rightPortId] = boundaryPortIds
    if (!leftPortId || !rightPortId || leftPortId === rightPortId) continue
    connections.push({
      sourcePortIds: [leftPortId, rightPortId],
      relatedSourceTraceIds: incidentTraces.map(
        (sourceTrace) => sourceTrace.source_trace_id,
      ),
    })
  }
  return connections
}

function isSafeBypass({
  component,
  incidentTraces,
}: {
  component: CircuitIndex["sourceComponents"][number]
  incidentTraces: CircuitIndex["sourceTraces"]
}): boolean {
  const isZeroOhm =
    component.ftype === "simple_resistor" &&
    Reflect.get(component, "resistance") === 0
  if (isZeroOhm) return true
  const [leftTrace, rightTrace] = incidentTraces
  if (!leftTrace || !rightTrace) return false
  return sourceTracesShareConnectivity(leftTrace, rightTrace)
}
