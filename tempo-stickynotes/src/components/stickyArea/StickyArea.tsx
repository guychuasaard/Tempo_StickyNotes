import { useState, type PointerEvent } from 'react'
import './StickyArea.css'
import StickyNote from '../stickyNote/StickyNote'
import type { Note, Position } from '../../interfaces/componentProps'

const Mode = {
  Idle: 'idle',
  Creating: 'creating',
  Moving: 'moving',
} as const

type Mode = (typeof Mode)[keyof typeof Mode]

function StickyArea() {
  const [focusNote, setFocusNote] = useState<Note | undefined>(undefined)
  const [stickyNotes, setStickyNotes] = useState<Note[]>([])
  

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    //console.log('pointerdown', event.clientX, event.clientY)

    const rect = event.currentTarget.getBoundingClientRect()
    const note = {
      id: Date.now(),
      isFocus: true,
      start: {
        x: event.clientX,
        y: event.clientY,
      } as Position,
      stop: {} as Position,
    } as Note
    setFocusNote(note)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    //console.log('pointermove', event.clientX, event.clientY)
    if (focusNote) {
      const note = focusNote
      note.stop = {
        x: event.clientX,
        y: event.clientY,
      } as Position
    }
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    //console.log('pointerup', event.clientX, event.clientY)

    if (focusNote) {
      const note = focusNote!
      note.stop = {
        x: event.clientX,
        y: event.clientY,
      } as Position
      setStickyNotes([...stickyNotes, note])
      setFocusNote(undefined)
    }
  }

  const identifyNote = (cursorX: number, cursorY: number) => {
    stickyNotes.find((note) => {
      if (
        (note.start.x < cursorX && cursorX < note.stop.x) ||
        (note.start.x > cursorX && cursorX > note.stop.x)
      ) {
        if (
          (note.start.y < cursorY && cursorY < note.stop.y) ||
          (note.start.y > cursorY && cursorY > note.stop.y)
        ) {
          return true
        }
        return false
      }
    })
  }

  return (
    <div
      className="sticky-area"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <StickyNote
        id={1}
        isFocus={false}
        start={{
          x: window.innerWidth / 2 - 25,
          y: window.innerHeight / 2 - 25,
        }}
        stop={{ x: window.innerWidth / 2 + 25, y: window.innerHeight / 2 + 25 }}
      />
    </div>
  )
}

export default StickyArea
