import { expect, test } from "bun:test"
import { subtractComponentFromCircuitJsonWithDetails } from "../../lib"
import { createSubtractionTestBoard } from "../fixtures/subtraction-test-board"
import { renderCircuitJson } from "../helpers"

test("ordinary resistors are not silently shorted", async () => {
  const circuitJson = await renderCircuitJson(createSubtractionTestBoard())
  const result = await subtractComponentFromCircuitJsonWithDetails(
    circuitJson,
    {
      componentNames: ["R_INPUT"],
    },
  )

  expect(result.addedSourceTraceIds).toEqual([])
})
