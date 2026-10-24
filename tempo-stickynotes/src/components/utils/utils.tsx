import type { Position } from '../../interfaces/componentProps'

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
