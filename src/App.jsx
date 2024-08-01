import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CameraComponent from './components/Cameracomponent'
import SingleComponent from './components/Cameracomponent'

function App() {
  const [count, setCount] = useState(0)
  const [camon,setCamon]=useState(false)
  return (
    <>
    {camon &&
    <SingleComponent/>}
    {!camon &&
    <button onClick={()=>setCamon(true)}> Turn on camera</button>
    }
    </>
  )
}

export default App
