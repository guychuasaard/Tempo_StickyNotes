import type { TrashAreaProps } from '../../interfaces/componentProps'
import './TrashArea.css'

function TrashArea(props: TrashAreaProps) {
  return (
    <div ref={props.ref} className="trash-area">
      <h1>Trash</h1>
    </div>
  )
}

export default TrashArea
