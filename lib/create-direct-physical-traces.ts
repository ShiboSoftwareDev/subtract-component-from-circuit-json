import type { LayerRef, PcbTrace, SchematicTrace } from "circuit-json"
import type { CircuitIndex } from "./circuit-index"
import type { DirectConnection } from "./direct-connection"
import { reserveId } from "./reserve-id"
import type { ElementId, SourceTraceId } from "./types"

export interface DirectPhysicalTraceRequest {
  index: CircuitIndex
  connection: DirectConnection
  sourceTraceId: SourceTraceId
  occupiedIds: Set<ElementId>
}

export function createDirectPcbTrace(
  request: DirectPhysicalTraceRequest,
): PcbTrace | undefined {
  const { index, connection, sourceTraceId, occupiedIds } = request
  const [leftPortId, rightPortId] = connection.sourcePortIds
  const leftPort = index.pcbPortBySourcePortId.get(leftPortId)
  const rightPort = index.pcbPortBySourcePortId.get(rightPortId)
  if (!leftPort || !rightPort) return undefined
  const layer = findCommonLayer(leftPort.layers, rightPort.layers)
  const width = findTraceWidth(index, connection)
  return {
    type: "pcb_trace",
    pcb_trace_id: reserveId(`pcb_trace_${sourceTraceId}`, occupiedIds),
    source_trace_id: sourceTraceId,
    route: [
      {
        route_type: "wire",
        x: leftPort.x,
        y: leftPort.y,
        width,
        layer,
        start_pcb_port_id: leftPort.pcb_port_id,
      },
      {
        route_type: "wire",
        x: rightPort.x,
        y: rightPort.y,
        width,
        layer,
        end_pcb_port_id: rightPort.pcb_port_id,
      },
    ],
  }
}

export function createDirectSchematicTrace(
  request: DirectPhysicalTraceRequest,
): SchematicTrace | undefined {
  const { index, connection, sourceTraceId, occupiedIds } = request
  const [leftPortId, rightPortId] = connection.sourcePortIds
  const leftPort = index.schematicPortBySourcePortId.get(leftPortId)
  const rightPort = index.schematicPortBySourcePortId.get(rightPortId)
  if (!leftPort || !rightPort) return undefined
  return {
    type: "schematic_trace",
    schematic_trace_id: reserveId(
      `schematic_trace_${sourceTraceId}`,
      occupiedIds,
    ),
    schematic_sheet_id:
      leftPort.schematic_sheet_id === rightPort.schematic_sheet_id
        ? leftPort.schematic_sheet_id
        : undefined,
    source_trace_id: sourceTraceId,
    junctions: [],
    edges: [
      {
        from: leftPort.center,
        to: rightPort.center,
        from_schematic_port_id: leftPort.schematic_port_id,
        to_schematic_port_id: rightPort.schematic_port_id,
      },
    ],
  }
}

function findCommonLayer(
  leftLayers: readonly LayerRef[],
  rightLayers: readonly LayerRef[],
): LayerRef {
  const rightLayerKeys = new Set(
    rightLayers.map((layer) => JSON.stringify(layer)),
  )
  return (
    leftLayers.find((layer) => rightLayerKeys.has(JSON.stringify(layer))) ??
    leftLayers[0] ??
    rightLayers[0] ??
    "top"
  )
}

function findTraceWidth(
  index: CircuitIndex,
  connection: DirectConnection,
): number {
  const relatedIds = new Set(connection.relatedSourceTraceIds)
  for (const element of index.elements) {
    if (element.type !== "pcb_trace" || !element.source_trace_id) continue
    if (!relatedIds.has(element.source_trace_id)) continue
    const wirePoint = element.route.find((point) => point.route_type === "wire")
    if (wirePoint?.route_type === "wire") return wirePoint.width
  }
  return 0.2
}
