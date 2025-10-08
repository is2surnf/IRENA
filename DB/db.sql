-- Active: 1758064297326@@127.0.0.1@5000@irenatech
-- Base de datos actualizada para IReNaTech con campos mejorados para teoría

-- Tabla: usuarios
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    correo VARCHAR(100) UNIQUE,
    tipo_usuario VARCHAR(20) CHECK (tipo_usuario IN ('anonimo', 'registrado'))
);
    
-- Tabla: elementos
CREATE TABLE elemento (
    id_elemento SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    simbolo VARCHAR(10),
    numero_atomico INTEGER,
    masa_atomica DECIMAL(10, 2),
    densidad DECIMAL(10, 2),
    estado VARCHAR(20),
    descripcion TEXT
);

-- Tabla: reacciones
CREATE TABLE reaccion (
    id_reaccion SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion TEXT,
    condiciones TEXT,
    resultado_esperado TEXT
);

-- Tabla: simulaciones
CREATE TABLE simulacion (
    id_simulacion SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id_usuario),
    nombre VARCHAR(100),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT
);

-- Tabla: teoria (ACTUALIZADA con nuevos campos)
CREATE TABLE teoria (
    id_teoria SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    contenido TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    tiempo_lectura INTEGER DEFAULT 10,
    dificultad VARCHAR(20) DEFAULT 'Básico' CHECK (dificultad IN ('Básico', 'Intermedio', 'Avanzado')),
    puntos INTEGER DEFAULT 50,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Índices para mejorar rendimiento en teoria
CREATE INDEX idx_teoria_categoria ON teoria(categoria);
CREATE INDEX idx_teoria_dificultad ON teoria(dificultad);
CREATE INDEX idx_teoria_activo ON teoria(activo);

-- Tabla: preguntas_ia
CREATE TABLE preguntas_ia (
    id_pregunta SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id_usuario),
    pregunta TEXT,
    respuesta TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: utensilios
CREATE TABLE utensilio (
    id_utensilio SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion TEXT,
    capacidad DECIMAL(10, 2),
    tipo VARCHAR(50),
    imagen_url TEXT
);

-- Tabla: compuestos_sintetizados
CREATE TABLE compuesto_sintetizado (
    id_compuesto_sintetizado SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    formula TEXT,
    propiedades TEXT,
    descripcion TEXT
);

-- Tabla intermedia: simulacion_elemento
CREATE TABLE simulacion_elemento (
    id_simulacion_elemento SERIAL PRIMARY KEY,
    simulacion_id INTEGER REFERENCES simulacion(id_simulacion) ON DELETE CASCADE,
    elemento_id INTEGER REFERENCES elemento(id_elemento) ON DELETE CASCADE,
    cantidad DECIMAL(10, 2),
    unidad VARCHAR(20)
);

-- Tabla intermedia: reaccion_elemento
CREATE TABLE reaccion_elemento (
    id_reaccion_elemento SERIAL PRIMARY KEY,
    reaccion_id INTEGER REFERENCES reaccion(id_reaccion) ON DELETE CASCADE,
    elemento_id INTEGER REFERENCES elemento(id_elemento) ON DELETE CASCADE,
    rol VARCHAR(50)
);

-- Tabla intermedia: usuario_teoria (ACTUALIZADA)
CREATE TABLE usuario_teoria (
    id_usuario_teoria SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    teoria_id INTEGER REFERENCES teoria(id_teoria) ON DELETE CASCADE,
    leido BOOLEAN DEFAULT FALSE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tiempo_lectura_real INTEGER, -- Tiempo real que tardó en leer (en minutos)
    puntuacion INTEGER, -- Puntuación obtenida si completó ejercicios
    UNIQUE(usuario_id, teoria_id) -- Un usuario no puede tener múltiples registros para la misma teoría
);

-- Índices para usuario_teoria
CREATE INDEX idx_usuario_teoria_usuario ON usuario_teoria(usuario_id);
CREATE INDEX idx_usuario_teoria_teoria ON usuario_teoria(teoria_id);
CREATE INDEX idx_usuario_teoria_leido ON usuario_teoria(leido);

-- Tabla intermedia: teoria_tarea_simulacion (ACTUALIZADA)
CREATE TABLE teoria_tarea_simulacion (
    id_teoria_tarea_simulacion SERIAL PRIMARY KEY,
    teoria_id INTEGER REFERENCES teoria(id_teoria) ON DELETE CASCADE,
    reaccion_id INTEGER REFERENCES reaccion(id_reaccion) ON DELETE SET NULL,
    descripcion_tarea TEXT NOT NULL,
    dificultad VARCHAR(50) DEFAULT 'Intermedio' CHECK (dificultad IN ('Fácil', 'Intermedio', 'Difícil', 'Avanzado')),
    puntos_tarea INTEGER DEFAULT 25,
    orden INTEGER DEFAULT 1, -- Para ordenar las tareas de una teoría
    activo BOOLEAN DEFAULT TRUE
);

-- Índices para teoria_tarea_simulacion
CREATE INDEX idx_tarea_teoria ON teoria_tarea_simulacion(teoria_id);
CREATE INDEX idx_tarea_orden ON teoria_tarea_simulacion(teoria_id, orden);

-- Nueva tabla: teoria_recursos (recursos adicionales para cada teoría)
CREATE TABLE teoria_recursos (
    id_recurso SERIAL PRIMARY KEY,
    teoria_id INTEGER REFERENCES teoria(id_teoria) ON DELETE CASCADE,
    tipo_recurso VARCHAR(50) NOT NULL CHECK (tipo_recurso IN ('video', 'imagen', 'documento', 'enlace', 'simulacion')),
    titulo VARCHAR(200) NOT NULL,
    url TEXT,
    descripcion TEXT,
    orden INTEGER DEFAULT 1,
    activo BOOLEAN DEFAULT TRUE
);

-- Nueva tabla: teoria_favoritos (sistema de bookmarks/favoritos)
CREATE TABLE teoria_favoritos (
    id_favorito SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    teoria_id INTEGER REFERENCES teoria(id_teoria) ON DELETE CASCADE,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, teoria_id)
);

-- =====================================================
-- DATOS INICIALES PARA TEORÍAS
-- =====================================================

-- Insertar categorías base de teorías con datos mejorados
INSERT INTO teoria (titulo, contenido, categoria, tiempo_lectura, dificultad, puntos) VALUES
('Introducción a la Estructura Atómica', 
'La estructura atómica es fundamental para entender la química moderna. Un átomo está compuesto por:

## Componentes del Átomo

### 1. Núcleo
Contiene protones (carga positiva) y neutrones (sin carga). El núcleo es extremadamente pequeño pero concentra casi toda la masa del átomo.

### 2. Electrones
Partículas con carga negativa que orbitan alrededor del núcleo en regiones llamadas orbitales.

## Conceptos Clave

**Número atómico (Z):** Número de protones en el núcleo
**Número másico (A):** Suma de protones y neutrones
**Isótopos:** Átomos del mismo elemento con diferente número de neutrones

## Modelos Atómicos Históricos

La comprensión del átomo ha evolucionado a través de la historia:

1. **Modelo de Dalton (1803):** Átomo como esfera indivisible
2. **Modelo de Thomson (1897):** "Pudín de pasas"
3. **Modelo de Rutherford (1911):** Átomo nuclear
4. **Modelo de Bohr (1913):** Órbitas circulares
5. **Modelo cuántico actual:** Orbitales probabilísticos

La comprensión de la estructura atómica nos permite predecir las propiedades químicas de los elementos y explicar cómo se forman los enlaces químicos.',
'Estructura Atómica', 12, 'Básico', 40),

('Configuración Electrónica y Orbitales',
'La configuración electrónica describe cómo se distribuyen los electrones en los orbitales atómicos.

## Principios Fundamentales

### 1. Principio de Aufbau
Los electrones ocupan orbitales de menor energía primero

### 2. Principio de Exclusión de Pauli
Máximo 2 electrones por orbital con spins opuestos

### 3. Regla de Hund
Un electrón por orbital antes de aparear

## Orden de Llenado de Orbitales
1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰ 4p⁶ 5s² 4d¹⁰ 5p⁶ 6s² 4f¹⁴ 5d¹⁰ 6p⁶ 7s² 5f¹⁴ 6d¹⁰ 7p⁶

## Ejemplos de Configuraciones
- **Hidrógeno (H):** 1s¹
- **Carbono (C):** 1s² 2s² 2p²
- **Oxígeno (O):** 1s² 2s² 2p⁴
- **Hierro (Fe):** [Ar] 4s² 3d⁶

## Configuraciones Electrónicas y Propiedades
- Elementos con orbitales semillenos o llenos son más estables
- La configuración electrónica determina las propiedades químicas
- Los electrones de valencia participan en los enlaces químicos',
'Estructura Atómica', 15, 'Intermedio', 60),

('Fundamentos del Enlace Químico',
'Los enlaces químicos son las fuerzas que mantienen unidos los átomos en compuestos químicos.

## Tipos Principales de Enlaces

### 1. Enlace Iónico
- Se forma entre metales y no metales
- Transferencia completa de electrones
- Formación de cationes y aniones
- **Ejemplo:** NaCl (cloruro de sodio)

### 2. Enlace Covalente
- Se forma entre no metales
- Compartición de pares de electrones
- Puede ser polar o no polar
- **Ejemplos:** H₂O, CO₂, CH₄

### 3. Enlace Metálico
- Se forma entre átomos metálicos
- "Mar de electrones" deslocalizados
- Explica propiedades como conductividad

## Propiedades según el Tipo de Enlace

**Iónicos:** Altos puntos de fusión, conducen electricidad en solución
**Covalentes:** Variedad de propiedades, generalmente no conductores
**Metálicos:** Buenos conductores, maleables, dúctiles

## Teorías de Enlace
- **Teoría de Lewis:** Estructuras de puntos
- **Teoría VSEPR:** Geometría molecular
- **Teoría de orbitales moleculares:** Descripción cuántica',
'Enlace Químico', 18, 'Intermedio', 70),

('Geometría Molecular y Teoría VSEPR',
'La teoría VSEPR (Repulsión de Pares de Electrones en la Capa de Valencia) predice la geometría molecular.

## Postulados Básicos
1. Los pares de electrones se repelen y se alejan lo máximo posible
2. Los pares enlazantes y no enlazantes ocupan espacio
3. Los pares no enlazantes ocupan más espacio que los enlazantes

## Geometrías Moleculares Comunes

### 2 Pares de Electrones
- **Lineal (180°):** BeCl₂, CO₂

### 3 Pares de Electrones
- **Triangular plana (120°):** BF₃
- **Angular:** SO₂ (con par no enlazante)

### 4 Pares de Electrones
- **Tetraédrica (109.5°):** CH₄
- **Piramidal trigonal:** NH₃
- **Angular:** H₂O

### 5 Pares de Electrones
- **Bipiramidal trigonal:** PF₅
- **Balancín:** SF₄

### 6 Pares de Electrones
- **Octaédrica:** SF₆
- **Piramidal cuadrada:** BrF₅

## Importancia de la Geometría
- Determina la polaridad molecular
- Afecta las propiedades físicas y químicas
- Influye en la reactividad y función biológica',
'Enlace Químico', 20, 'Intermedio', 75),

('Introducción a la Estequiometría',
'La estequiometría es el cálculo de las cantidades de reactivos y productos en las reacciones químicas.

## Conceptos Fundamentales

### 1. Mol
- Unidad básica de cantidad de sustancia
- 1 mol = 6.022 × 10²³ entidades (número de Avogadro)
- Permite contar átomos y moléculas

### 2. Masa Molar
- Masa de 1 mol de sustancia (g/mol)
- Numéricamente igual al peso atómico/molecular

### 3. Ecuaciones Químicas Balanceadas
- Ley de conservación de la masa
- Mismo número de átomos de cada elemento en ambos lados

## Tipos de Cálculos Estequiométricos

### Mol a Mol
N₂ + 3H₂ → 2NH₃
1 mol N₂ : 3 mol H₂ : 2 mol NH₃

### Masa a Masa
1. Convertir gramos a moles
2. Usar proporción molar
3. Convertir moles a gramos

### Reactivo Limitante
- Reactivo que se consume completamente
- Determina la cantidad de producto formado

### Rendimiento de Reacción
- **Rendimiento teórico:** máximo calculado
- **Rendimiento real:** obtenido experimentalmente
- **% Rendimiento = (real/teórico) × 100**',
'Estequiometría', 16, 'Intermedio', 65);

-- Insertar tareas para las teorías
INSERT INTO teoria_tarea_simulacion (teoria_id, descripcion_tarea, dificultad, puntos_tarea, orden) VALUES
(1, 'Determinar la configuración electrónica de los primeros 20 elementos de la tabla periódica', 'Fácil', 20, 1),
(1, 'Calcular el número de protones, neutrones y electrones en diferentes isótopos', 'Intermedio', 30, 2),
(2, 'Dibujar diagramas orbitales para elementos de transición', 'Intermedio', 35, 1),
(2, 'Aplicar las reglas de llenado electrónico en casos complejos', 'Difícil', 40, 2),
(3, 'Predecir el tipo de enlace en diferentes compuestos basándose en la electronegatividad', 'Fácil', 25, 1),
(3, 'Analizar propiedades físicas basándose en el tipo de enlace', 'Intermedio', 30, 2),
(4, 'Determinar la geometría molecular usando VSEPR', 'Intermedio', 35, 1),
(4, 'Predecir polaridad molecular basándose en geometría', 'Intermedio', 30, 2),
(5, 'Resolver problemas básicos de conversión mol-gramos', 'Fácil', 20, 1),
(5, 'Calcular reactivo limitante en reacciones químicas', 'Intermedio', 35, 2);

-- =====================================================
-- FUNCIONES Y TRIGGERS ÚTILES
-- =====================================================

-- Función para actualizar estadísticas de progreso
CREATE OR REPLACE FUNCTION actualizar_estadisticas_usuario()
RETURNS TRIGGER AS $$
BEGIN
    -- Aquí podrías agregar lógica para actualizar estadísticas
    -- Por ejemplo, calcular porcentaje de completitud, etc.
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estadísticas cuando se marca una teoría como leída
CREATE TRIGGER trigger_actualizar_estadisticas
    AFTER INSERT OR UPDATE ON usuario_teoria
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_estadisticas_usuario();

-- Vista para estadísticas rápidas por usuario
CREATE VIEW vista_estadisticas_usuario AS
SELECT 
    u.id_usuario,
    u.nombre,
    COUNT(ut.teoria_id) as teorias_leidas,
    (SELECT COUNT(*) FROM teoria WHERE activo = true) as total_teorias,
    ROUND(
        (COUNT(ut.teoria_id)::DECIMAL / (SELECT COUNT(*) FROM teoria WHERE activo = true)) * 100, 
        2
    ) as porcentaje_completado,
    SUM(t.puntos) as puntos_totales
FROM usuario u
LEFT JOIN usuario_teoria ut ON u.id_usuario = ut.usuario_id AND ut.leido = true
LEFT JOIN teoria t ON ut.teoria_id = t.id_teoria
GROUP BY u.id_usuario, u.nombre;

-- Comentarios en las tablas para documentación
COMMENT ON TABLE teoria IS 'Almacena los contenidos teóricos de química con metadatos mejorados';
COMMENT ON COLUMN teoria.tiempo_lectura IS 'Tiempo estimado de lectura en minutos';
COMMENT ON COLUMN teoria.dificultad IS 'Nivel de dificultad: Básico, Intermedio, Avanzado';
COMMENT ON COLUMN teoria.puntos IS 'Puntos que obtiene el usuario al completar la teoría';

COMMENT ON TABLE usuario_teoria IS 'Tracking del progreso de lectura de cada usuario';
COMMENT ON COLUMN usuario_teoria.tiempo_lectura_real IS 'Tiempo real que tardó el usuario en leer (en minutos)';

COMMENT ON TABLE teoria_tarea_simulacion IS 'Tareas y ejercicios asociados a cada teoría';
COMMENT ON COLUMN teoria_tarea_simulacion.puntos_tarea IS 'Puntos adicionales por completar la tarea';

COMMENT ON TABLE teoria_recursos IS 'Recursos adicionales (videos, enlaces, etc.) para cada teoría';
COMMENT ON TABLE teoria_favoritos IS 'Sistema de favoritos/bookmarks de los usuarios';