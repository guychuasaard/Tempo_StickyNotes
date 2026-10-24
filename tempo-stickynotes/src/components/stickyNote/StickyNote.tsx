import type { Note } from '../../interfaces/componentProps'
import './StickyNote.css'

type StickyNoteProps = Note

function StickyNote({ start, stop, ref }: StickyNoteProps) {
  return (
    <div
      ref={ref}
      className="sticky-note"
      style={{
        transform: `translate(${Math.min(start.x, stop.x)}px, ${Math.min(start.y, stop.y)}px)`,
        width: Math.abs(stop.x - start.x),
        height: Math.abs(stop.y - start.y),
      }}
    ></div>
  )
}

export default StickyNote
