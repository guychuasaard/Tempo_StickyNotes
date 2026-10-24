export interface Position {
  x: number
  y: number
}

export interface Note {
  id: number
  isFocus: boolean
  start: Position
  stop: Position
  text: string
}
