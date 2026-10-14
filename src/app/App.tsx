
import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { Dashboard } from "../components/dashboard/Dashboard";

const BoardPage = lazy(
  () => import("../components/board/BoardPage")
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<p className="page-loading">Loading page...</p>}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/boards/:boardId" element={<BoardPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
