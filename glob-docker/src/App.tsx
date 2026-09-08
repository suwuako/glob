import { useNavigate } from "react-router";

function App() {
  let navigate = useNavigate();

  return (
    <>
      <title>ronie technical blogs</title>
      <h3> ronie technical blogs </h3>

      <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              alignItems: "center",
            }}
      >
        <h4> My musings on (mostly technical) fun, interesting and/or evil computer sciecne topics </h4>
        <button onClick={() => {navigate('rustracer')}}> rustracer </button>
        <button onClick={() => {navigate('tros')}}> uefi boot with rust </button>
        <button onClick={() => {navigate('getting-code-on-an-npu')}}> running code on an npu </button>
      </div>

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
