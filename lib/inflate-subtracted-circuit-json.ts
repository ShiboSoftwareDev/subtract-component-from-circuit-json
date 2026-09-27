import { Board, Circuit } from "@tscircuit/core"
import type { CircuitJson } from "circuit-json"

export async function inflateSubtractedCircuitJson(
  circuitJson: CircuitJson,
): Promise<CircuitJson> {
  const circuit = new Circuit()
  circuit.add(
    new Board({
      circuitJson,
      placementDrcChecksDisabled: true,
    }),
  )
  await circuit.renderUntilSettled()
  return structuredClone(circuit.getCircuitJson())
}
