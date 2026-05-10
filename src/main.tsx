import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router";
import './index.css'
import App from './App.tsx'
import View from './View.tsx';
import Guide from './Guide.tsx';

// https://reactrouter.com/start/modes#declarative
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      {/* https://reactrouter.com/start/declarative/routing#configuring-routes */}
      <Route index element={<App />} /> {/* another route with 'copy' and 'fork' query params  */}
      <Route path="/guide" element={<Guide />} />
      <Route path="/:id" element={<View />} />
    </Routes>
  </BrowserRouter>,
)
