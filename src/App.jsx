import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./Layout/Layout";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
