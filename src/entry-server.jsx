import { renderToString } from 'react-dom/server'
import App from '@/App'

export function render(content) {
  return renderToString(<App content={content} />)
}
