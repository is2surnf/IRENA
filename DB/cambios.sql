-- Active: 1758064297326@@127.0.0.1@5000@irenatech
-- Base de datos actualizada para IReNaTech con tabla de progreso y correcciones

-- =====================================================
-- TABLA PROGRESO (NUEVA)
-- =====================================================

-- Tabla principal de progreso del usuario
CREATE TABLE progreso (
    id_progreso SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    tipo_evento VARCHAR(50) NOT NULL CHECK (tipo_evento IN ('simulacion_completada', 'teoria_leida', 'pregunta_ia', 'ejercicio_completado', 'nivel_alcanzado', 'sesion_estudio')),
    descripcion TEXT,
    puntos_ganados INTEGER DEFAULT 0,
    datos_json JSONB, -- Para almacenar datos específicos del evento
    fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sesion_id UUID, -- Para agrupar eventos de una misma sesión
    activo BOOLEAN DEFAULT TRUE
);

-- Índices para optimizar consultas de progreso
CREATE INDEX idx_progreso_usuario ON progreso(usuario_id);
CREATE INDEX idx_progreso_fecha ON progreso(fecha_evento DESC);
CREATE INDEX idx_progreso_tipo ON progreso(tipo_evento);
CREATE INDEX idx_progreso_usuario_fecha ON progreso(usuario_id, fecha_evento DESC);
CREATE INDEX idx_progreso_sesion ON progreso(sesion_id);

-- Tabla de logros/achievements
CREATE TABLE logros (
    id_logro SERIAL PRIMARY KEY,
    codigo_logro VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    puntos_requeridos INTEGER DEFAULT 0,
    condicion_json JSONB, -- Condiciones para obtener el logro
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de logros obtenidos por usuarios
CREATE TABLE usuario_logros (
    id_usuario_logro SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    logro_id INTEGER REFERENCES logros(id_logro) ON DELETE CASCADE,
    fecha_obtenido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progreso_id INTEGER REFERENCES progreso(id_progreso) ON DELETE SET NULL, -- Evento que desencadenó el logro
    UNIQUE(usuario_id, logro_id)
);

-- Tabla de sesiones de estudio
CREATE TABLE sesiones_estudio (
    id_sesion UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id INTEGER REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP,
    duracion_minutos INTEGER,
    actividades_realizadas INTEGER DEFAULT 0,
    puntos_sesion INTEGER DEFAULT 0,
    tipo_actividad_principal VARCHAR(50), -- 'simulacion', 'teoria', 'mixto'
    dispositivo VARCHAR(50), -- 'web', 'mobile', etc.
    activa BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- CORRECCIONES A TABLAS EXISTENTES
-- =====================================================

-- Agregar campos faltantes a la tabla usuario
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS ultimo_acceso TIMESTAMP;
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS puntos_totales INTEGER DEFAULT 0;
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS nivel VARCHAR(20) DEFAULT 'Principiante';
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS sesiones_completadas INTEGER DEFAULT 0;

-- Mejorar tabla simulacion
ALTER TABLE simulacion ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'En proceso' CHECK (estado IN ('En proceso', 'Completada', 'Fallida', 'Pausada'));
ALTER TABLE simulacion ADD COLUMN IF NOT EXISTS duracion_minutos INTEGER;
ALTER TABLE simulacion ADD COLUMN IF NOT EXISTS puntos_obtenidos INTEGER DEFAULT 0;
ALTER TABLE simulacion ADD COLUMN IF NOT EXISTS tipo_simulacion VARCHAR(50) DEFAULT 'General';

-- =====================================================
-- FUNCIONES Y TRIGGERS PARA PROGRESO
-- =====================================================

-- Función para calcular puntos totales del usuario
CREATE OR REPLACE FUNCTION calcular_puntos_usuario(p_usuario_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    puntos_total INTEGER;
BEGIN
    SELECT COALESCE(SUM(puntos_ganados), 0) INTO puntos_total
    FROM progreso 
    WHERE usuario_id = p_usuario_id AND activo = true;
    
    -- Actualizar la tabla usuario
    UPDATE usuario 
    SET puntos_totales = puntos_total,
        nivel = CASE 
            WHEN puntos_total >= 2000 THEN 'Experto'
            WHEN puntos_total >= 1000 THEN 'Avanzado'
            WHEN puntos_total >= 500 THEN 'Intermedio'
            ELSE 'Principiante'
        END
    WHERE id_usuario = p_usuario_id;
    
    RETURN puntos_total;
END;
$$ LANGUAGE plpgsql;

-- Función para registrar evento de progreso
CREATE OR REPLACE FUNCTION registrar_progreso(
    p_usuario_id INTEGER,
    p_tipo_evento VARCHAR(50),
    p_descripcion TEXT DEFAULT NULL,
    p_puntos INTEGER DEFAULT 0,
    p_datos_json JSONB DEFAULT NULL,
    p_sesion_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    nuevo_progreso_id INTEGER;
    puntos_calculados INTEGER;
BEGIN
    -- Verificar que el usuario existe y no es anónimo
    IF NOT EXISTS (
        SELECT 1 FROM usuario 
        WHERE id_usuario = p_usuario_id 
        AND tipo_usuario = 'registrado'
    ) THEN
        RAISE EXCEPTION 'Usuario no válido o no autenticado';
    END IF;
    
    -- Calcular puntos si no se especificaron
    IF p_puntos = 0 THEN
        puntos_calculados = CASE p_tipo_evento
            WHEN 'simulacion_completada' THEN 50
            WHEN 'teoria_leida' THEN 30
            WHEN 'pregunta_ia' THEN 10
            WHEN 'ejercicio_completado' THEN 25
            WHEN 'nivel_alcanzado' THEN 100
            ELSE 5
        END;
    ELSE
        puntos_calculados = p_puntos;
    END IF;
    
    -- Insertar el registro de progreso
    INSERT INTO progreso (
        usuario_id, tipo_evento, descripcion, puntos_ganados, datos_json, sesion_id
    ) VALUES (
        p_usuario_id, p_tipo_evento, p_descripcion, puntos_calculados, p_datos_json, p_sesion_id
    ) RETURNING id_progreso INTO nuevo_progreso_id;
    
    -- Actualizar puntos totales del usuario
    PERFORM calcular_puntos_usuario(p_usuario_id);
    
    -- Verificar logros
    PERFORM verificar_logros_usuario(p_usuario_id);
    
    RETURN nuevo_progreso_id;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar y otorgar logros
CREATE OR REPLACE FUNCTION verificar_logros_usuario(p_usuario_id INTEGER)
RETURNS VOID AS $$
DECLARE
    logro RECORD;
    puntos_usuario INTEGER;
    simulaciones_completadas INTEGER;
    teorias_leidas INTEGER;
BEGIN
    -- Obtener estadísticas del usuario
    SELECT puntos_totales INTO puntos_usuario 
    FROM usuario WHERE id_usuario = p_usuario_id;
    
    SELECT COUNT(*) INTO simulaciones_completadas
    FROM simulacion WHERE usuario_id = p_usuario_id AND estado = 'Completada';
    
    SELECT COUNT(*) INTO teorias_leidas
    FROM usuario_teoria WHERE usuario_id = p_usuario_id AND leido = true;
    
    -- Verificar logros simples basados en puntos
    FOR logro IN 
        SELECT * FROM logros 
        WHERE activo = true 
        AND codigo_logro NOT IN (
            SELECT l.codigo_logro 
            FROM usuario_logros ul 
            JOIN logros l ON ul.logro_id = l.id_logro 
            WHERE ul.usuario_id = p_usuario_id
        )
    LOOP
        -- Lógica simple de verificación (se puede expandir)
        IF (logro.codigo_logro = 'PRIMER_SIMULACION' AND simulaciones_completadas >= 1) OR
           (logro.codigo_logro = 'EXPLORADOR_TEORIA' AND teorias_leidas >= 5) OR
           (logro.codigo_logro = 'ESTUDIANTE_DEDICADO' AND puntos_usuario >= 500) OR
           (logro.codigo_logro = 'QUIMICO_EXPERTO' AND puntos_usuario >= 1000) THEN
            
            INSERT INTO usuario_logros (usuario_id, logro_id)
            VALUES (p_usuario_id, logro.id_logro);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar último acceso
CREATE OR REPLACE FUNCTION actualizar_ultimo_acceso()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE usuario 
    SET ultimo_acceso = CURRENT_TIMESTAMP
    WHERE id_usuario = NEW.usuario_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ultimo_acceso
    AFTER INSERT ON progreso
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_ultimo_acceso();

-- =====================================================
-- VISTAS MEJORADAS PARA ESTADÍSTICAS
-- =====================================================

-- Vista completa de estadísticas de usuario
-- Eliminamos la vista si ya existe para evitar conflictos
DROP VIEW IF EXISTS vista_estadisticas_completas;

-- Creamos la vista de estadísticas completas de usuario
CREATE OR REPLACE VIEW vista_estadisticas_completas AS
SELECT 
    u.id_usuario,
    u.nombre,
    u.correo,
    u.tipo_usuario,
    u.puntos_totales,
    u.nivel,
    u.fecha_registro,
    u.ultimo_acceso,
    u.sesiones_completadas,

    
    COUNT(DISTINCT s.id_simulacion) AS total_simulaciones,
    COUNT(DISTINCT CASE WHEN s.estado = 'Completada' THEN s.id_simulacion END) AS simulaciones_completadas,
    COUNT(DISTINCT CASE WHEN s.estado = 'En proceso' THEN s.id_simulacion END) AS simulaciones_en_proceso,
    COUNT(DISTINCT CASE WHEN s.estado = 'Fallida' THEN s.id_simulacion END) AS simulaciones_fallidas,

  
    COUNT(DISTINCT ut.teoria_id) AS teorias_leidas,
    (SELECT COUNT(*) FROM teoria WHERE activo = true) AS total_teorias_disponibles,


    COUNT(DISTINCT se.elemento_id) AS elementos_diferentes_usados,


    COUNT(DISTINCT p.id_progreso) AS eventos_progreso,
    COUNT(DISTINCT CASE WHEN p.tipo_evento = 'pregunta_ia' THEN p.id_progreso END) AS preguntas_ia_realizadas,


    COUNT(DISTINCT ul.logro_id) AS logros_obtenidos,

    COALESCE(SUM(s.duracion_minutos), COUNT(DISTINCT s.id_simulacion) * 30) AS tiempo_total_simulacion_minutos

FROM usuario u
LEFT JOIN simulacion s ON u.id_usuario = s.usuario_id
LEFT JOIN usuario_teoria ut ON u.id_usuario = ut.usuario_id AND ut.leido = true
LEFT JOIN simulacion_elemento se ON s.id_simulacion = se.simulacion_id
LEFT JOIN progreso p ON u.id_usuario = p.usuario_id AND p.activo = true
LEFT JOIN usuario_logros ul ON u.id_usuario = ul.usuario_id
GROUP BY u.id_usuario;
-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar logros iniciales
INSERT INTO logros (codigo_logro, nombre, descripcion, icono, puntos_requeridos) VALUES
('PRIMERA_CONEXION', 'Primera Conexión', 'Te has registrado en IReNaTech', 'user-plus', 0),
('PRIMER_SIMULACION', 'Primera Simulación', 'Has completado tu primera simulación química', 'flask', 0),
('EXPLORADOR_TEORIA', 'Explorador de Teoría', 'Has leído 5 artículos teóricos', 'book-open', 150),
('ESTUDIANTE_DEDICADO', 'Estudiante Dedicado', 'Has alcanzado 500 puntos de experiencia', 'award', 500),
('QUIMICO_EXPERTO', 'Químico Experto', 'Has alcanzado 1000 puntos de experiencia', 'star', 1000),
('ELEMENTO_MAESTRO', 'Maestro de Elementos', 'Has usado más de 20 elementos diferentes', 'atom', 0),
('PREGUNTADOR_CURIOSO', 'Preguntador Curioso', 'Has hecho más de 50 preguntas a la IA', 'help-circle', 0),
('SESION_MARATONIANA', 'Sesión Maratoniana', 'Has estudiado más de 2 horas seguidas', 'clock', 0);

-- Insertar usuarios de prueba
INSERT INTO usuario (nombre, correo, tipo_usuario, fecha_registro, puntos_totales, nivel) VALUES
('Juan Pérez', 'juan.perez@ejemplo.com', 'registrado', '2025-01-01 10:00:00', 650, 'Intermedio'),
('María García', 'maria.garcia@ejemplo.com', 'registrado', '2025-01-05 14:30:00', 1200, 'Avanzado'),
('Carlos López', 'carlos.lopez@ejemplo.com', 'registrado', '2025-01-10 09:15:00', 350, 'Principiante'),
('Ana Martínez', 'ana.martinez@ejemplo.com', 'registrado', '2025-01-15 16:45:00', 1850, 'Experto'),
('Usuario Anónimo', NULL, 'anonimo', CURRENT_TIMESTAMP, 0, 'Principiante');

-- Datos de progreso de prueba para usuarios registrados
-- Usuario 1 (Juan Pérez - ID: 1)
INSERT INTO progreso (usuario_id, tipo_evento, descripcion, puntos_ganados, datos_json, sesion_id, fecha_evento) VALUES
(1, 'simulacion_completada', 'Simulación de Combustión del Metano', 50, '{"simulacion_id": 1, "elementos_usados": ["C", "H", "O"], "tiempo_minutos": 25}', gen_random_uuid(), '2025-01-20 10:30:00'),
(1, 'teoria_leida', 'Introducción a la Estructura Atómica', 30, '{"teoria_id": 1, "tiempo_lectura": 12}', gen_random_uuid(), '2025-01-20 11:00:00'),
(1, 'pregunta_ia', 'Consulta sobre enlaces covalentes', 10, '{"pregunta": "¿Cuál es la diferencia entre enlace covalente polar y no polar?"}', gen_random_uuid(), '2025-01-20 11:15:00'),
(1, 'simulacion_completada', 'Simulación de Electrólisis del Agua', 50, '{"simulacion_id": 2, "elementos_usados": ["H", "O"], "tiempo_minutos": 30}', gen_random_uuid(), '2025-01-21 14:20:00'),
(1, 'teoria_leida', 'Configuración Electrónica y Orbitales', 30, '{"teoria_id": 2, "tiempo_lectura": 15}', gen_random_uuid(), '2025-01-21 15:00:00'),
(1, 'ejercicio_completado', 'Ejercicio de configuración electrónica', 25, '{"teoria_id": 2, "puntuacion": 85}', gen_random_uuid(), '2025-01-21 15:30:00'),
(1, 'simulacion_completada', 'Simulación de Reacción Ácido-Base', 50, '{"simulacion_id": 3, "elementos_usados": ["H", "O", "Na", "Cl"], "tiempo_minutos": 35}', gen_random_uuid(), '2025-01-22 09:45:00'),
(1, 'pregunta_ia', 'Consulta sobre pH y acidez', 10, '{"pregunta": "¿Cómo calcular el pH de una solución?"}', gen_random_uuid(), '2025-01-22 10:20:00'),
(1, 'nivel_alcanzado', 'Alcanzado nivel Intermedio', 100, '{"nivel_anterior": "Principiante", "nivel_nuevo": "Intermedio", "puntos_requeridos": 500}', gen_random_uuid(), '2025-01-22 10:25:00'),
(1, 'teoria_leida', 'Fundamentos del Enlace Químico', 30, '{"teoria_id": 3, "tiempo_lectura": 18}', gen_random_uuid(), '2025-01-23 16:30:00'),
(1, 'simulacion_completada', 'Simulación de Síntesis de Amoniaco', 50, '{"simulacion_id": 4, "elementos_usados": ["N", "H"], "tiempo_minutos": 40}', gen_random_uuid(), '2025-01-24 11:10:00'),
(1, 'pregunta_ia', 'Consulta sobre equilibrio químico', 10, '{"pregunta": "¿Qué factores afectan el equilibrio químico?"}', gen_random_uuid(), '2025-01-24 11:50:00'),
(1, 'ejercicio_completado', 'Ejercicio de estequiometría', 25, '{"teoria_id": 5, "puntuacion": 78}', gen_random_uuid(), '2025-01-24 12:15:00');

-- Usuario 2 (María García - ID: 2)
INSERT INTO progreso (usuario_id, tipo_evento, descripcion, puntos_ganados, datos_json, sesion_id, fecha_evento) VALUES
(2, 'simulacion_completada', 'Simulación de Reacción de Oxidación-Reducción', 50, '{"simulacion_id": 5, "elementos_usados": ["Cu", "Zn", "S", "O"], "tiempo_minutos": 45}', gen_random_uuid(), '2025-01-18 09:30:00'),
(2, 'teoria_leida', 'Introducción a la Estructura Atómica', 30, '{"teoria_id": 1, "tiempo_lectura": 10}', gen_random_uuid(), '2025-01-18 10:20:00'),
(2, 'teoria_leida', 'Configuración Electrónica y Orbitales', 30, '{"teoria_id": 2, "tiempo_lectura": 13}', gen_random_uuid(), '2025-01-18 10:35:00'),
(2, 'teoria_leida', 'Fundamentos del Enlace Químico', 30, '{"teoria_id": 3, "tiempo_lectura": 16}', gen_random_uuid(), '2025-01-18 11:00:00'),
(2, 'simulacion_completada', 'Simulación de Cinética Química', 50, '{"simulacion_id": 6, "elementos_usados": ["H", "I"], "tiempo_minutos": 50}', gen_random_uuid(), '2025-01-19 14:15:00'),
(2, 'pregunta_ia', 'Consulta sobre velocidad de reacción', 10, '{"pregunta": "¿Cómo afecta la temperatura a la velocidad de reacción?"}', gen_random_uuid(), '2025-01-19 15:00:00'),
(2, 'teoria_leida', 'Geometría Molecular y Teoría VSEPR', 30, '{"teoria_id": 4, "tiempo_lectura": 20}', gen_random_uuid(), '2025-01-20 16:30:00'),
(2, 'ejercicio_completado', 'Ejercicio de geometría molecular', 25, '{"teoria_id": 4, "puntuacion": 92}', gen_random_uuid(), '2025-01-20 17:00:00'),
(2, 'simulacion_completada', 'Simulación de Termoquímica', 50, '{"simulacion_id": 7, "elementos_usados": ["C", "H", "O"], "tiempo_minutos": 55}', gen_random_uuid(), '2025-01-21 10:45:00'),
(2, 'nivel_alcanzado', 'Alcanzado nivel Intermedio', 100, '{"nivel_anterior": "Principiante", "nivel_nuevo": "Intermedio", "puntos_requeridos": 500}', gen_random_uuid(), '2025-01-21 11:40:00'),
(2, 'simulacion_completada', 'Simulación de Equilibrio Químico', 50, '{"simulacion_id": 8, "elementos_usados": ["N", "O"], "tiempo_minutos": 42}', gen_random_uuid(), '2025-01-22 13:20:00'),
(2, 'teoria_leida', 'Introducción a la Estequiometría', 30, '{"teoria_id": 5, "tiempo_lectura": 16}', gen_random_uuid(), '2025-01-22 14:10:00'),
(2, 'nivel_alcanzado', 'Alcanzado nivel Avanzado', 100, '{"nivel_anterior": "Intermedio", "nivel_nuevo": "Avanzado", "puntos_requeridos": 1000}', gen_random_uuid(), '2025-01-22 14:15:00'),
(2, 'pregunta_ia', 'Consulta sobre estequiometría avanzada', 10, '{"pregunta": "¿Cómo calcular el reactivo limitante en reacciones complejas?"}', gen_random_uuid(), '2025-01-23 09:30:00'),
(2, 'simulacion_completada', 'Simulación de Química Orgánica', 50, '{"simulacion_id": 9, "elementos_usados": ["C", "H", "O", "N"], "tiempo_minutos": 65}', gen_random_uuid(), '2025-01-23 15:45:00'),
(2, 'ejercicio_completado', 'Ejercicio de estequiometría avanzada', 25, '{"teoria_id": 5, "puntuacion": 95}', gen_random_uuid(), '2025-01-23 16:50:00');

-- Usuario 3 (Carlos López - ID: 3)
INSERT INTO progreso (usuario_id, tipo_evento, descripcion, puntos_ganados, datos_json, sesion_id, fecha_evento) VALUES
(3, 'teoria_leida', 'Introducción a la Estructura Atómica', 30, '{"teoria_id": 1, "tiempo_lectura": 15}', gen_random_uuid(), '2025-01-22 10:00:00'),
(3, 'pregunta_ia', 'Consulta sobre átomos', 10, '{"pregunta": "¿Qué es un átomo?"}', gen_random_uuid(), '2025-01-22 10:30:00'),
(3, 'simulacion_completada', 'Primera Simulación - Estructura Atómica', 50, '{"simulacion_id": 10, "elementos_usados": ["H"], "tiempo_minutos": 20}', gen_random_uuid(), '2025-01-22 11:15:00'),
(3, 'ejercicio_completado', 'Ejercicio básico de estructura atómica', 25, '{"teoria_id": 1, "puntuacion": 72}', gen_random_uuid(), '2025-01-22 11:40:00'),
(3, 'teoria_leida', 'Configuración Electrónica y Orbitales', 30, '{"teoria_id": 2, "tiempo_lectura": 18}', gen_random_uuid(), '2025-01-23 14:20:00'),
(3, 'pregunta_ia', 'Consulta sobre electrones', 10, '{"pregunta": "¿Cómo se distribuyen los electrones en un átomo?"}', gen_random_uuid(), '2025-01-23 14:45:00'),
(3, 'simulacion_completada', 'Simulación de Configuración Electrónica', 50, '{"simulacion_id": 11, "elementos_usados": ["Li", "Be", "B"], "tiempo_minutos": 35}', gen_random_uuid(), '2025-01-24 16:30:00'),
(3, 'pregunta_ia', 'Consulta sobre orbitales', 10, '{"pregunta": "¿Qué son los orbitales atómicos?"}', gen_random_uuid(), '2025-01-24 17:10:00'),
(3, 'teoria_leida', 'Fundamentos del Enlace Químico', 30, '{"teoria_id": 3, "tiempo_lectura": 22}', gen_random_uuid(), '2025-01-25 09:45:00'),
(3, 'simulacion_completada', 'Simulación de Enlaces Iónicos', 50, '{"simulacion_id": 12, "elementos_usados": ["Na", "Cl"], "tiempo_minutos": 28}', gen_random_uuid(), '2025-01-25 12:30:00'),
(3, 'ejercicio_completado', 'Ejercicio de enlaces químicos', 25, '{"teoria_id": 3, "puntuacion": 68}', gen_random_uuid(), '2025-01-25 13:00:00'),
(3, 'pregunta_ia', 'Consulta sobre enlaces', 10, '{"pregunta": "¿Cuál es la diferencia entre enlace iónico y covalente?"}', gen_random_uuid(), '2025-01-25 13:15:00');

-- Usuario 4 (Ana Martínez - ID: 4) - Usuario experto
INSERT INTO progreso (usuario_id, tipo_evento, descripcion, puntos_ganados, datos_json, sesion_id, fecha_evento) VALUES
(4, 'simulacion_completada', 'Simulación Avanzada de Catálisis Heterogénea', 50, '{"simulacion_id": 13, "elementos_usados": ["Pt", "Pd", "Rh", "C", "H", "O"], "tiempo_minutos": 75}', gen_random_uuid(), '2025-01-16 08:30:00'),
(4, 'teoria_leida', 'Introducción a la Estructura Atómica', 30, '{"teoria_id": 1, "tiempo_lectura": 8}', gen_random_uuid(), '2025-01-16 09:50:00'),
(4, 'teoria_leida', 'Configuración Electrónica y Orbitales', 30, '{"teoria_id": 2, "tiempo_lectura": 10}', gen_random_uuid(), '2025-01-16 10:00:00'),
(4, 'teoria_leida', 'Fundamentos del Enlace Químico', 30, '{"teoria_id": 3, "tiempo_lectura": 12}', gen_random_uuid(), '2025-01-16 10:15:00'),
(4, 'teoria_leida', 'Geometría Molecular y Teoría VSEPR', 30, '{"teoria_id": 4, "tiempo_lectura": 15}', gen_random_uuid(), '2025-01-16 10:30:00'),
(4, 'teoria_leida', 'Introducción a la Estequiometría', 30, '{"teoria_id": 5, "tiempo_lectura": 14}', gen_random_uuid(), '2025-01-16 10:50:00'),
(4, 'nivel_alcanzado', 'Alcanzado nivel Intermedio', 100, '{"nivel_anterior": "Principiante", "nivel_nuevo": "Intermedio", "puntos_requeridos": 500}', gen_random_uuid(), '2025-01-16 11:00:00'),
(4, 'simulacion_completada', 'Simulación de Química Cuántica', 50, '{"simulacion_id": 14, "elementos_usados": ["H", "He", "Li", "Be"], "tiempo_minutos": 90}', gen_random_uuid(), '2025-01-17 14:15:00'),
(4, 'pregunta_ia', 'Consulta sobre mecánica cuántica aplicada', 10, '{"pregunta": "¿Cómo se aplica la ecuación de Schrödinger en sistemas moleculares?"}', gen_random_uuid(), '2025-01-17 16:00:00'),
(4, 'simulacion_completada', 'Simulación de Espectroscopía Molecular', 50, '{"simulacion_id": 15, "elementos_usados": ["C", "H", "O", "N", "S"], "tiempo_minutos": 85}', gen_random_uuid(), '2025-01-18 10:30:00'),
(4, 'nivel_alcanzado', 'Alcanzado nivel Avanzado', 100, '{"nivel_anterior": "Intermedio", "nivel_nuevo": "Avanzado", "puntos_requeridos": 1000}', gen_random_uuid(), '2025-01-18 12:15:00'),
(4, 'simulacion_completada', 'Simulación de Química Computacional', 50, '{"simulacion_id": 16, "elementos_usados": ["C", "H", "N", "O", "P", "S"], "tiempo_minutos": 120}', gen_random_uuid(), '2025-01-19 09:45:00'),
(4, 'pregunta_ia', 'Consulta sobre DFT y métodos ab initio', 10, '{"pregunta": "¿Cuáles son las ventajas del método DFT sobre Hartree-Fock?"}', gen_random_uuid(), '2025-01-19 12:30:00'),
(4, 'simulacion_completada', 'Simulación de Dinámica Molecular', 50, '{"simulacion_id": 17, "elementos_usados": ["C", "H", "O", "N"], "tiempo_minutos": 95}', gen_random_uuid(), '2025-01-20 15:20:00'),
(4, 'ejercicio_completado', 'Ejercicio avanzado de estequiometría', 25, '{"teoria_id": 5, "puntuacion": 98}', gen_random_uuid(), '2025-01-20 16:15:00'),
(4, 'simulacion_completada', 'Simulación de Síntesis de Fármacos', 50, '{"simulacion_id": 18, "elementos_usados": ["C", "H", "N", "O", "F", "Cl"], "tiempo_minutos": 110}', gen_random_uuid(), '2025-01-21 11:30:00'),
(4, 'nivel_alcanzado', 'Alcanzado nivel Experto', 100, '{"nivel_anterior": "Avanzado", "nivel_nuevo": "Experto", "puntos_requeridos": 2000}', gen_random_uuid(), '2025-01-21 12:40:00'),
(4, 'pregunta_ia', 'Consulta sobre química medicinal', 10, '{"pregunta": "¿Cómo se optimiza la biodisponibilidad de un fármaco?"}', gen_random_uuid(), '2025-01-21 13:15:00'),
(4, 'simulacion_completada', 'Simulación de Nanotecnología Química', 50, '{"simulacion_id": 19, "elementos_usados": ["C", "Si", "Au", "Ag"], "tiempo_minutos": 135}', gen_random_uuid(), '2025-01-22 14:45:00'),
(4, 'pregunta_ia', 'Consulta sobre nanomateriales', 10, '{"pregunta": "¿Cuáles son las aplicaciones de los nanotubos de carbono?"}', gen_random_uuid(), '2025-01-22 17:00:00'),
(4, 'simulacion_completada', 'Simulación de Química Verde', 50, '{"simulacion_id": 20, "elementos_usados": ["C", "H", "O"], "tiempo_minutos": 80}', gen_random_uuid(), '2025-01-23 10:30:00'),
(4, 'pregunta_ia', 'Consulta sobre sostenibilidad química', 10, '{"pregunta": "¿Qué principios rigen la química verde?"}', gen_random_uuid(), '2025-01-23 12:45:00'),
(4, 'ejercicio_completado', 'Proyecto de investigación avanzada', 25, '{"proyecto_id": 1, "puntuacion": 96}', gen_random_uuid(), '2025-01-24 16:20:00'),
(4, 'sesion_estudio', 'Sesión de estudio intensiva', 50, '{"duracion_minutos": 180, "actividades": 8}', gen_random_uuid(), '2025-01-24 19:30:00');

-- Insertar sesiones de estudio
INSERT INTO sesiones_estudio (id_sesion, usuario_id, fecha_inicio, fecha_fin, duracion_minutos, actividades_realizadas, puntos_sesion, tipo_actividad_principal, dispositivo) VALUES
(gen_random_uuid(), 1, '2025-01-20 10:00:00', '2025-01-20 11:30:00', 90, 3, 90, 'mixto', 'web'),
(gen_random_uuid(), 1, '2025-01-21 14:00:00', '2025-01-21 15:45:00', 105, 4, 105, 'simulacion', 'web'),
(gen_random_uuid(), 1, '2025-01-22 09:30:00', '2025-01-22 10:45:00', 75, 2, 60, 'teoria', 'web'),
(gen_random_uuid(), 2, '2025-01-18 09:00:00', '2025-01-18 11:15:00', 135, 5, 160, 'mixto', 'web'),
(gen_random_uuid(), 2, '2025-01-19 13:45:00', '2025-01-19 15:30:00', 105, 3, 110, 'simulacion', 'web'),
(gen_random_uuid(), 2, '2025-01-20 16:00:00', '2025-01-20 17:30:00', 90, 2, 55, 'teoria', 'web'),
(gen_random_uuid(), 3, '2025-01-22 10:00:00', '2025-01-22 11:50:00', 110, 4, 115, 'mixto', 'web'),
(gen_random_uuid(), 3, '2025-01-23 14:00:00', '2025-01-23 15:15:00', 75, 3, 70, 'teoria', 'web'),
(gen_random_uuid(), 4, '2025-01-16 08:00:00', '2025-01-16 11:30:00', 210, 6, 240, 'mixto', 'web'),
(gen_random_uuid(), 4, '2025-01-17 13:45:00', '2025-01-17 16:30:00', 165, 4, 160, 'simulacion', 'web'),
(gen_random_uuid(), 4, '2025-01-19 09:00:00', '2025-01-19 13:00:00', 240, 5, 210, 'simulacion', 'web'),
(gen_random_uuid(), 4, '2025-01-21 11:00:00', '2025-01-21 14:30:00', 210, 6, 235, 'mixto', 'web');

-- Otorgar algunos logros a los usuarios
INSERT INTO usuario_logros (usuario_id, logro_id) VALUES
-- Usuario 1 (Juan)
(1, 1), -- Primera Conexión
(1, 2), -- Primer Simulación
-- Usuario 2 (María) 
(2, 1), -- Primera Conexión
(2, 2), -- Primer Simulación
(2, 3), -- Explorador de Teoría
(2, 4), -- Estudiante Dedicado
-- Usuario 3 (Carlos)
(3, 1), -- Primera Conexión
(3, 2), -- Primer Simulación
-- Usuario 4 (Ana) - Todos los logros
(4, 1), -- Primera Conexión
(4, 2), -- Primer Simulación
(4, 3), -- Explorador de Teoría
(4, 4), -- Estudiante Dedicado
(4, 5), -- Químico Experto
(4, 6), -- Elemento Maestro
(4, 7), -- Preguntador Curioso
(4, 8); -- Sesión Maratoniana

-- Actualizar contadores en usuarios
UPDATE usuario SET sesiones_completadas = 3 WHERE id_usuario = 1;
UPDATE usuario SET sesiones_completadas = 3 WHERE id_usuario = 2;
UPDATE usuario SET sesiones_completadas = 2 WHERE id_usuario = 3;
UPDATE usuario SET sesiones_completadas = 4 WHERE id_usuario = 4;

-- =====================================================
-- CORRECCIÓN DE MODELOS Y SERVICIOS
-- =====================================================

-- Comentarios sobre correcciones necesarias en el código:

/*
CORRECCIONES NECESARIAS EN EL BACKEND:

1. En progreso_service.py - Línea donde calcula tiempo_total_simulacion:
   - Cambiar de string a minutos enteros para ser consistente
   - Agregar conversión a formato "Xh Ym" en el frontend

2. En models/progreso.py - EstadisticaGeneral:
   - tiempo_total_simulacion debería ser int (minutos) no str
   - Agregar campo fecha_ultimo_acceso opcional

3. En endpoints/progreso.py:
   - Agregar validación de usuario autenticado antes de guardar
   - Mejorar manejo de errores 401 vs 403
   - Agregar endpoint para obtener logros del usuario

4. En useProgreso.tsx:
   - Manejar mejor los estados de carga paralelos
   - Agregar caché local para evitar requests repetitivos
   - Implementar debouncing para las acciones de guardado

NUEVOS ENDPOINTS SUGERIDOS:

GET /api/progreso/{usuario_id}/logros - Obtener logros del usuario
POST /api/progreso/{usuario_id}/sesion - Iniciar sesión de estudio  
PUT /api/progreso/{usuario_id}/sesion/{sesion_id} - Terminar sesión
GET /api/progreso/{usuario_id}/ranking - Obtener posición en ranking
GET /api/progreso/leaderboard - Obtener tabla de líderes
*/

-- Vista para ranking de usuarios
CREATE VIEW vista_ranking_usuarios AS
SELECT 
    u.id_usuario,
    u.nombre,
    u.puntos_totales,
    u.nivel,
    RANK() OVER (ORDER BY u.puntos_totales DESC) as posicion,
    COUNT(*) OVER() as total_usuarios,
    ROUND(
        (RANK() OVER (ORDER BY u.puntos_totales DESC)::DECIMAL / COUNT(*) OVER()) * 100, 
        2
    ) as percentil
FROM usuario u
WHERE u.tipo_usuario = 'registrado' AND u.puntos_totales > 0
ORDER BY u.puntos_totales DESC;

-- Vista para dashboard rápido
CREATE VIEW vista_dashboard_usuario AS
SELECT 
    u.id_usuario,
    u.nombre,
    u.puntos_totales,
    u.nivel,
    u.ultimo_acceso,
    
    -- Progreso reciente (últimos 7 días)
    COUNT(p.id_progreso) FILTER (WHERE p.fecha_evento >= CURRENT_DATE - INTERVAL '7 days') as actividades_semana,
    SUM(p.puntos_ganados) FILTER (WHERE p.fecha_evento >= CURRENT_DATE - INTERVAL '7 days') as puntos_semana,
    
    -- Estadísticas generales
    COUNT(DISTINCT s.id_simulacion) as total_simulaciones,
    COUNT(DISTINCT s.id_simulacion) FILTER (WHERE s.estado = 'Completada') as simulaciones_completadas,
    COUNT(DISTINCT ut.teoria_id) as teorias_leidas,
    COUNT(DISTINCT ul.logro_id) as logros_obtenidos,
    
    -- Próximo objetivo
    CASE u.nivel
        WHEN 'Principiante' THEN 500 - u.puntos_totales
        WHEN 'Intermedio' THEN 1000 - u.puntos_totales  
        WHEN 'Avanzado' THEN 2000 - u.puntos_totales
        ELSE 0
    END as puntos_siguiente_nivel
    
FROM usuario u
LEFT JOIN progreso p ON u.id_usuario = p.usuario_id AND p.activo = true
LEFT JOIN simulacion s ON u.id_usuario = s.usuario_id
LEFT JOIN usuario_teoria ut ON u.id_usuario = ut.usuario_id AND ut.leido = true
LEFT JOIN usuario_logros ul ON u.id_usuario = ul.usuario_id
WHERE u.tipo_usuario = 'registrado'
GROUP BY u.id_usuario, u.nombre, u.puntos_totales, u.nivel, u.ultimo_acceso;

-- Índices adicionales para performance
CREATE INDEX idx_progreso_usuario_tipo_fecha ON progreso(usuario_id, tipo_evento, fecha_evento DESC);
CREATE INDEX idx_progreso_fecha_reciente ON progreso(fecha_evento) WHERE fecha_evento >= CURRENT_DATE - INTERVAL '30 days';
CREATE INDEX idx_simulacion_usuario_estado ON simulacion(usuario_id, estado);

-- =====================================================
-- FUNCIONES DE UTILIDAD PARA EL FRONTEND
-- =====================================================

-- Función para obtener resumen rápido de progreso
CREATE OR REPLACE FUNCTION get_resumen_progreso_usuario(p_usuario_id INTEGER)
RETURNS JSON AS $
DECLARE
    resultado JSON;
BEGIN
    SELECT json_build_object(
        'usuario_id', id_usuario,
        'nivel', nivel,
        'puntos_totales', puntos_totales,
        'simulaciones_completadas', total_simulaciones,
        'teorias_leidas', teorias_leidas,
        'logros_obtenidos', logros_obtenidos,
        'puntos_siguiente_nivel', puntos_siguiente_nivel,
        'posicion_ranking', (
            SELECT posicion FROM vista_ranking_usuarios 
            WHERE id_usuario = p_usuario_id
        ),
        'actividad_reciente', actividades_semana > 0,
        'ultimo_acceso', ultimo_acceso
    ) INTO resultado
    FROM vista_dashboard_usuario
    WHERE id_usuario = p_usuario_id;
    
    RETURN COALESCE(resultado, '{}');
END;
$ LANGUAGE plpgsql;

-- =====================================================
-- DATOS DE EJEMPLO ADICIONALES
-- =====================================================

-- Agregar más simulaciones de ejemplo
INSERT INTO simulacion (usuario_id, nombre, fecha, descripcion, estado, duracion_minutos, tipo_simulacion) VALUES
(1, 'Simulación de Combustión del Metano', '2025-01-20 10:30:00', 'Completada con éxito', 'Completada', 25, 'Combustión'),
(1, 'Simulación de Electrólisis del Agua', '2025-01-21 14:20:00', 'Completada con éxito', 'Completada', 30, 'Electrólisis'),
(1, 'Simulación de Reacción Ácido-Base', '2025-01-22 09:45:00', 'Completada con éxito', 'Completada', 35, 'Ácido-Base'),
(1, 'Simulación de Síntesis de Amoniaco', '2025-01-24 11:10:00', 'Completada con éxito', 'Completada', 40, 'Síntesis'),

(2, 'Simulación de Oxidación-Reducción', '2025-01-18 09:30:00', 'Completada con éxito', 'Completada', 45, 'RedOx'),
(2, 'Simulación de Cinética Química', '2025-01-19 14:15:00', 'Completada con éxito', 'Completada', 50, 'Cinética'),
(2, 'Simulación de Termoquímica', '2025-01-21 10:45:00', 'Completada con éxito', 'Completada', 55, 'Termoquímica'),
(2, 'Simulación de Equilibrio Químico', '2025-01-22 13:20:00', 'Completada con éxito', 'Completada', 42, 'Equilibrio'),
(2, 'Simulación de Química Orgánica', '2025-01-23 15:45:00', 'Completada con éxito', 'Completada', 65, 'Orgánica'),

(3, 'Primera Simulación - Estructura Atómica', '2025-01-22 11:15:00', 'Completada con éxito', 'Completada', 20, 'Estructura'),
(3, 'Simulación de Configuración Electrónica', '2025-01-24 16:30:00', 'Completada con éxito', 'Completada', 35, 'Configuración'),
(3, 'Simulación de Enlaces Iónicos', '2025-01-25 12:30:00', 'Completada con éxito', 'Completada', 28, 'Enlaces'),

(4, 'Simulación de Catálisis Heterogénea', '2025-01-16 08:30:00', 'Completada con éxito', 'Completada', 75, 'Catálisis'),
(4, 'Simulación de Química Cuántica', '2025-01-17 14:15:00', 'Completada con éxito', 'Completada', 90, 'Cuántica'),
(4, 'Simulación de Espectroscopía Molecular', '2025-01-18 10:30:00', 'Completada con éxito', 'Completada', 85, 'Espectroscopía'),
(4, 'Simulación de Química Computacional', '2025-01-19 09:45:00', 'Completada con éxito', 'Completada', 120, 'Computacional'),
(4, 'Simulación de Dinámica Molecular', '2025-01-20 15:20:00', 'Completada con éxito', 'Completada', 95, 'Dinámica'),
(4, 'Simulación de Síntesis de Fármacos', '2025-01-21 11:30:00', 'Completada con éxito', 'Completada', 110, 'Farmacéutica'),
(4, 'Simulación de Nanotecnología Química', '2025-01-22 14:45:00', 'Completada con éxito', 'Completada', 135, 'Nanotecnología'),
(4, 'Simulación de Química Verde', '2025-01-23 10:30:00', 'Completada con éxito', 'Completada', 80, 'Verde');

-- Elementos usados en simulaciones
INSERT INTO simulacion_elemento (simulacion_id, elemento_id, cantidad, unidad) VALUES
-- Simulación 1: Combustión del Metano (CH4 + 2O2 -> CO2 + 2H2O)
(1, 6, 1.0, 'mol'), -- Carbono
(1, 1, 4.0, 'mol'), -- Hidrógeno
(1, 8, 2.0, 'mol'), -- Oxígeno

-- Simulación 2: Electrólisis del Agua (2H2O -> 2H2 + O2)
(2, 1, 2.0, 'mol'), -- Hidrógeno
(2, 8, 1.0, 'mol'), -- Oxígeno

-- Simulación 3: Reacción Ácido-Base (HCl + NaOH -> NaCl + H2O)
(3, 1, 1.0, 'mol'), -- Hidrógeno
(3, 17, 1.0, 'mol'), -- Cloro
(3, 11, 1.0, 'mol'), -- Sodio
(3, 8, 1.0, 'mol'), -- Oxígeno

-- Más elementos para otras simulaciones...
(4, 7, 1.0, 'mol'), -- Nitrógeno (Síntesis de Amoniaco)
(4, 1, 3.0, 'mol'), -- Hidrógeno

-- Simulaciones de María (usuario 2)
(5, 29, 1.0, 'mol'), -- Cobre (RedOx)
(5, 30, 1.0, 'mol'), -- Zinc
(5, 16, 1.0, 'mol'), -- Azufre
(5, 8, 4.0, 'mol'), -- Oxígeno

-- Simulaciones de Ana (usuario 4) - elementos más avanzados
(13, 78, 0.1, 'mol'), -- Platino (Catálisis)
(13, 46, 0.1, 'mol'), -- Paladio
(13, 45, 0.1, 'mol'), -- Rodio
(14, 2, 1.0, 'mol'), -- Helio (Química Cuántica)
(14, 3, 1.0, 'mol'); -- Litio

-- Agregar registros de teorías leídas
INSERT INTO usuario_teoria (usuario_id, teoria_id, leido, fecha, tiempo_lectura_real) VALUES
(1, 1, true, '2025-01-20 11:00:00', 12),
(1, 2, true, '2025-01-21 15:00:00', 15),
(1, 3, true, '2025-01-23 16:30:00', 18),

(2, 1, true, '2025-01-18 10:20:00', 10),
(2, 2, true, '2025-01-18 10:35:00', 13),
(2, 3, true, '2025-01-18 11:00:00', 16),
(2, 4, true, '2025-01-20 16:30:00', 20),
(2, 5, true, '2025-01-22 14:10:00', 16),

(3, 1, true, '2025-01-22 10:00:00', 15),
(3, 2, true, '2025-01-23 14:20:00', 18),
(3, 3, true, '2025-01-25 09:45:00', 22),

(4, 1, true, '2025-01-16 09:50:00', 8),
(4, 2, true, '2025-01-16 10:00:00', 10),
(4, 3, true, '2025-01-16 10:15:00', 12),
(4, 4, true, '2025-01-16 10:30:00', 15),
(4, 5, true, '2025-01-16 10:50:00', 14);

-- =====================================================
-- VERIFICACIÓN FINAL Y COMANDOS DE MANTENIMIENTO
-- =====================================================

-- Verificar integridad de los datos
SELECT 'Usuarios registrados: ' || COUNT(*) FROM usuario WHERE tipo_usuario = 'registrado';
SELECT 'Total eventos de progreso: ' || COUNT(*) FROM progreso WHERE activo = true;
SELECT 'Simulaciones completadas: ' || COUNT(*) FROM simulacion WHERE estado = 'Completada';
SELECT 'Teorías leídas: ' || COUNT(*) FROM usuario_teoria WHERE leido = true;
SELECT 'Logros otorgados: ' || COUNT(*) FROM usuario_logros;
SELECT 'Sesiones de estudio: ' || COUNT(*) FROM sesiones_estudio;

-- Actualizar estadísticas finales
SELECT calcular_puntos_usuario(1);
SELECT calcular_puntos_usuario(2);
SELECT calcular_puntos_usuario(3);
SELECT calcular_puntos_usuario(4);