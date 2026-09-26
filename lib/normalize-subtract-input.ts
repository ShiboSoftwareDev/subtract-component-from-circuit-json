import { Circuit } from "@tscircuit/core"
import type { CircuitJson } from "circuit-json"
import type { SubtractInput } from "./types"

export async function normalizeSubtractInput(
  source: SubtractInput,
): Promise<CircuitJson> {
  if (Array.isArray(source)) return structuredClone(source)

  const circuit = new Circuit()
  circuit.add(source)
  await circuit.renderUntilSettled()
  return structuredClone(circuit.getCircuitJson())
}
