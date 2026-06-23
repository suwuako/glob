import { useNavigate } from "react-router";

function App() {
  let navigate = useNavigate();

  return (
    <>
      <h3> ronnie blog </h3>
      <button onClick={() => {navigate('rustracer')}}> rustracer </button>
    </>
  )
}

export default App
