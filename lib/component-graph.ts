import type { CircuitIndex } from "./circuit-index"
import {
  type ConnectivityIdentity,
  getTraceConnectivityIdentities,
} from "./connectivity-identity"
import type { SourceComponentId } from "./types"

type ComponentGraph = ReadonlyMap<
  SourceComponentId,
  ReadonlySet<SourceComponentId>
>

export function expandWithComponentsBetween(
  index: CircuitIndex,
  selectedIds: ReadonlySet<SourceComponentId>,
): ReadonlySet<SourceComponentId> {
  if (selectedIds.size < 2) return selectedIds
  const graph = createComponentGraph(index)
  const expandedIds = new Set(selectedIds)
  const orderedIds = [...selectedIds].sort()
  for (let leftIndex = 0; leftIndex < orderedIds.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < orderedIds.length;
      rightIndex += 1
    ) {
      const leftId = orderedIds[leftIndex]
      const rightId = orderedIds[rightIndex]
      if (!leftId || !rightId) continue
      for (const componentId of findShortestPath({
        graph,
        startId: leftId,
        targetId: rightId,
      })) {
        expandedIds.add(componentId)
      }
    }
  }
  return expandedIds
}

function createComponentGraph(index: CircuitIndex): ComponentGraph {
  const neighborsById = new Map<SourceComponentId, Set<SourceComponentId>>()
  const componentIdsByConnectivityIdentity = new Map<
    ConnectivityIdentity,
    Set<SourceComponentId>
  >()
  for (const trace of index.sourceTraces) {
    const componentIds = new Set<SourceComponentId>()
    for (const portId of trace.connected_source_port_ids) {
      const componentId = index.sourcePortById.get(portId)?.source_component_id
      if (componentId) componentIds.add(componentId)
    }
    const connectivityIdentities = getTraceConnectivityIdentities(trace)
    if (connectivityIdentities.length === 0) {
      connectComponentPair({ neighborsById, componentIds })
      continue
    }
    for (const connectivityIdentity of connectivityIdentities) {
      const connectedComponentIds =
        componentIdsByConnectivityIdentity.get(connectivityIdentity) ??
        new Set()
      for (const componentId of componentIds) {
        connectedComponentIds.add(componentId)
      }
      componentIdsByConnectivityIdentity.set(
        connectivityIdentity,
        connectedComponentIds,
      )
    }
  }
  for (const componentIds of componentIdsByConnectivityIdentity.values()) {
    if (componentIds.size === 2) {
      connectComponentPair({ neighborsById, componentIds })
    }
  }
  return neighborsById
}

function connectComponentPair({
  neighborsById,
  componentIds,
}: {
  neighborsById: Map<SourceComponentId, Set<SourceComponentId>>
  componentIds: ReadonlySet<SourceComponentId>
}): void {
  if (componentIds.size !== 2) return
  const [leftId, rightId] = [...componentIds].sort()
  if (!leftId || !rightId) return
  addNeighbor({ neighborsById, componentId: leftId, neighborId: rightId })
  addNeighbor({ neighborsById, componentId: rightId, neighborId: leftId })
}

function addNeighbor({
  neighborsById,
  componentId,
  neighborId,
}: {
  neighborsById: Map<SourceComponentId, Set<SourceComponentId>>
  componentId: SourceComponentId
  neighborId: SourceComponentId
}): void {
  const neighbors = neighborsById.get(componentId) ?? new Set()
  neighbors.add(neighborId)
  neighborsById.set(componentId, neighbors)
}

function findShortestPath({
  graph,
  startId,
  targetId,
}: {
  graph: ComponentGraph
  startId: SourceComponentId
  targetId: SourceComponentId
}): readonly SourceComponentId[] {
  const queue: SourceComponentId[][] = [[startId]]
  const visitedIds = new Set<SourceComponentId>([startId])
  while (queue.length > 0) {
    const path = queue.shift()
    const tailId = path?.at(-1)
    if (!path || !tailId) continue
    if (tailId === targetId) return path
    const neighbors = [...(graph.get(tailId) ?? [])].sort()
    for (const neighborId of neighbors) {
      if (visitedIds.has(neighborId)) continue
      visitedIds.add(neighborId)
      queue.push([...path, neighborId])
    }
  }
  return []
}
