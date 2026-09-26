import type { CircuitJson } from "circuit-json"
import type { ReactElement } from "react"

export type SubtractInput = CircuitJson | ReactElement

export interface SubtractComponentOptions {
  componentNames?: readonly string[]
  sourceComponentIds?: readonly string[]
  includeComponentsBetween?: boolean
  preserveNetConnectivity?: boolean
}

export interface SubtractResultDetails {
  circuitJson: CircuitJson
  removedComponentNames: readonly string[]
  removedSourceComponentIds: readonly string[]
  addedSourceTraceIds: readonly string[]
}

export type ElementId = string
export type SourceComponentId = string
export type SourcePortId = string
export type SourceTraceId = string
