-- 1. ELIMINAR TODOS LOS DATOS EXISTENTES
TRUNCATE TABLE elemento;

-- 2. INSERTAR SOLO DATOS ÚNICOS (26 registros)
INSERT INTO elementos_quimicos 
(id_elemento, nombre, simbolo, numero_atomico, masa_atomica, densidad, estado, descripcion, categoria, imagen_url)
VALUES
-- Elementos (47-60)
(47, 'Hidrógeno', 'H', 1, 1.01, 0.09, 'Gas', 'Gas inflamable, base de reacciones de combustión', 'No metales', 'hidrogeno.png'),
(48, 'Oxígeno', 'O', 8, 16.00, 1.43, 'Gas', 'Esencial para combustión y oxidación', 'No metales', 'oxigeno.png'),
(49, 'Nitrógeno', 'N', 7, 14.01, 1.25, 'Gas', 'Gas inerte, útil para simulaciones atmosféricas', 'No metales', 'nitrogeno.png'),
(50, 'Cloro', 'Cl', 17, 35.45, 3.21, 'Gas', 'No metal reactivo, base para sales como NaCl', 'Gases y Halógenos', 'cloro.png'),
(51, 'Carbono', 'C', 6, 12.01, 2.27, 'Sólido', 'En forma de grafito o carbón, útil en combustión', 'No metales', 'carbono.png'),
(52, 'Azufre', 'S', 16, 32.06, 2.07, 'Sólido', 'Sólido amarillento, reacciona con oxígeno y metales', 'No metales', 'azufre.png'),
(53, 'Sodio', 'Na', 11, 22.99, 0.97, 'Sólido', 'Metal muy reactivo con agua, base para NaOH', 'Metales', 'sodio.png'),
(54, 'Potasio', 'K', 19, 39.10, 0.86, 'Sólido', 'Aún más reactivo que el sodio', 'Metales', 'potasio.png'),
(55, 'Magnesio', 'Mg', 12, 24.31, 1.74, 'Sólido', 'Arde con llama blanca, útil en demostraciones', 'Metales', 'magnesio.png'),
(56, 'Calcio', 'Ca', 20, 40.08, 1.55, 'Sólido', 'Presente en cal, reacciona con agua', 'Metales', 'calcio.png'),
(57, 'Hierro', 'Fe', 26, 55.85, 7.87, 'Sólido', 'Base de la corrosión y formación de óxidos', 'Metales', 'hierro.png'),
(58, 'Cobre', 'Cu', 29, 63.55, 8.96, 'Sólido', 'Útil para reacciones de desplazamiento y electrólisis', 'Metales', 'cobre.png'),
(59, 'Zinc', 'Zn', 30, 65.38, 7.13, 'Sólido', 'Reacciona con ácidos liberando hidrógeno', 'Metales', 'zinc.png'),
(60, 'Aluminio', 'Al', 13, 26.98, 2.70, 'Sólido', 'Resistencia a corrosión, reacciones con ácidos', 'Metales', 'aluminio.png'),

-- Ácidos (61-64)
(61, 'Ácido clorhídrico', 'HCl', NULL, 36.46, 1.49, 'Líquido', 'Ácido fuerte, reacciona con metales y bases', 'Ácidos', 'acido_clorhidrico.png'),
(62, 'Ácido sulfúrico', 'H₂SO₄', NULL, 98.08, 1.84, 'Líquido', 'Ácido fuerte, base de muchas reacciones', 'Ácidos', 'acido_sulfurico.png'),
(63, 'Ácido nítrico', 'HNO₃', NULL, 63.01, 1.51, 'Líquido', 'Oxidante fuerte, reacciona con metales', 'Ácidos', 'acido_nitrico.png'),
(64, 'Ácido acético', 'CH₃COOH', NULL, 60.05, 1.05, 'Líquido', 'Ácido débil, presente en vinagre', 'Ácidos', 'acido_acetico.png'),

-- Bases (65-67)
(65, 'Hidróxido de sodio', 'NaOH', NULL, 40.00, 2.13, 'Sólido', 'Base fuerte, reacciona con ácidos', 'Bases', 'hidroxido_sodio.png'),
(66, 'Hidróxido de potasio', 'KOH', NULL, 56.11, 2.04, 'Sólido', 'Base fuerte, similar a NaOH', 'Bases', 'hidroxido_potasio.png'),
(67, 'Amoniaco', 'NH₃', NULL, 17.03, 0.73, 'Gas', 'Base débil, usado en limpieza y fertilizantes', 'Bases', 'amoniaco.png'),

-- Sales (68-72)
(68, 'Cloruro de sodio', 'NaCl', NULL, 58.44, 2.17, 'Sólido', 'Sal común, soluble en agua', 'Sales', 'cloruro_sodio.png'),
(69, 'Sulfato de cobre', 'CuSO₄', NULL, 159.61, 3.60, 'Sólido', 'Color azul, reacciones de hidratación', 'Sales', 'sulfato_cobre.png'),
(70, 'Carbonato de calcio', 'CaCO₃', NULL, 100.09, 2.71, 'Sólido', 'Presente en piedra caliza y mármol', 'Sales', 'carbonato_calcio.png'),
(71, 'Nitrato de potasio', 'KNO₃', NULL, 101.10, 2.11, 'Sólido', 'Usado en pólvora y fertilizantes', 'Sales', 'nitrato_potasio.png'),
(72, 'Sulfato de sodio', 'Na₂SO₄', NULL, 142.04, 2.66, 'Sólido', 'Sal neutra, útil en simulaciones', 'Sales', 'sulfato_sodio.png');

-- INSERT para tabla utensilio
INSERT INTO utensilio 
(id_utensilio, nombre, descripcion, capacidad, tipo, imagen_url) 
VALUES
(1, 'Vasos de precipitados', 'Recipientes para mezclar, calentar y contener líquidos', NULL, 'Vidriería y plásticos', 'vasos_de_precipitados.png'),
(2, 'Matraces Erlenmeyer', 'Matraces cónicos para mezclas y titulaciones', NULL, 'Vidriería y plásticos', 'matraces_erlenmeyer.png'),
(3, 'Probetas graduadas', 'Cilindros para medir volúmenes de líquidos', NULL, 'Vidriería y plásticos', 'probetas_graduadas.png'),
(4, 'Pipetas', 'Instrumentos para medir y transferir volúmenes precisos', NULL, 'Vidriería y plásticos', 'pipetas.png'),
(5, 'Tubos de ensayo', 'Tubos para contener pequeñas muestras y reacciones', NULL, 'Vidriería y plásticos', 'tubos_de_ensayo.png'),
(6, 'Embudos', 'Para filtrar y transferir líquidos entre recipientes', NULL, 'Vidriería y plásticos', 'embudos.png'),
(7, 'Mechero Bunsen', 'Fuente de calor para calentamiento y esterilización', NULL, 'Equipos básicos', 'mechero_bunsen.png'),
(8, 'Balanza de laboratorio', 'Instrumento para medir masa con precisión', NULL, 'Equipos básicos', 'balanza_laboratorio.png'),
(9, 'Termómetro', 'Para medir temperatura en experimentos', NULL, 'Equipos básicos', 'termometro.png'),
(10, 'Microscopio', 'Instrumento óptico para observar muestras microscópicas', NULL, 'Equipos básicos', 'microscopio.png'),
(11, 'Soporte universal', 'Estructura de soporte para montajes experimentales', NULL, 'Otros materiales', 'soporte_universal.png'),
(12, 'Pinzas', 'Para sujetar materiales y equipos durante experimentos', NULL, 'Otros materiales', 'pinzas.png'),
(13, 'Varilla de vidrio', 'Para agitar y mezclar soluciones', NULL, 'Otros materiales', 'varilla_vidrio.png');