function BlogHeader({ title, date, link }: { title: string; date: string; link: string }) {

  return (
    <>
      <title>{title}</title>
      <h1> {title} </h1>
      <h2  className="blogheader">
        <span>{link}</span>
        <span>{date}</span>
      </h2>
    </>
  )
}

export default BlogHeader
