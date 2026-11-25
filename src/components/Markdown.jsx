import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const components = {
  a: ({ node, ...p }) => <a {...p} target="_blank" rel="noopener noreferrer" />,
  table: ({ node, ...p }) => (
    <div className="overflow-x-auto">
      <table {...p} />
    </div>
  ),
}

export default function Markdown({ children }) {
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children || ''}
      </ReactMarkdown>
    </div>
  )
}
