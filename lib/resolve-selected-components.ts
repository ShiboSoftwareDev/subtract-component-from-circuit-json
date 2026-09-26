import type { CircuitIndex } from "./circuit-index"
import type { SourceComponentId, SubtractComponentOptions } from "./types"

export function resolveSelectedComponentIds(
  index: CircuitIndex,
  options: SubtractComponentOptions,
): ReadonlySet<SourceComponentId> {
  const requestedNames = new Set(options.componentNames ?? [])
  const requestedIds = new Set(options.sourceComponentIds ?? [])
  if (requestedNames.size === 0 && requestedIds.size === 0) {
    throw new Error(
      "Provide at least one componentNames or sourceComponentIds selector",
    )
  }

  const selectedIds = new Set<SourceComponentId>()
  for (const component of index.sourceComponents) {
    if (
      requestedNames.has(component.name) ||
      requestedIds.has(component.source_component_id)
    ) {
      selectedIds.add(component.source_component_id)
    }
  }

  const missingNames = [...requestedNames].filter(
    (name) =>
      !index.sourceComponents.some((component) => component.name === name),
  )
  const missingIds = [...requestedIds].filter(
    (componentId) => !index.sourceComponentById.has(componentId),
  )
  if (missingNames.length > 0 || missingIds.length > 0) {
    throw new Error(
      `Component selectors did not match: ${[
        ...missingNames,
        ...missingIds,
      ].join(", ")}`,
    )
  }
  return selectedIds
}
