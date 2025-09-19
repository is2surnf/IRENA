// src/components/layout/Layout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Contenido principal: dejamos espacio para el sidebar con ml-64.
          Usamos min-h-screen + overflow-auto para permitir scroll dentro del contenido
          sin bloquear la navegación ni superponer el sidebar. */}
      <main className="flex-1 ml-64 min-h-screen overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
