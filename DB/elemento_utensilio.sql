-- 1. ELIMINAR TODOS LOS DATOS EXISTENTES
TRUNCATE TABLE elemento CASCADE;
ALTER SEQUENCE elemento_id_elemento_seq RESTART WITH 1;

INSERT INTO elemento 
(nombre, simbolo, numero_atomico, masa_atomica, densidad, estado, descripcion, categoria, imagen_url)
VALUES

('Hidrógeno', 'H', 1, 1.01, 0.09, 'Gas', 'Gas inflamable más ligero, combustible limpio. Esencial para síntesis de agua y amoníaco.', 'No metales', 'hidrogeno.png'),
('Oxígeno', 'O', 8, 16.00, 1.43, 'Gas', 'Gas comburente esencial para combustión y respiración. Forma óxidos con la mayoría de elementos.', 'No metales', 'oxigeno.png'),
('Nitrógeno', 'N', 7, 14.01, 1.25, 'Gas', 'Gas inerte que forma el 78% de la atmósfera. Base para fertilizantes y explosivos.', 'No metales', 'nitrogeno.png'),
('Cloro', 'Cl', 17, 35.45, 3.21, 'Gas', 'Halógeno altamente reactivo, amarillo verdoso. Usado en desinfección y síntesis de sales.', 'Gases y Halógenos', 'cloro.png'),


('Carbono', 'C', 6, 12.01, 2.27, 'Sólido', 'Base de química orgánica. Existe como grafito, diamante o carbón vegetal.', 'No metales', 'carbono.png'),
('Azufre', 'S', 16, 32.06, 2.07, 'Sólido', 'Sólido amarillo que forma ácidos fuertes. Reacciona con metales formando sulfuros.', 'No metales', 'azufre.png'),
('Sodio', 'Na', 11, 22.99, 0.97, 'Sólido', 'Metal plateado extremadamente reactivo con agua. Base de hidróxido de sodio (soda cáustica).', 'Metales', 'sodio.png'),
('Potasio', 'K', 19, 39.10, 0.86, 'Sólido', 'Más reactivo que el sodio, arde con llama violeta. Usado en fertilizantes.', 'Metales', 'potasio.png'),


('Magnesio', 'Mg', 12, 24.31, 1.74, 'Sólido', 'Metal ligero que arde con llama blanca brillante. Usado en fuegos artificiales.', 'Metales', 'magnesio.png'),
('Calcio', 'Ca', 20, 40.08, 1.55, 'Sólido', 'Metal reactivo, componente de piedra caliza y huesos. Forma cal viva (CaO).', 'Metales', 'calcio.png'),


('Hierro', 'Fe', 26, 55.85, 7.87, 'Sólido', 'Metal ferromagnético que se oxida fácilmente. Base de acero y hemoglobina.', 'Metales', 'hierro.png'),
('Cobre', 'Cu', 29, 63.55, 8.96, 'Sólido', 'Metal rojizo excelente conductor. Forma compuestos azules y verdes característicos.', 'Metales', 'cobre.png'),
('Zinc', 'Zn', 30, 65.38, 7.13, 'Sólido', 'Metal gris que reacciona con ácidos liberando hidrógeno. Usado en galvanizado.', 'Metales', 'zinc.png'),
('Aluminio', 'Al', 13, 26.98, 2.70, 'Sólido', 'Metal ligero resistente a corrosión. Forma capa protectora de óxido (Al₂O₃).', 'Metales', 'aluminio.png');

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