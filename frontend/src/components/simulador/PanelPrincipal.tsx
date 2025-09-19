import React from "react";
import { useNavigate } from "react-router-dom";
import Canvas3D from "./Canvas3D";

const PanelPrincipal: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[#0e1525] p-6 rounded-2xl shadow-lg border border-[#101a32]">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-white mb-6">
        Bienvenido a IReNaTech
      </h1>
      {/* Canvas 3D épico pero contenido y responsivo */}
      <Canvas3D />

      {/* Acciones */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <p className="text-sm text-slate-300/80 leading-relaxed">
          Visualiza mezclas y reacciones con animación 3D en tiempo real.
        </p>

        <div className="flex justify-end">
          <button
            onClick={() => navigate("/simulacion")}
            className="px-5 py-2 rounded-xl border border-cyan-400/70 text-cyan-300 hover:bg-cyan-500 hover:text-[#0b1220] transition shadow-md"
          >
            Ver reacción 3D
          </button>
        </div>
      </div>
    </section>
  );
};

export default PanelPrincipal;