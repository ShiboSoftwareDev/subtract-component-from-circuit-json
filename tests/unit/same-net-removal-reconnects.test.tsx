import { expect, test } from "bun:test"
import { subtractComponentFromCircuitJsonWithDetails } from "../../lib"

test("removing a same-net bridge creates a direct replacement trace", async () => {
  const result = await subtractComponentFromCircuitJsonWithDetails(
    <board width="32mm" height="16mm">
      <resistor
        name="R_LEFT"
        resistance="1k"
        footprint="0402"
        pcbX={-10}
        connections={{ pin2: "net.SIGNAL" }}
      />
      <resistor
        name="R_BRIDGE"
        resistance="100"
        footprint="0402"
        connections={{ pin1: "net.SIGNAL", pin2: "net.SIGNAL" }}
      />
      <resistor
        name="R_RIGHT"
        resistance="1k"
        footprint="0402"
        pcbX={10}
        connections={{ pin1: "net.SIGNAL" }}
      />
    </board>,
    { componentNames: ["R_BRIDGE"] },
  )

  expect(result.addedSourceTraceIds).toHaveLength(1)
  expect(
    result.circuitJson.some(
      (element) =>
        element.type === "pcb_trace" &&
        element.source_trace_id === result.addedSourceTraceIds[0],
    ),
  ).toBe(true)
  expect(
    result.circuitJson.filter((element) => element.type.endsWith("_error")),
  ).toEqual([])
})
