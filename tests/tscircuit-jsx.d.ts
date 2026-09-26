import type {
  BoardProps,
  ChipProps,
  ResistorProps,
  TraceProps,
} from "@tscircuit/props"

interface TestCircuitElements {
  board: BoardProps
  chip: ChipProps
  resistor: ResistorProps
  trace: TraceProps
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends TestCircuitElements {}
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends TestCircuitElements {}
  }
}
