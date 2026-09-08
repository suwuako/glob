import { useNavigate } from "react-router";

interface BlogPost {
  title: string;
  path: string;
  date: string;
  summary: string;
}

const posts: BlogPost[] = [
  {
    title: "rustracer",
    path: "rustracer",
    date: "24/06/2026",
    summary: "A 3D raytracer written in Rust from scratch following Ray Tracing in One Weekend.",
  },
  {
    title: "uefi boot with rust",
    path: "tros",
    date: "3/8/2026",
    summary: "Booting a Rust kernel directly with UEFI without needing a bootloader.",
  },
  {
    title: "running code on an npu",
    path: "getting-code-on-an-npu",
    date: "4/09/2026",
    summary: "Exploring AMD Ryzen AI NPU architecture and running code on an NPU chip.",
  },
];

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
        {posts.map((post) => (
          <button
            key={post.path}
            onClick={() => {
              navigate(post.path);
            }}
            style={{
              cursor: "pointer",
              padding: "8px 12px",
              width: "100%",
              maxWidth: "500px",
              textAlign: "left",
            }}
          >
            <div>
              <strong>{post.title}</strong> - <span>{post.date}</span>
            </div>
            <div>{post.summary}</div>
          </button>
        ))}
      </div>

      <iframe
        src="https://mrrrp.cat/ring/blog.suwuako.com/iframe"
        title="mrrrp.cat webring"
        loading="lazy"
        style={{
          display: 'block',
          width: '100%',
          height: '56px',
          margin: '0 auto',
          border: '0'
        }}
      >
      </iframe>
    </>
  );
}

export default App;

