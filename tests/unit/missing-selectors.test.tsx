import { expect, test } from "bun:test"
import { subtractComponentFromCircuitJson } from "../../lib"
import { createSubtractionTestBoard } from "../fixtures/subtraction-test-board"
import { renderCircuitJson } from "../helpers"

test("rejects component selectors that do not match", async () => {
  const circuitJson = await renderCircuitJson(createSubtractionTestBoard())

  await expect(
    subtractComponentFromCircuitJson(circuitJson, {
      componentNames: ["DOES_NOT_EXIST"],
    }),
  ).rejects.toThrow("Component selectors did not match")
})
