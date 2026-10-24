import type { Note } from '../../interfaces/componentProps'
import './StickyNote.css'

function StickyNote({ start, stop }: Note) {
  return (
    <div
      className="sticky-note"
      style={{
        left: Math.min(start.x, stop.x),
        top: Math.min(start.y, stop.y),
        width: Math.abs(stop.x - start.x),
        height: Math.abs(stop.y - start.y),
      }}
    ></div>
  )
}

export default StickyNote
