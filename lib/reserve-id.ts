import type { ElementId } from "./types"

export function reserveId(
  prefix: string,
  occupiedIds: Set<ElementId>,
): ElementId {
  let candidate = prefix
  let suffix = 1
  while (occupiedIds.has(candidate)) {
    candidate = `${prefix}_${suffix}`
    suffix += 1
  }
  occupiedIds.add(candidate)
  return candidate
}
