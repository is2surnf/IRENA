import { useNavigate } from "react-router-dom";
import PanelPrincipal from "../components/home/PanelPrincipal";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col flex-1 p-8 space-y-8">
      {/* Panel Principal */}
      <PanelPrincipal></PanelPrincipal>

      {/* Panel de Consultar IA */}
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Asistente de IA
          </h2>
          <p className="text-gray-400">
            Consulta a la inteligencia artificial para comprender mejor las
            reacciones químicas.
          </p>
        </div>

        <button
          onClick={() => navigate("/chat-ia")}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded-xl transition-all duration-300 shadow-md"
        >
          Consultar IA
        </button>
      </div>
    </div>
  );
};

export default HomePage;