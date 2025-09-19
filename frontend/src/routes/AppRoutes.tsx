// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import HomePage from "../pages/HomePage";
import SimulacionPage from "../pages/SimulacionPage";
import ElementosPage from "../pages/ElementosPage";
import UtensiliosPage from "../pages/UtensiliosPage";
import TeoriaPage from "../pages/TeoriaPage";
import ProgresoPage from "../pages/ProgresoPage";
import LoginPage from "../pages/LoginPage";
import ChatIA from "../components/ia/ChatIA";
import DebugPanel from "../components/DebugPanel";

const AppRoutes = () => {
  // Mostrar panel de debug solo en desarrollo
  const showDebugPanel = import.meta.env.MODE === 'development';

  return (
    <>
      <Routes>
        {/* Rutas que requieren el layout con sidebar */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="simulacion" element={<SimulacionPage />} />
          <Route path="elementos" element={<ElementosPage />} />
          <Route path="utensilios" element={<UtensiliosPage />} />
          <Route path="teoria" element={<TeoriaPage />} />
          <Route path="progreso" element={<ProgresoPage />} />
          <Route path="chat-ia" element={<ChatIA />} />
        </Route>
        
        {/* Rutas sin layout (como login) */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Redirección a Home si no existe la ruta */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Panel de debug solo en desarrollo */}
      {showDebugPanel && <DebugPanel />}
    </>
  );
};

export default AppRoutes;