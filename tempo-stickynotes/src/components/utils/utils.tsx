import type { Note, Position } from '../../interfaces/componentProps'

export const CLICK_DISTANCE = 5

export const combineOffset = (target: Position, offset: Position): Position => {
  return {
    x: target.x + offset.x,
    y: target.y + offset.y,
  }
}

export const getOffset = (start: Position, stop: Position): Position => {
  return {
    x: stop.x - start.x,
    y: stop.y - start.y,
  }
}

export const isInside = (
  cursorX: number,
  cursorY: number,
  targetPosition: Position,
  targetSize: Position,
): boolean => {
  if (targetPosition.x < cursorX && cursorX < targetPosition.x + targetSize.x) {
    if (
      targetPosition.y < cursorY &&
      cursorY < targetPosition.y + targetSize.y
    ) {
      return true
    }
  }

  return false
}

export const getLatestNote = (notes: Note[]): Note | undefined => {
  if (notes.length === 0) return undefined
  return notes.reduce((latest, note) => (note.id > latest.id ? note : latest))
}

export const isClick = (
  cursorX: number,
  cursorY: number,
  pointerDownLocation: Position | undefined,
): boolean => {
  return (
    pointerDownLocation !== undefined &&
    Math.abs(cursorX - pointerDownLocation.x) <= CLICK_DISTANCE &&
    Math.abs(cursorY - pointerDownLocation.y) <= CLICK_DISTANCE
  )
}
