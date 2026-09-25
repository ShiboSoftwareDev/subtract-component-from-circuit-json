import type {
  BoardProps,
  ChipProps,
  ResistorProps,
  TraceProps,
} from "@tscircuit/props"

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      board: BoardProps
      chip: ChipProps
      resistor: ResistorProps
      trace: TraceProps
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      board: BoardProps
      chip: ChipProps
      resistor: ResistorProps
      trace: TraceProps
    }
  }
}
