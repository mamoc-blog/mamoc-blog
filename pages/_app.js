import '../styles/global.scss';
import 'katex/dist/katex.min.css';
import { MDXProvider } from '@mdx-js/react';
import Figure from '../components/frames/Figure'

export default function App({ Component, pageProps }) {
  return (
    <MDXProvider>
      <Component {...pageProps} />
    </MDXProvider>
  )
}
