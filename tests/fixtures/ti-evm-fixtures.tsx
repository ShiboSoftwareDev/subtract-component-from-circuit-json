import "@tscircuit/core"
import type { ReactElement } from "react"

export interface TiEvmFixture {
  boardName: string
  chipName: string
  inputKind: "tsx" | "circuit-json"
}

export const tiEvmFixtures = [
  {
    boardName: "LM5158EVM-BST",
    chipName: "LM5158",
    inputKind: "tsx",
  },
  {
    boardName: "LM5177EVM-HP",
    chipName: "LM5177",
    inputKind: "circuit-json",
  },
  {
    boardName: "TPS6287xEVM",
    chipName: "TPS62873",
    inputKind: "tsx",
  },
  {
    boardName: "TMDS62LEVM",
    chipName: "AM62L",
    inputKind: "circuit-json",
  },
] as const satisfies readonly TiEvmFixture[]

export const removedFixtureNames = [
  "R0_BYPASS",
  "R_EVAL_LEFT",
  "R_EVAL_RIGHT",
] as const

export function createTiEvmBoard(fixture: TiEvmFixture): ReactElement {
  return (
    <board width="38mm" height="22mm">
      <chip
        name="U1"
        manufacturerPartNumber={fixture.chipName}
        footprint="soic8"
        pinLabels={{ pin1: "VIN", pin2: "SW", pin3: "GND", pin4: "FB" }}
        pcbX={9}
        pcbY={2}
        schX={8}
        schY={2}
      />
      <resistor
        name="R_INPUT"
        resistance="10k"
        footprint="0402"
        pcbX={-13}
        pcbY={2}
        schX={-10}
        schY={2}
      />
      <resistor
        name="R0_BYPASS"
        resistance="0"
        footprint="0402"
        pcbX={-2}
        pcbY={2}
        schX={-1}
        schY={2}
      />
      <resistor
        name="R_CORE"
        resistance="47k"
        footprint="0402"
        pcbX={14}
        pcbY={-5}
        schX={13}
        schY={-3}
      />
      <resistor
        name="R_EVAL_LEFT"
        resistance="1k"
        footprint="0402"
        pcbX={-12}
        pcbY={-6}
        schX={-9}
        schY={-4}
      />
      <resistor
        name="R_EVAL_MIDDLE"
        resistance="2k"
        footprint="0402"
        pcbX={-5}
        pcbY={-6}
        schX={-3}
        schY={-4}
      />
      <resistor
        name="R_EVAL_RIGHT"
        resistance="3k"
        footprint="0402"
        pcbX={2}
        pcbY={-6}
        schX={3}
        schY={-4}
      />
      <trace
        name="VIN_IN"
        from=".R_INPUT > .pin2"
        to=".R0_BYPASS > .pin1"
        pcbStraightLine
      />
      <trace
        name="VIN_LINK"
        from=".R0_BYPASS > .pin2"
        to=".U1 > .VIN"
        pcbStraightLine
      />
      <trace
        name="SW_CORE"
        from=".U1 > .SW"
        to=".R_CORE > .pin1"
        pcbStraightLine
      />
      <trace
        name="EVAL_LEFT"
        from=".R_EVAL_LEFT > .pin2"
        to=".R_EVAL_MIDDLE > .pin1"
        pcbStraightLine
      />
      <trace
        name="EVAL_RIGHT"
        from=".R_EVAL_MIDDLE > .pin2"
        to=".R_EVAL_RIGHT > .pin1"
        pcbStraightLine
      />
    </board>
  )
}
