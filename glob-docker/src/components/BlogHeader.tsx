function BlogHeader({ title, date, link }: { title: string; date: string; link: string }) {

  return (
    <>
      <title>{title}</title>
      <h2> {title} </h2>
      <h4  className="blogheader">
        <span>
          <p>
            <a href="https://blog.suwuako.com">back</a>
          </p>

          <p>
            <a href={link}>{link}</a>
          </p>
        </span>
        <span>{date}</span>
      </h4>
      <br></br>
    </>
  )
}

export default BlogHeader
