import { test } from "bun:test"
import { expectEvmBeforeAfterSnapshots } from "../expect-evm-before-after-snapshots"
import { loadCircuitJsonFixture } from "../load-circuit-json-fixture"

test("subtracts the status LEDs from BOOSTXL-RS232", async () => {
  const circuitJson = await loadCircuitJsonFixture("boostxl-rs232")
  await expectEvmBeforeAfterSnapshots({
    boardName: "BOOSTXL-RS232",
    circuitJson,
    componentNames: [
      "R6",
      "D1",
      "R7",
      "D2",
      "D3",
      "R8",
      "D4",
      "D5",
      "R9",
      "D6",
      "D7",
      "R10",
      "D8",
      "D9",
    ],
    testPath: import.meta.path,
  })
})
