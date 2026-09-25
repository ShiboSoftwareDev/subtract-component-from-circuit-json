import type { CircuitJson } from "circuit-json"
import { createCircuitIndex } from "./circuit-index"
import { expandWithComponentsBetween } from "./component-graph"
import { createDirectElements } from "./create-direct-elements"
import { resolveRemovalConnections } from "./direct-connection"
import { filterRemovedElements } from "./filter-removed-elements"
import { normalizeSubtraceInput } from "./normalize-subtrace-input"
import { resolveSelectedComponentIds } from "./resolve-selected-components"
import type {
  ElementId,
  SubtraceComponentOptions,
  SubtraceInput,
  SubtraceResultDetails,
} from "./types"

export async function subtraceComponentFromCircuitJson(
  source: SubtraceInput,
  options: SubtraceComponentOptions,
): Promise<CircuitJson> {
  const result = await subtraceComponentFromCircuitJsonWithDetails(
    source,
    options,
  )
  return result.circuitJson
}

export async function subtraceComponentFromCircuitJsonWithDetails(
  source: SubtraceInput,
  options: SubtraceComponentOptions,
): Promise<SubtraceResultDetails> {
  const originalCircuitJson = await normalizeSubtraceInput(source)
  const index = createCircuitIndex(originalCircuitJson)
  const selectedIds = resolveSelectedComponentIds(index, options)
  const removedComponentIds =
    options.includeComponentsBetween === false
      ? selectedIds
      : expandWithComponentsBetween(index, selectedIds)
  const removalConnections = resolveRemovalConnections(
    index,
    removedComponentIds,
  )
  const seedIds = new Set<ElementId>([
    ...removedComponentIds,
    ...removalConnections.removedSourcePortIds,
    ...removalConnections.touchedSourceTraceIds,
  ])
  const touchedConnectivityKeys = new Set(
    index.sourceTraces
      .filter((trace) =>
        removalConnections.touchedSourceTraceIds.has(trace.source_trace_id),
      )
      .map((trace) => trace.subcircuit_connectivity_map_key)
      .filter((key) => key !== undefined),
  )
  const retainedElements = filterRemovedElements({
    elements: originalCircuitJson,
    seedIds,
    connectivityKeys: touchedConnectivityKeys,
  })
  const directResult =
    options.preserveNetConnectivity === false
      ? { elements: [], sourceTraceIds: [] }
      : createDirectElements(index, removalConnections.directConnections)
  const removedComponentNames = index.sourceComponents
    .filter((component) =>
      removedComponentIds.has(component.source_component_id),
    )
    .map((component) => component.name)

  return {
    circuitJson: [...retainedElements, ...directResult.elements],
    removedComponentNames,
    removedSourceComponentIds: [...removedComponentIds],
    addedSourceTraceIds: directResult.sourceTraceIds,
  }
}
