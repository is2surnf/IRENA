-- Active: 1750015819059@@127.0.0.1@5000@irenatech
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

-- Tabla: teoria
CREATE TABLE teoria (
    id_teoria SERIAL PRIMARY KEY,
    titulo VARCHAR(150),
    contenido TEXT,
    categoria VARCHAR(100)
);

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
    tipo VARCHAR(50)
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

-- Tabla intermedia: usuario_teoria
CREATE TABLE usuario_teoria (
    id_usuario_teoria SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    teoria_id INTEGER REFERENCES teoria(id_teoria) ON DELETE CASCADE,
    leido BOOLEAN DEFAULT FALSE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla intermedia: teoria_tarea_simulacion
-- Vincula un tema de teoría con una reacción o simulación específica
-- que se considera una "tarea" o ejemplo práctico para ese tema.
CREATE TABLE teoria_tarea_simulacion (
    id_teoria_tarea_simulacion SERIAL PRIMARY KEY,
    teoria_id INTEGER REFERENCES teoria(id_teoria) ON DELETE CASCADE,
    -- Puedes vincular a una reacción predefinida
    reaccion_id INTEGER REFERENCES reaccion(id_reaccion) ON DELETE SET NULL,
    -- O si prefieres, a un template de simulación específica (si creas una tabla para ello)
    -- template_simulacion_id INTEGER REFERENCES template_simulacion(id_template_simulacion) ON DELETE SET NULL,
    -- O simplemente un campo de texto para la descripción de la tarea si es más abierta
    descripcion_tarea TEXT,
    -- Opcional: un indicador de dificultad, tipo de tarea, etc.
    dificultad VARCHAR(50)
);