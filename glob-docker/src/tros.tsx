import MdRenderer from './components/MdRenderer'
import BlogHeader from './components/BlogHeader'
import blog from './blogs/tros.md?raw'

function Tros() {
  return (
    <>
      <div className="container">
        <BlogHeader link= "https://github.com/suwuako/tros" title="i (no longer) hate bootloaders" date="3/8/2026" />
        <MdRenderer content={blog} />
      </div>
    </>
  )
}

export default Tros
