function BlogHeader({ title, date, link }: { title: string; date: string; link: string }) {

  return (
    <>
      <title>{title}</title>
      <h2> {title} </h2>
      <h4  className="blogheader">
        <span>{link}</span>
        <span>{date}</span>
      </h4>
      <br></br>
    </>
  )
}

export default BlogHeader
