import { StrictMode } from 'react'
import { BrowserRouter, Routes, Route } from "react-router";
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Tros from './tros.tsx'
import Getting_code_from_an_npu from './getting-code-on-an-npu.tsx'
import Rustracer from './rustracer.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<App />} />
        <Route path="rustracer" element={<Rustracer />} />
        <Route path="tros" element={<Tros />} />
        <Route path="getting-code-on-an-npu" element={<Getting_code_from_an_npu />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,

)
