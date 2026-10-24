import { useRef, useState, type PointerEvent } from 'react'
import './StickyArea.css'
import StickyNote from '../stickyNote/StickyNote'
import {
  NoteStatus,
  type Note,
  type Position,
} from '../../interfaces/componentProps'
import { combineOffset, getOffset, isInside } from '../utils/utils'
import TrashArea from '../trashArea/TrashArea'

const Status = {
  Idle: 'idle',
  Creating: 'creating',
  Editing: 'editing',
  Moving: 'moving',
  Resizing: 'resizing',
} as const

type Status = (typeof Status)[keyof typeof Status]

const EDGE_SIZE = 5

function StickyArea() {
  const [status, setStatus] = useState<Status>(Status.Idle)
  const [stickyNotes, setStickyNotes] = useState<Note[]>([])

  const [focusNote, setFocusNote] = useState<Note | undefined>(undefined)
  const [offSetFromFocusNoteStart, setOffSetFromFocusNoteStart] =
    useState<Position>()

  const trashAreaRef = useRef<HTMLDivElement>(null)

  const getTrashAreaRect = () => {
    return trashAreaRef.current?.getBoundingClientRect()
  }

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
        status: NoteStatus.None,
        start: {
          x: event.clientX,
          y: event.clientY,
        } as Position,
        stop: {} as Position,
      } as Note
      setFocusNote(note)
      addNote(note)
    } else if (updatedStatus === Status.Resizing && allResized.length > 0) {
      const newFocusNote = allResized[allResized.length - 1]
      newFocusNote.status = NoteStatus.Selected
      setFocusNote(newFocusNote)
      updateNoteByID(newFocusNote.id, newFocusNote)
    } else if (updatedStatus === Status.Moving && allFocus.length > 0) {
      const newFocusNote = allFocus[allFocus.length - 1]
      newFocusNote.status = NoteStatus.Selected
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

        if (isCursorInsideTrash(event.clientX, event.clientY)) {
          note.status = NoteStatus.ToBeDeleted
        } else {
          note.status = NoteStatus.Selected
        }
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

      if (status === Status.Creating || status === Status.Resizing) {
        note.stop = {
          x: event.clientX,
          y: event.clientY,
        } as Position
      } else if (
        status === Status.Moving &&
        isCursorInsideTrash(event.clientX, event.clientY)
      ) {
        removeNoteByID(note.id)
        return
      }

      note.status = NoteStatus.None
      updateNoteByID(focusNote.id, note)
      setFocusNote(undefined)
    }
  }

  const updateNoteByID = (targetID: number, updatedNote: Note) => {
    const allNoteClone = [...stickyNotes]
    const targetIndex = allNoteClone.findIndex((n) => n.id === targetID)
    if (targetIndex === -1) return

    allNoteClone[targetIndex] = { ...updatedNote }
    setStickyNotes(allNoteClone)
  }

  const removeNoteByID = (targetID: number) => {
    const allNoteClone = [...stickyNotes]
    setStickyNotes(allNoteClone.filter((n) => n.id !== targetID))
  }

  const addNote = (note: Note) => {
    const allNoteClone = [...stickyNotes, note]
    allNoteClone.sort((note1, note2) => note1.id - note2.id)
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
      const topLeft = {
        x: Math.min(note.start.x, note.stop.x),
        y: Math.min(note.start.y, note.stop.y),
      }
      const size = {
        x: Math.abs(note.stop.x - note.start.x),
        y: Math.abs(note.stop.y - note.start.y),
      }
      return isInside(cursorX, cursorY, topLeft, size)
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

  const isCursorInsideTrash = (cursorX: number, cursorY: number) => {
    const trashArea = getTrashAreaRect()
    if (!trashArea) return false

    return isInside(
      cursorX,
      cursorY,
      { x: trashArea.x, y: trashArea.y },
      { x: trashArea.width, y: trashArea.height },
    )
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
      <TrashArea ref={trashAreaRef} />
    </div>
  )
}

export default StickyArea
