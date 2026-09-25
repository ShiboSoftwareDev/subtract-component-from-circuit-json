import type {
  AnyCircuitElement,
  PcbPort,
  SchematicPort,
  SourceComponentBase,
  SourcePort,
  SourceTrace,
} from "circuit-json"
import type {
  ElementId,
  SourceComponentId,
  SourcePortId,
  SourceTraceId,
} from "./types"

export type SourceComponentElement = AnyCircuitElement & SourceComponentBase

export interface CircuitIndex {
  elements: readonly AnyCircuitElement[]
  elementIds: ReadonlySet<ElementId>
  sourceComponents: readonly SourceComponentElement[]
  sourceComponentById: ReadonlyMap<SourceComponentId, SourceComponentElement>
  sourcePorts: readonly SourcePort[]
  sourcePortById: ReadonlyMap<SourcePortId, SourcePort>
  sourceTraces: readonly SourceTrace[]
  sourceTraceById: ReadonlyMap<SourceTraceId, SourceTrace>
  pcbPortBySourcePortId: ReadonlyMap<SourcePortId, PcbPort>
  schematicPortBySourcePortId: ReadonlyMap<SourcePortId, SchematicPort>
}

export function createCircuitIndex(
  elements: readonly AnyCircuitElement[],
): CircuitIndex {
  const sourceComponents = elements.filter(
    (element): element is SourceComponentElement =>
      element.type === "source_component",
  )
  const sourcePorts = elements.filter(
    (element): element is SourcePort => element.type === "source_port",
  )
  const sourceTraces = elements.filter(
    (element): element is SourceTrace => element.type === "source_trace",
  )
  const pcbPorts = elements.filter(
    (element): element is PcbPort => element.type === "pcb_port",
  )
  const schematicPorts = elements.filter(
    (element): element is SchematicPort => element.type === "schematic_port",
  )

  return {
    elements,
    elementIds: new Set(elements.map(getElementId).filter(isElementId)),
    sourceComponents,
    sourceComponentById: new Map(
      sourceComponents.map((component) => [
        component.source_component_id,
        component,
      ]),
    ),
    sourcePorts,
    sourcePortById: new Map(
      sourcePorts.map((port) => [port.source_port_id, port]),
    ),
    sourceTraces,
    sourceTraceById: new Map(
      sourceTraces.map((trace) => [trace.source_trace_id, trace]),
    ),
    pcbPortBySourcePortId: new Map(
      pcbPorts.map((port) => [port.source_port_id, port]),
    ),
    schematicPortBySourcePortId: new Map(
      schematicPorts.map((port) => [port.source_port_id, port]),
    ),
  }
}

export function getElementId(
  element: AnyCircuitElement,
): ElementId | undefined {
  const primaryKey = `${element.type}_id`
  const candidate = Object.entries(element).find(
    ([fieldName, fieldEntry]) =>
      fieldName === primaryKey && typeof fieldEntry === "string",
  )?.[1]
  return typeof candidate === "string" ? candidate : undefined
}

function isElementId(candidate: ElementId | undefined): candidate is ElementId {
  return candidate !== undefined
}
