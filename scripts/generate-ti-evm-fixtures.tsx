import "@tscircuit/core"
import { mkdir } from "node:fs/promises"
import BassensorsBoard from "@tsci/tscircuit.boosters/boostxl-bassensors/index.circuit"
import Rs232Board from "@tsci/tscircuit.boosters/boostxl-rs232/index.circuit"
import Tmp107Board from "@tsci/tscircuit.boosters/boostxl-tmp107/index.circuit"
import Uln2003Board from "@tsci/tscircuit.boosters/boostxl-uln2003/index.circuit"
import { Circuit } from "@tscircuit/core"
import type { ComponentType } from "react"

const fixtureDirectory = `${import.meta.dir}/../tests/fixtures/ti-evm`
const fixtures: readonly {
  Board: ComponentType
  fixtureName: string
}[] = [
  { Board: BassensorsBoard, fixtureName: "boostxl-bassensors" },
  { Board: Rs232Board, fixtureName: "boostxl-rs232" },
  { Board: Tmp107Board, fixtureName: "boostxl-tmp107" },
  { Board: Uln2003Board, fixtureName: "boostxl-uln2003" },
]

await mkdir(fixtureDirectory, { recursive: true })
for (const fixture of fixtures) {
  const circuit = new Circuit()
  circuit.add(<fixture.Board />)
  await circuit.renderUntilSettled()
  const fixturePath = `${fixtureDirectory}/${fixture.fixtureName}.circuit.json`
  await Bun.write(fixturePath, `${JSON.stringify(circuit.getCircuitJson())}\n`)
  console.log(`Wrote ${fixturePath}`)
}
