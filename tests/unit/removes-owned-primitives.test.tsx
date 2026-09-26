import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { subtractComponentFromCircuitJson } from "../../lib"
import { createSubtractionTestBoard } from "../fixtures/subtraction-test-board"
import { renderCircuitJson } from "../helpers"

test("subtraction removes owned schematic and PCB primitives", async () => {
  const circuitJson = await renderCircuitJson(createSubtractionTestBoard())
  const result = await subtractComponentFromCircuitJson(circuitJson, {
    componentNames: ["R_EVAL_LEFT"],
  })

  expect(countType(result, "pcb_component")).toBeLessThan(
    countType(circuitJson, "pcb_component"),
  )
  expect(countType(result, "schematic_component")).toBeLessThan(
    countType(circuitJson, "schematic_component"),
  )
})

function countType(circuitJson: CircuitJson, type: string): number {
  return circuitJson.filter((element) => element.type === type).length
}
