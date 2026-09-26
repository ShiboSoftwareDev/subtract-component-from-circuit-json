import type { CircuitJson } from "circuit-json"

export async function loadCircuitJsonFixture(
  fixtureName: string,
): Promise<CircuitJson> {
  const fixturePath = `${import.meta.dir}/fixtures/ti-evm/${fixtureName}.circuit.json`
  const circuitJson: CircuitJson = await Bun.file(fixturePath).json()
  return circuitJson
}
