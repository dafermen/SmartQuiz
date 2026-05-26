import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"

/**
 * Root React component.
 *
 * @returns {JSX.Element}
 */
function App() {
  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App 
