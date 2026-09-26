import { test } from "bun:test"
import { expectEvmBeforeAfterSnapshots } from "../expect-evm-before-after-snapshots"
import { loadCircuitJsonFixture } from "../load-circuit-json-fixture"

test("subtracts the indicator bank from BOOSTXL-ULN2003", async () => {
  const circuitJson = await loadCircuitJsonFixture("boostxl-uln2003")
  await expectEvmBeforeAfterSnapshots({
    boardName: "BOOSTXL-ULN2003",
    circuitJson,
    componentNames: ["D1", "R1", "D2", "R7", "D3", "R3", "D4", "R4", "R5"],
    testPath: import.meta.path,
  })
})
