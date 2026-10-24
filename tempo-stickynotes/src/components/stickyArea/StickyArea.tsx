import { useState, type PointerEvent } from 'react'
import './StickyArea.css'
import StickyNote from '../stickyNote/StickyNote'
import type { Note, Position } from '../../interfaces/componentProps'

const Status = {
  Idle: 'idle',
  Creating: 'creating',
  Editing: 'Editing',
  Moving: 'moving',
  Resizing: 'resizing',
} as const

type Status = (typeof Status)[keyof typeof Status]

const EDGE_SIZE = 8

function StickyArea() {
  const [status, setStatus] = useState<Status>(Status.Idle)
  const [focusNote, setFocusNote] = useState<Note | undefined>(undefined)
  const [stickyNotes, setStickyNotes] = useState<Note[]>([])

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)

    const updatedStatus = updateStatus(event.clientX, event.clientY)

    if (updatedStatus === Status.Creating) {
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
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    if (focusNote) {
      const note = focusNote
      note.stop = {
        x: event.clientX,
        y: event.clientY,
      } as Position
    }
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (focusNote) {
      const note = focusNote!
      note.stop = {
        x: event.clientX,
        y: event.clientY,
      } as Position

      if (status === Status.Creating) {
        setStickyNotes([...stickyNotes, note])
        setFocusNote(undefined)
      }
    }
  }

  const updateStatus = (cursorX: number, cursorY: number) => {
    const targetingResult = identifyNote(cursorX, cursorY)
    let newStatus: Status = Status.Creating

    if (targetingResult.allResized.length > 0) {
      newStatus = Status.Resizing
    } else if (targetingResult.allFocus.length > 0) {
      newStatus = Status.Moving
    }
    setStatus(newStatus)
    return newStatus
  }

  const identifyNote = (
    cursorX: number,
    cursorY: number,
  ): { allFocus: Note[]; allResized: Note[] } => {
    const allFocusNote = stickyNotes.filter((note) => {
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

    const allResizedNote = allFocusNote.filter((note) => {
      const left = Math.min(note.start.x, note.stop.x)
      const right = Math.max(note.start.x, note.stop.x)
      const top = Math.min(note.start.y, note.stop.y)
      const bottom = Math.max(note.start.y, note.stop.y)

      return (
        cursorX - left <= EDGE_SIZE ||
        right - cursorX <= EDGE_SIZE ||
        cursorY - top <= EDGE_SIZE ||
        bottom - cursorY <= EDGE_SIZE
      )
    })

    return {
      allFocus: allFocusNote,
      allResized: allResizedNote,
    }
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
        text={''}
      />

      {stickyNotes.map((note: Note) => {
        return <StickyNote key={note.id} {...note} />
      })}
    </div>
  )
}

export default StickyArea
