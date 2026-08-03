import { useNavigate } from "react-router";

function App() {
  let navigate = useNavigate();

  return (
    <>
      <title>ronnie blog</title>
      <h3> ronnie blog </h3>
      <button onClick={() => {navigate('rustracer')}}> rustracer </button>
      <button onClick={() => {navigate('tros')}}> uefi boot with rust </button>
    </>
  )
}

export default App
