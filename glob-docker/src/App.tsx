import { useNavigate } from "react-router";

function App() {
  let navigate = useNavigate();

  return (
    <>
      <title>ronnie blog</title>
      <h3> ronnie blog </h3>
      <button onClick={() => {navigate('rustracer')}}> rustracer </button>
      <button onClick={() => {navigate('tros')}}> uefi boot with rust </button>

          <iframe src="https://mrrrp.cat/ring/blog.suwuako.com/iframe"
              title="mrrrp.cat webring"
              loading="lazy"
              style={{
                display: 'block',
                width: '100%',
                height: '56px',
                margin: '0 auto',
                border: '0'
              }}>
          </iframe>
    </>
  )
}

export default App
