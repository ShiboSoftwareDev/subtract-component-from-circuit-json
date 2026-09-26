import { expect, test } from "bun:test"
import { subtractComponentFromCircuitJson } from "../../lib"
import { createSubtractionTestBoard } from "../fixtures/subtraction-test-board"
import { renderCircuitJson } from "../helpers"

test("does not mutate Circuit JSON", async () => {
  const circuitJson = await renderCircuitJson(createSubtractionTestBoard())
  const originalText = JSON.stringify(circuitJson)

  await subtractComponentFromCircuitJson(circuitJson, {
    componentNames: ["R0_BYPASS"],
  })

  expect(JSON.stringify(circuitJson)).toBe(originalText)
})
