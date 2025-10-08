// src/components/layout/Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  FlaskConical,
  BookOpen,
  Hammer,
  FileText,
  TrendingUp,
} from "lucide-react";
import logo from '../../assets/icons/logo.png';

type NavItem = {
  to: string;
  label: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
};

const navItems: NavItem[] = [
  { to: "/", label: "Inicio", Icon: Home },
  { to: "/simulacion", label: "Simulaciones", Icon: FlaskConical },
  { to: "/elementos", label: "Elementos", Icon: BookOpen },
  { to: "/utensilios", label: "Utensilios", Icon: Hammer },
  { to: "/teoria", label: "Teoría", Icon: FileText },
  { to: "/progreso", label: "Mi progreso", Icon: TrendingUp },
];

const Sidebar: React.FC = () => {
  return (
    <aside
      role="navigation"
      aria-label="Menú principal"
      className="w-64 min-w-[16rem] bg-[#081122] text-white h-screen flex flex-col fixed left-0 top-0 z-30 border-r border-[#0f1724]"
    >
      {/* Header - Fixed */}
      <div className="px-6 py-6 border-b border-[#0f1724] flex items-center gap-3 flex-shrink-0">
        <img
          src={logo}
          alt="IRenATech logo"
          className="w-9 h-9 object-contain"
          onError={(e) => {
            // si falla, ocultamos la imagen (o podrías asignar un fallback)
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <span className="text-cyan-400 font-semibold text-lg">IReNaTech</span>
      </div>

      {/* Nav items - Scrollable */}
      <nav className="px-2 py-6 flex-1 overflow-y-auto scrollbar-hide" aria-label="Enlaces principales">
        <ul className="space-y-1">
          {navItems.map(({ to, label, Icon }) => (
            <li key={to} className="relative">
              <NavLink to={to} end className="block">
                {({ isActive }) => (
                  <div
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer group
                      ${isActive 
                        ? "bg-[#0a1a2e] text-cyan-400 shadow-lg shadow-cyan-400/10 border border-cyan-400/20" 
                        : "text-gray-300 hover:bg-[#0d1722] hover:text-white hover:shadow-md"
                      }
                    `}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {/* Active indicator (barra a la izquierda) */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 transform -translate-y-1/2 h-6 w-1 bg-cyan-400 rounded-r-md" />
                    )}

                    <Icon 
                      className={`w-5 h-5 transition-colors duration-200 ${
                        isActive ? "text-cyan-400" : "text-gray-300 group-hover:text-white"
                      }`} 
                      aria-hidden="true"
                    />
                    <span className={`text-sm font-medium transition-colors duration-200 ${
                      isActive ? "text-cyan-400" : "text-gray-300 group-hover:text-white"
                    }`}>
                      {label}
                    </span>

                    {/* Hover effect */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg" />
                    )}
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer - Fixed */}
      <div className="px-6 py-4 border-t border-[#0f1724] text-gray-400 text-sm flex-shrink-0">
        <div className="flex items-center justify-center">
          <span>© {new Date().getFullYear()} IReNaTech</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
