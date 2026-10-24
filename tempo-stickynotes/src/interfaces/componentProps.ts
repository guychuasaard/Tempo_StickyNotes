import type { Ref } from 'react'

export interface Position {
  x: number
  y: number
}

export const NoteStatus = {
  None: 'none',
  Selected: 'selected',
  ToBeDeleted: 'tobedeleted',
} as const

export type NoteStatus = (typeof NoteStatus)[keyof typeof NoteStatus]

export interface Note {
  id: number
  status: NoteStatus
  start: Position
  stop: Position
  text: string
}

export interface TrashAreaProps {
  ref?: Ref<HTMLDivElement>
}
