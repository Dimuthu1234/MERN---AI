import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ChatWidget from "./components/ChatWidget.jsx";
import Home from "./pages/Home.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <ChatWidget />
    </div>
  );
}
