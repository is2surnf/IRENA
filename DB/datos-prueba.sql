-- Active: 1758064297326@@127.0.0.1@5000@irenatech
-- Datos de prueba para IReNaTech
-- IMPORTANTE: Estos datos se pueden borrar después de las pruebas



-- Limpiar datos existentes
TRUNCATE TABLE preguntas_ia, usuario_teoria, teoria_tarea_simulacion, simulacion_elemento, reaccion_elemento, compuesto_sintetizado, simulacion, teoria, reaccion, elemento, utensilio, usuario RESTART IDENTITY CASCADE;

-- USUARIOS DE PRUEBA
INSERT INTO usuario (nombre, correo, tipo_usuario) VALUES
('Juan Pérez', 'juan.perez@email.com', 'registrado'),
('Ana García', 'ana.garcia@email.com', 'registrado'),
('Usuario Anónimo', NULL, 'anonimo'),
('Carlos López', 'carlos.lopez@email.com', 'registrado'),
('María Rodríguez', 'maria.rodriguez@email.com', 'registrado');

-- ELEMENTOS QUÍMICOS
INSERT INTO elemento (nombre, simbolo, numero_atomico, masa_atomica, densidad, estado, descripcion) VALUES
('Hidrógeno', 'H', 1, 1.008, 0.00008988, 'gas', 'Elemento más ligero y abundante del universo'),
('Helio', 'He', 2, 4.003, 0.0001785, 'gas', 'Gas noble inerte, segundo elemento más abundante'),
('Litio', 'Li', 3, 6.941, 0.534, 'sólido', 'Metal alcalino ligero, usado en baterías'),
('Berilio', 'Be', 4, 9.012, 1.85, 'sólido', 'Metal ligero y tóxico'),
('Boro', 'B', 5, 10.811, 2.34, 'sólido', 'Semimetal utilizado en vidrios especiales'),
('Carbono', 'C', 6, 12.011, 2.267, 'sólido', 'Base de toda la química orgánica'),
('Nitrógeno', 'N', 7, 14.007, 0.0012506, 'gas', 'Gas inerte que forma el 78% de la atmósfera'),
('Oxígeno', 'O', 8, 15.999, 0.001429, 'gas', 'Gas esencial para la respiración y combustión'),
('Flúor', 'F', 9, 18.998, 0.001696, 'gas', 'Halógeno más reactivo'),
('Neón', 'Ne', 10, 20.180, 0.0008999, 'gas', 'Gas noble utilizado en iluminación');

-- REACCIONES QUÍMICAS
INSERT INTO reaccion (nombre, descripcion, condiciones, resultado_esperado) VALUES
('Síntesis de Agua', 'Combinación de hidrógeno y oxígeno para formar agua', 'Temperatura: 500°C, Catalizador: Pt', 'H2O + energía'),
('Combustión de Metano', 'Reacción de metano con oxígeno', 'Temperatura ambiente, presencia de chispa', 'CO2 + H2O + energía'),
('Síntesis de Amoníaco', 'Proceso Haber-Bosch para producir amoníaco', 'Alta presión (200 atm), Temperatura: 450°C, Catalizador: Fe', 'NH3'),
('Neutralización Ácido-Base', 'Reacción entre ácido clorhídrico y hidróxido de sodio', 'Temperatura ambiente', 'NaCl + H2O'),
('Electrólisis del Agua', 'Descomposición del agua mediante electricidad', 'Corriente eléctrica continua', 'H2 + O2');

-- RELACIONES REACCIÓN-ELEMENTO
INSERT INTO reaccion_elemento (reaccion_id, elemento_id, rol) VALUES
-- Síntesis de Agua
(1, 1, 'reactivo'), -- H
(1, 8, 'reactivo'), -- O
-- Combustión de Metano (usamos C e H para simular CH4)
(2, 6, 'reactivo'), -- C
(2, 1, 'reactivo'), -- H
(2, 8, 'reactivo'), -- O
-- Síntesis de Amoníaco
(3, 7, 'reactivo'), -- N
(3, 1, 'reactivo'), -- H
-- Neutralización
(4, 1, 'reactivo'), -- H (del HCl)
-- Electrólisis
(5, 1, 'producto'), -- H
(5, 8, 'producto'); -- O

-- TEORÍAS
INSERT INTO teoria (titulo, contenido, categoria) VALUES
('Fundamentos de Química Inorgánica', 'Conceptos básicos sobre enlaces químicos, estructura atómica y propiedades de los elementos...', 'Química Inorgánica'),
('Química Orgánica Básica', 'Introducción a los compuestos de carbono, grupos funcionales y reacciones orgánicas...', 'Química Orgánica'),
('Termodinámica Química', 'Principios de energía, entalpía, entropía y espontaneidad de reacciones...', 'Fisicoquímica'),
('Cinética Química', 'Velocidad de reacciones, factores que afectan la velocidad y mecanismos de reacción...', 'Fisicoquímica'),
('Equilibrio Químico', 'Principios de Le Chatelier, constantes de equilibrio y factores que afectan el equilibrio...', 'Fisicoquímica');

-- SIMULACIONES
INSERT INTO simulacion (usuario_id, nombre, descripcion) VALUES
(1, 'Simulación de Mecanismo de Reacción', 'Análisis detallado del mecanismo de síntesis de agua'),
(1, 'Simulación de Dinámica Molecular', 'Estudio del comportamiento molecular en fase gaseosa'),
(2, 'Simulación de Interacción Proteína-Ligando', 'Análisis de interacciones moleculares'),
(1, 'Combustión Controlada', 'Simulación de combustión de hidrocarburos'),
(2, 'Electrólisis Avanzada', 'Proceso de descomposición electrolítica'),
(1, 'Síntesis Catalítica', 'Uso de catalizadores en síntesis química'),
(4, 'Reacciones en Equilibrio', 'Estudio de equilibrios químicos dinámicos'),
(1, 'Análisis Termodinámico', 'Evaluación energética de procesos químicos');

-- ELEMENTOS EN SIMULACIONES
INSERT INTO simulacion_elemento (simulacion_id, elemento_id, cantidad, unidad) VALUES
-- Simulación 1: Síntesis de agua
(1, 1, 2.00, 'mol'), -- H
(1, 8, 1.00, 'mol'), -- O
-- Simulación 2: Dinámica molecular
(2, 1, 10.50, 'mol'),
(2, 6, 5.25, 'mol'),
-- Simulación 3: Proteína-ligando
(3, 6, 15.30, 'mol'),
(3, 7, 8.20, 'mol'),
(3, 8, 12.10, 'mol'),
-- Simulación 4: Combustión
(4, 6, 1.00, 'mol'),
(4, 1, 4.00, 'mol'),
(4, 8, 2.00, 'mol'),
-- Simulación 5: Electrólisis
(5, 1, 2.00, 'mol'),
(5, 8, 1.00, 'mol'),
-- Simulación 6: Síntesis catalítica
(6, 7, 1.00, 'mol'),
(6, 1, 3.00, 'mol'),
-- Simulación 7: Equilibrio
(7, 1, 1.50, 'mol'),
(7, 8, 0.75, 'mol'),
-- Simulación 8: Termodinámica
(8, 6, 2.50, 'mol'),
(8, 8, 5.00, 'mol');

-- PROGRESO DE TEORÍAS POR USUARIO
INSERT INTO usuario_teoria (usuario_id, teoria_id, leido, fecha) VALUES
(1, 1, true, NOW() - INTERVAL '5 days'),
(1, 2, true, NOW() - INTERVAL '3 days'),
(1, 3, false, NULL),
(1, 4, true, NOW() - INTERVAL '1 day'),
(1, 5, false, NULL),
(2, 1, true, NOW() - INTERVAL '7 days'),
(2, 2, false, NULL),
(2, 3, true, NOW() - INTERVAL '2 days'),
(4, 1, true, NOW() - INTERVAL '10 days'),
(4, 4, true, NOW() - INTERVAL '6 days');

-- PREGUNTAS A LA IA
INSERT INTO preguntas_ia (usuario_id, pregunta, respuesta) VALUES
(1, '¿Cómo afecta la temperatura a la velocidad de reacción?', 'La temperatura aumenta la velocidad de reacción siguiendo la ecuación de Arrhenius...'),
(1, '¿Cuál es la diferencia entre enlaces covalentes y iónicos?', 'Los enlaces covalentes comparten electrones entre átomos no metálicos...'),
(2, '¿Qué es un catalizador?', 'Un catalizador es una sustancia que acelera una reacción química sin consumirse...'),
(1, '¿Cómo calcular el rendimiento de una reacción?', 'El rendimiento se calcula dividiendo el producto real entre el teórico por 100...'),
(4, '¿Qué factores afectan el equilibrio químico?', 'Según Le Chatelier, la temperatura, presión y concentración afectan el equilibrio...');

-- UTENSILIOS DE LABORATORIO
INSERT INTO utensilio (nombre, descripcion, capacidad, tipo, imagen_url) VALUES
('Matraz Erlenmeyer', 'Matraz cónico para reacciones y calentamiento', 250.00, 'cristalería', '/images/utensilios/matraz_erlenmeyer.png'),
('Probeta Graduada', 'Cilindro graduado para medición de volúmenes', 100.00, 'cristalería', '/images/utensilios/probeta.png'),
('Bureta', 'Tubo graduado para titulaciones precisas', 50.00, 'cristalería', '/images/utensilios/bureta.png'),
('Balanza Analítica', 'Balanza de precisión para pesadas exactas', 200.00, 'equipo', '/images/utensilios/balanza.png'),
('Mechero Bunsen', 'Quemador de gas para calentamiento', 0.00, 'equipo', '/images/utensilios/mechero.png'),
('Termómetro Digital', 'Medidor de temperatura electrónico', 0.00, 'instrumento', '/images/utensilios/termometro.png'),
('Pipeta Volumétrica', 'Pipeta para medición precisa de volúmenes', 25.00, 'cristalería', '/images/utensilios/pipeta.png'),
('Vaso de Precipitados', 'Recipiente para preparación de soluciones', 500.00, 'cristalería', '/images/utensilios/vaso_precipitados.png');

-- TAREAS DE SIMULACIÓN PARA TEORÍAS
INSERT INTO teoria_tarea_simulacion (id_teoria, id_reaccion, descripcion_tarea, dificultad) VALUES
(1, 1, 'Simula la síntesis de agua y analiza el balance energético', 'intermedio'),
(1, 4, 'Realiza una neutralización ácido-base y calcula el pH resultante', 'básico'),
(2, 2, 'Simula la combustión completa de metano y determina los productos', 'intermedio'),
(3, 3, 'Analiza la termodinámica del proceso Haber-Bosch', 'avanzado'),
(4, 5, 'Estudia la cinética de la electrólisis del agua', 'avanzado'),
(5, 1, 'Determina las condiciones de equilibrio en la síntesis de agua', 'intermedio');

-- Actualizar las secuencias para evitar conflictos
SELECT setval('usuario_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuario));
SELECT setval('elemento_id_elemento_seq', (SELECT MAX(id_elemento) FROM elemento));
SELECT setval('reaccion_id_reaccion_seq', (SELECT MAX(id_reaccion) FROM reaccion));
SELECT setval('simulacion_id_simulacion_seq', (SELECT MAX(id_simulacion) FROM simulacion));
SELECT setval('teoria_id_teoria_seq', (SELECT MAX(id_teoria) FROM teoria));
SELECT setval('utensilio_id_utensilio_seq', (SELECT MAX(id_utensilio) FROM utensilio));

-- Verificar que los datos se insertaron correctamente
SELECT 'Usuarios insertados: ' || COUNT(*) FROM usuario;
SELECT 'Elementos insertados: ' || COUNT(*) FROM elemento;
SELECT 'Simulaciones insertadas: ' || COUNT(*) FROM simulacion;
SELECT 'Teorías insertadas: ' || COUNT(*) FROM teoria;