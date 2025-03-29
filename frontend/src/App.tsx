import { DndProvider } from "react-dnd"
import Board from "./components/Board"
import {HTML5Backend} from "react-dnd-html5-backend"

const App = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Board/>
    </DndProvider>
  )
}

export default App