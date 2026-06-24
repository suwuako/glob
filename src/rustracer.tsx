import MdRenderer from './components/MdRenderer'
import BlogHeader from './components/BlogHeader'
import blog from './blogs/rustracer.md?raw'

function Rustracer() {
  return (
    <>
      <div className="container">
        <BlogHeader link= "https://github.com/suwuako/rustracer" title="I WANT TO WRITE A RAYTRACER!!" date="24/06/2026" />
        <MdRenderer content={blog} />
      </div>
    </>
  )
}

export default Rustracer
