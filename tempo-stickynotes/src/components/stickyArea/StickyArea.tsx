import { useState, type PointerEvent } from 'react'
import './StickyArea.css'
import StickyNote from '../stickyNote/StickyNote'
import type { Note, Position } from '../../interfaces/componentProps'
import { combineOffset, getOffset } from '../utils/utils'

const Status = {
  Idle: 'idle',
  Creating: 'creating',
  Editing: 'editing',
  Moving: 'moving',
  Resizing: 'resizing',
} as const

type Status = (typeof Status)[keyof typeof Status]

const EDGE_SIZE = 10

function StickyArea() {
  const [status, setStatus] = useState<Status>(Status.Idle)
  const [stickyNotes, setStickyNotes] = useState<Note[]>([])

  const [focusNote, setFocusNote] = useState<Note | undefined>(undefined)
  const [offSetFromFocusNoteStart, setOffSetFromFocusNoteStart] =
    useState<Position>()

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)

    const {
      status: updatedStatus,
      allResized,
      allFocus,
    } = updateStatus(event.clientX, event.clientY)

    if (updatedStatus === Status.Creating) {
      const note = {
        id: Date.now(),
        isSelect: false,
        start: {
          x: event.clientX,
          y: event.clientY,
        } as Position,
        stop: {} as Position,
      } as Note
      setFocusNote(note)
    } else if (updatedStatus === Status.Resizing && allResized.length > 0) {
      const newFocusNote = allResized[0]
      newFocusNote.isSelect = true
      setFocusNote(newFocusNote)
      updateNoteByID(newFocusNote.id, newFocusNote)
    } else if (updatedStatus === Status.Moving && allFocus.length > 0) {
      const newFocusNote = allFocus[0]
      newFocusNote.isSelect = true
      setOffSetFromFocusNoteStart(
        getOffset({ x: event.clientX, y: event.clientY }, newFocusNote.start),
      )
      setFocusNote(newFocusNote)
      updateNoteByID(newFocusNote.id, newFocusNote)
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    if (focusNote) {
      const note = focusNote
      if (status === Status.Moving) {
        const offSetBettweenNoteStartStop = getOffset(note.start, note.stop)
        note.start = combineOffset(offSetFromFocusNoteStart!, {
          x: event.clientX,
          y: event.clientY,
        })
        note.stop = combineOffset(note.start, offSetBettweenNoteStartStop)
      } else {
        note.stop = {
          x: event.clientX,
          y: event.clientY,
        } as Position
      }
      setFocusNote(note)
      updateNoteByID(note.id, note)
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
      } else if (status === Status.Resizing) {
        note.isSelect = false
        updateNoteByID(focusNote.id, note)
        setFocusNote(undefined)
      }
    }
  }

  const updateNoteByID = (targetID: number, updatedNote: Note) => {
    const allNoteClone = [...stickyNotes]
    const targetIndex = allNoteClone.findIndex((n) => n.id === targetID)
    if (targetIndex === -1) return

    allNoteClone[targetIndex] = { ...updatedNote }
    setStickyNotes(allNoteClone)
  }

  const updateStatus = (
    cursorX: number,
    cursorY: number,
  ): { status: Status; allFocus: Note[]; allResized: Note[] } => {
    const targetingResult = identifyNote(cursorX, cursorY)
    let newStatus: Status = Status.Creating

    if (targetingResult.allResized.length > 0) {
      newStatus = Status.Resizing
    } else if (targetingResult.allFocus.length > 0) {
      newStatus = Status.Moving
    }
    setStatus(newStatus)
    return { status: newStatus, ...targetingResult }
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

    const allResizedNote = stickyNotes.filter((note) => {
      const left = Math.min(note.start.x, note.stop.x)
      const right = Math.max(note.start.x, note.stop.x)
      const top = Math.min(note.start.y, note.stop.y)
      const bottom = Math.max(note.start.y, note.stop.y)

      const inOuterBox =
        cursorX >= left - EDGE_SIZE &&
        cursorX <= right + EDGE_SIZE &&
        cursorY >= top - EDGE_SIZE &&
        cursorY <= bottom + EDGE_SIZE

      const inInnerBox =
        cursorX > left + EDGE_SIZE &&
        cursorX < right - EDGE_SIZE &&
        cursorY > top + EDGE_SIZE &&
        cursorY < bottom - EDGE_SIZE

      return inOuterBox && !inInnerBox
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
      {stickyNotes.map((note: Note) => {
        return <StickyNote key={note.id} {...note} />
      })}
    </div>
  )
}

export default StickyArea
