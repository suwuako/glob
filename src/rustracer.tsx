import MdRenderer from './components/MdRenderer'
// import css from './rustracer.css'
import blog from './blogs/rustracer.md?raw'

function Rustracer() {
  return (
    <div className="container">
      <MdRenderer content={blog} />
    </div>
  )
}

export default Rustracer
