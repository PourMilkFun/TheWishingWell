import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SolanaProvider } from './wallet/SolanaProvider'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Launches } from './pages/Launches'
import { Launch } from './pages/Launch'
import { Inspect } from './pages/Inspect'
import { Mechanics } from './pages/Mechanics'
import { Docs, DocsIndexRedirect } from './pages/Docs'

export default function App() {
  return (
    <SolanaProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="launches" element={<Launches />} />
            <Route path="launch" element={<Launch />} />
            <Route path="coin/:id" element={<Inspect />} />
            <Route path="mechanics" element={<Mechanics />} />
            <Route path="docs" element={<DocsIndexRedirect />} />
            <Route path="docs/:slug" element={<Docs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SolanaProvider>
  )
}
