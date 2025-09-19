import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Sidebar from "./components/layout/Sidebar";

const App = () => {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-900 text-white">
        {/* Sidebar fijo */}
        <Sidebar />

        {/* Contenido principal */}
        <main className="flex-1 p-6 overflow-y-auto">
          <AppRoutes />
        </main>
      </div>
    </Router>
  );
};

export default App;
