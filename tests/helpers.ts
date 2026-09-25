import { Circuit } from "@tscircuit/core"
import type { CircuitJson } from "circuit-json"
import type { ReactElement } from "react"

export async function renderCircuitJson(
  element: ReactElement,
): Promise<CircuitJson> {
  const circuit = new Circuit()
  circuit.add(element)
  await circuit.renderUntilSettled()
  return circuit.getCircuitJson()
}

export function getSourceComponentNames(
  circuitJson: CircuitJson,
): readonly string[] {
  return circuitJson
    .filter((element) => element.type === "source_component")
    .map((component) => component.name)
}
