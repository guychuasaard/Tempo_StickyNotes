import type { Note } from '../../interfaces/componentProps'
import './StickyNote.css'

function StickyNote({ start, stop, status }: Note) {
  return (
    <div
      className={`sticky-note ${status}`}
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
