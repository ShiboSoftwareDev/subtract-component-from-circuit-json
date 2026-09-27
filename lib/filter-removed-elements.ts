import type { AnyCircuitElement, CircuitJson } from "circuit-json"
import { getElementId } from "./circuit-index"
import type { ElementId } from "./types"

export interface RemovalFilterRequest {
  elements: readonly AnyCircuitElement[]
  seedIds: ReadonlySet<ElementId>
}

export function filterRemovedElements(
  request: RemovalFilterRequest,
): CircuitJson {
  const { elements, seedIds } = request
  const removedIds = new Set(seedIds)
  let foundDependency = true
  while (foundDependency) {
    foundDependency = false
    for (const element of elements) {
      const elementId = getElementId(element)
      if (!elementId || removedIds.has(elementId)) continue
      if (!referencesRemovedId({ element, removedIds })) continue
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

function referencesRemovedId({
  element,
  removedIds,
}: {
  element: AnyCircuitElement
  removedIds: ReadonlySet<ElementId>
}): boolean {
  const primaryKey = `${element.type}_id`
  return Object.entries(element).some(([fieldName, fieldEntry]) => {
    if (fieldName === primaryKey) return false
    return fieldEntryReferencesRemovedId({
      fieldName,
      fieldEntry,
      removedIds,
    })
  })
}

function fieldEntryReferencesRemovedId({
  fieldName,
  fieldEntry,
  removedIds,
}: {
  fieldName: string
  fieldEntry: unknown
  removedIds: ReadonlySet<ElementId>
}): boolean {
  if (fieldName.endsWith("_id") && typeof fieldEntry === "string") {
    return removedIds.has(fieldEntry)
  }
  if (Array.isArray(fieldEntry)) {
    return fieldEntry.some((arrayEntry) =>
      fieldEntryReferencesRemovedId({
        fieldName,
        fieldEntry: arrayEntry,
        removedIds,
      }),
    )
  }
  if (fieldEntry && typeof fieldEntry === "object") {
    return Object.entries(fieldEntry).some(([nestedFieldName, nestedEntry]) =>
      fieldEntryReferencesRemovedId({
        fieldName: nestedFieldName,
        fieldEntry: nestedEntry,
        removedIds,
      }),
    )
  }
  return false
}
