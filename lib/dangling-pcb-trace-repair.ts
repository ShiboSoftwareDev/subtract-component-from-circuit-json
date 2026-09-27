import type { PcbTrace } from "circuit-json"
import type { CircuitIndex } from "./circuit-index"
import { findBoundarySourcePortId } from "./find-boundary-source-port"
import type { DirectConnection, SourcePortId, SourceTraceId } from "./types"

export function getDanglingPcbTraceRepairConnections({
  index,
  removedSourcePortIds,
  touchedSourceTraceIds,
}: {
  index: CircuitIndex
  removedSourcePortIds: ReadonlySet<SourcePortId>
  touchedSourceTraceIds: ReadonlySet<SourceTraceId>
}): readonly DirectConnection[] {
  const removedPcbPortIds = new Set(
    [...removedSourcePortIds]
      .map(
        (sourcePortId) =>
          index.pcbPortBySourcePortId.get(sourcePortId)?.pcb_port_id,
      )
      .filter((pcbPortId) => pcbPortId !== undefined),
  )
  const damagedSourceTraceIds = new Set<SourceTraceId>()
  for (const element of index.elements) {
    if (element.type !== "pcb_trace") continue
    if (!element.source_trace_id) continue
    if (touchedSourceTraceIds.has(element.source_trace_id)) continue
    if (!routeReferencesPcbPort({ pcbTrace: element, removedPcbPortIds })) {
      continue
    }
    damagedSourceTraceIds.add(element.source_trace_id)
  }

  const connections: DirectConnection[] = []
  for (const sourceTraceId of damagedSourceTraceIds) {
    const sourceTrace = index.sourceTraceById.get(sourceTraceId)
    if (!sourceTrace) continue
    const survivingPortIds = sourceTrace.connected_source_port_ids.filter(
      (sourcePortId) => !removedSourcePortIds.has(sourcePortId),
    )
    for (const survivingPortId of survivingPortIds) {
      const peerPortId = findBoundarySourcePortId({
        index,
        sourceTrace,
        removedSourcePortIds,
        referenceSourcePortId: survivingPortId,
        excludedCandidateSourcePortIds: new Set(survivingPortIds),
      })
      if (!peerPortId || peerPortId === survivingPortId) continue
      connections.push({
        sourcePortIds: [survivingPortId, peerPortId],
        relatedSourceTraceIds: [sourceTraceId],
      })
    }
  }
  return connections
}

function routeReferencesPcbPort({
  pcbTrace,
  removedPcbPortIds,
}: {
  pcbTrace: PcbTrace
  removedPcbPortIds: ReadonlySet<string>
}): boolean {
  return pcbTrace.route.some((routePoint) =>
    Object.entries(routePoint).some(
      ([fieldName, fieldEntry]) =>
        fieldName.endsWith("_pcb_port_id") &&
        typeof fieldEntry === "string" &&
        removedPcbPortIds.has(fieldEntry),
    ),
  )
}
