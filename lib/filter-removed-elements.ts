import type { AnyCircuitElement, CircuitJson } from "circuit-json"
import { getElementId } from "./circuit-index"
import type { ElementId } from "./types"

export interface RemovalFilterRequest {
  elements: readonly AnyCircuitElement[]
  seedIds: ReadonlySet<ElementId>
  connectivityKeys: ReadonlySet<string>
}

export function filterRemovedElements(
  request: RemovalFilterRequest,
): CircuitJson {
  const { elements, seedIds, connectivityKeys } = request
  const removedIds = new Set(seedIds)
  for (const element of elements) {
    if (!matchesRemovedConnectivity(element, connectivityKeys)) continue
    const elementId = getElementId(element)
    if (elementId) removedIds.add(elementId)
  }
  let foundDependency = true
  while (foundDependency) {
    foundDependency = false
    for (const element of elements) {
      const elementId = getElementId(element)
      if (!elementId || removedIds.has(elementId)) continue
      if (!referencesRemovedId(element, removedIds)) continue
      removedIds.add(elementId)
      foundDependency = true
    }
  }
  return structuredClone(
    elements.filter((element) => {
      const elementId = getElementId(element)
      return !elementId || !removedIds.has(elementId)
    }),
  )
}

function matchesRemovedConnectivity(
  element: AnyCircuitElement,
  connectivityKeys: ReadonlySet<string>,
): boolean {
  if (
    element.type === "schematic_trace" &&
    element.subcircuit_connectivity_map_key
  ) {
    return connectivityKeys.has(element.subcircuit_connectivity_map_key)
  }
  if (element.type === "schematic_net_label" && element.source_net_id) {
    return connectivityKeys.has(element.source_net_id)
  }
  return false
}

function referencesRemovedId(
  element: AnyCircuitElement,
  removedIds: ReadonlySet<ElementId>,
): boolean {
  const primaryKey = `${element.type}_id`
  for (const [fieldName, fieldEntry] of Object.entries(element)) {
    if (fieldName === primaryKey) continue
    if (fieldName.endsWith("_id") && typeof fieldEntry === "string") {
      if (removedIds.has(fieldEntry)) return true
    }
  }
  return false
}
