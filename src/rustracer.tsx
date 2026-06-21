import Markdown from 'react-markdown'
// import css from './rustracer.css'
import blog from './blogs/rustracer.md?raw'

function Rustracer() {
  return (
    <>
      <p> rustracer </p>
      <Markdown>{blog}</Markdown>
    </>
  )
}

export default Rustracer
