import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { coldarkCold } from 'react-syntax-highlighter/dist/esm/styles/prism'

function MdRenderer({ content }: { content: string }) {
  return (
    <Markdown
      components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter 
                    language={match[1]} 
                    style={coldarkCold}
                    customStyle={{
                        borderRadius: '6px',
                        padding: '16px',
                        fontSize: '0.875rem',
                      }}
                      codeTagProps={{
                        style: {
                          fontFamily: 'codeblock',
                        }
                      }}>
                    {String(children)}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>{children}</code>
                )
              }
            }}
          >
      {content}
    </Markdown>
  )
}

export default MdRenderer
