import MdRenderer from './components/MdRenderer'
import BlogHeader from './components/BlogHeader'
import blog from './blogs/getting-code-on-an-npu.md?raw'

function Rustracer() {
  return (
    <>
      <div className="container">
        <BlogHeader link= "https://github.com/suwuako/npuplayground" title="getting code on an npu" date="4/09/2026" />
        <MdRenderer content={blog} />
      </div>
    </>
  )
}

export default Rustracer
