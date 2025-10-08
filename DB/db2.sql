-- ============================================
-- LIMPIAR DATOS (excepto utensilios y elementos)
-- ============================================
-- CORRECCIÓN DE COLUMNA EN usuario_teoria
ALTER TABLE usuario_teoria 
RENAME COLUMN id_usuario TO usuario_id;

-- ACTUALIZAR CATEGORÍAS VÁLIDAS EN TEORÍA
UPDATE teoria SET categoria = 'Fundamentos' WHERE categoria = 'Reacciones';

-- VERIFICAR CORRECCIÓN
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_name = 'usuario_teoria' AND column_name LIKE '%usuario%';
TRUNCATE TABLE teoria_favoritos CASCADE;
TRUNCATE TABLE teoria_recursos CASCADE;
TRUNCATE TABLE teoria_tarea_simulacion CASCADE;
TRUNCATE TABLE usuario_teoria CASCADE;
TRUNCATE TABLE reaccion_elemento CASCADE;
TRUNCATE TABLE simulacion_elemento CASCADE;
TRUNCATE TABLE compuesto_sintetizado CASCADE;
TRUNCATE TABLE preguntas_ia CASCADE;
TRUNCATE TABLE reaccion CASCADE;
TRUNCATE TABLE simulacion CASCADE;
TRUNCATE TABLE teoria CASCADE;
TRUNCATE TABLE usuario CASCADE;

-- Resetear secuencias
ALTER SEQUENCE usuario_id_usuario_seq RESTART WITH 1;
ALTER SEQUENCE teoria_id_teoria_seq RESTART WITH 1;
ALTER SEQUENCE reaccion_id_reaccion_seq RESTART WITH 1;
ALTER SEQUENCE simulacion_id_simulacion_seq RESTART WITH 1;
ALTER SEQUENCE teoria_tarea_simulacion_id_teoria_tarea_simulacion_seq RESTART WITH 1;

-- ============================================
-- USUARIOS DE PRUEBA
-- ============================================
INSERT INTO usuario (nombre, correo, tipo_usuario) VALUES
('Estudiante Demo', 'estudiante@demo.com', 'registrado'),
('Profesor Química', 'profesor@demo.com', 'registrado'),
('Usuario Anónimo', NULL, 'anonimo'),
('Ana López', 'ana.lopez@estudiante.com', 'registrado'),
('Carlos Méndez', 'carlos.mendez@estudiante.com', 'registrado');

-- ============================================
-- TEORÍA - Contenido educativo organizado
-- ============================================


INSERT INTO teoria (titulo, contenido, categoria, tiempo_lectura, dificultad, puntos) VALUES
(
    'Introducción a la Química',
    'La química es la ciencia que estudia la composición, estructura y propiedades de la materia, así como los cambios que esta experimenta durante las reacciones químicas.

La materia es todo aquello que tiene masa y ocupa un lugar en el espacio. Está formada por átomos, que son las unidades fundamentales de los elementos químicos.

Conceptos clave:
• Átomo: Partícula más pequeña de un elemento que conserva sus propiedades
• Molécula: Conjunto de átomos unidos por enlaces químicos
• Elemento: Sustancia pura formada por un solo tipo de átomo
• Compuesto: Sustancia formada por dos o más elementos diferentes

Las propiedades de la materia se dividen en:
1. Propiedades físicas: Color, densidad, punto de fusión, punto de ebullición
2. Propiedades químicas: Reactividad, inflamabilidad, acidez/basicidad

La química se relaciona con todas las áreas de la vida: medicina, alimentación, tecnología, medio ambiente y más.',
    'Fundamentos',
    12,
    'Básico',
    50
),
(
    'Estados de la Materia',
    'La materia puede existir en diferentes estados físicos dependiendo de la temperatura y presión. Los estados principales son:

SÓLIDO
• Partículas muy juntas y ordenadas
• Forma y volumen definidos
• Las partículas vibran pero no se desplazan
• Ejemplo: Hielo, sal, hierro

LÍQUIDO
• Partículas juntas pero desordenadas
• Volumen definido, forma variable
• Las partículas pueden desplazarse
• Ejemplo: Agua, alcohol, aceite

GASEOSO
• Partículas muy separadas y desordenadas
• Sin forma ni volumen definido
• Partículas se mueven libremente
• Ejemplo: Oxígeno, vapor de agua, CO₂

CAMBIOS DE ESTADO:
• Fusión: sólido → líquido (absorbe calor)
• Solidificación: líquido → sólido (libera calor)
• Vaporización: líquido → gas (absorbe calor)
• Condensación: gas → líquido (libera calor)
• Sublimación: sólido → gas (absorbe calor)
• Deposición: gas → sólido (libera calor)

Cada sustancia tiene temperaturas específicas para estos cambios.',
    'Fundamentos',
    15,
    'Básico',
    50
),


(
    'El Átomo y sus Partículas',
    'El átomo es la unidad fundamental de la materia. Aunque su nombre significa "indivisible", sabemos que está compuesto por partículas subatómicas.

ESTRUCTURA ATÓMICA:

1. NÚCLEO (centro del átomo)
   • Protones: Carga positiva (+), masa = 1 uma
   • Neutrones: Sin carga, masa = 1 uma
   • Contiene el 99.9% de la masa del átomo

2. CORTEZA ELECTRÓNICA
   • Electrones: Carga negativa (-), masa despreciable
   • Giran alrededor del núcleo en niveles de energía
   • Determinan las propiedades químicas

CONCEPTOS IMPORTANTES:
• Número atómico (Z): Cantidad de protones
• Número de masa (A): Protones + neutrones
• Átomo neutro: Igual cantidad de protones y electrones

ISÓTOPOS:
Átomos del mismo elemento con diferente número de neutrones.
Ejemplo: Carbono-12, Carbono-13, Carbono-14

El modelo atómico actual describe a los electrones como nubes de probabilidad (orbitales) en lugar de órbitas definidas.',
    'Estructura Atómica',
    18,
    'Intermedio',
    75
),
(
    'Tabla Periódica de los Elementos',
    'La tabla periódica organiza todos los elementos químicos conocidos según sus propiedades y estructura atómica.

ORGANIZACIÓN:
• Filas (Períodos): 7 períodos, indican niveles de energía
• Columnas (Grupos): 18 grupos, elementos con propiedades similares
• Números atómicos crecientes de izquierda a derecha

CLASIFICACIÓN PRINCIPAL:

METALES (lado izquierdo)
• Buenos conductores de calor y electricidad
• Maleables y dúctiles
• Brillo metálico
• Ejemplos: Hierro, cobre, oro, plata

NO METALES (lado derecho)
• Malos conductores
• Frágiles en estado sólido
• Sin brillo metálico
• Ejemplos: Oxígeno, nitrógeno, carbono, azufre

METALOIDES (línea escalonada)
• Propiedades intermedias
• Semiconductores
• Ejemplos: Silicio, germanio, arsénico

GRUPOS IMPORTANTES:
• Grupo 1: Metales alcalinos (muy reactivos)
• Grupo 17: Halógenos (muy reactivos)
• Grupo 18: Gases nobles (inertes)

La tabla periódica permite predecir el comportamiento químico de los elementos.',
    'Estructura Atómica',
    20,
    'Intermedio',
    75
),


(
    'Enlaces Químicos: Iónico y Covalente',
    'Los átomos se unen formando enlaces químicos para alcanzar estabilidad. Los principales tipos son:

ENLACE IÓNICO:
• Se forma entre metal y no metal
• Transferencia completa de electrones
• El metal pierde electrones (catión +)
• El no metal gana electrones (anión -)
• Atracción electrostática entre iones
• Ejemplos: NaCl, MgO, CaF₂

Propiedades de compuestos iónicos:
- Puntos de fusión altos
- Sólidos cristalinos
- Conducen electricidad fundidos o en disolución
- Solubles en agua

ENLACE COVALENTE:
• Se forma entre no metales
• Compartición de pares de electrones
• Los átomos no se convierten en iones
• Pueden ser simples, dobles o triples
• Ejemplos: H₂O, CO₂, CH₄

Propiedades de compuestos covalentes:
- Puntos de fusión bajos
- Pueden ser gases, líquidos o sólidos
- No conducen electricidad
- Algunos solubles en agua, otros no

La regla del octeto explica que los átomos buscan tener 8 electrones en su capa externa para ser estables.',
    'Enlace Químico',
    22,
    'Intermedio',
    100
),


(
    'Reacciones Químicas y Ecuaciones',
    'Una reacción química es un proceso donde las sustancias (reactivos) se transforman en otras (productos).

TIPOS DE REACCIONES:

1. SÍNTESIS (A + B → AB)
   Dos o más sustancias se combinan
   Ejemplo: 2H₂ + O₂ → 2H₂O

2. DESCOMPOSICIÓN (AB → A + B)
   Una sustancia se divide en dos o más
   Ejemplo: 2H₂O → 2H₂ + O₂

3. SUSTITUCIÓN SIMPLE (A + BC → AC + B)
   Un elemento reemplaza a otro
   Ejemplo: Zn + 2HCl → ZnCl₂ + H₂

4. DOBLE SUSTITUCIÓN (AB + CD → AD + CB)
   Intercambio de componentes
   Ejemplo: NaCl + AgNO₃ → NaNO₃ + AgCl

5. COMBUSTIÓN
   Reacción con oxígeno, libera energía
   Ejemplo: CH₄ + 2O₂ → CO₂ + 2H₂O

BALANCEO DE ECUACIONES:
Ley de conservación de la masa: los átomos no se crean ni destruyen
- Mismo número de átomos en reactivos y productos
- Se ajustan los coeficientes, no los subíndices
- Los coeficientes indican proporción de moléculas',
    'Estequiometría',
    18,
    'Intermedio',
    100
),
(
    'Cálculos Estequiométricos',
    'La estequiometría permite calcular cantidades de reactivos y productos en una reacción química.

CONCEPTOS FUNDAMENTALES:

MOL:
• Unidad básica de cantidad de sustancia
• 1 mol = 6.022 × 10²³ partículas (número de Avogadro)
• Permite relacionar masa con número de partículas

MASA MOLAR:
• Masa de un mol de sustancia (g/mol)
• Numéricamente igual a la masa atómica/molecular
• Ejemplo: H₂O = 18 g/mol (2×1 + 16)

PASOS PARA CÁLCULOS:

1. Escribir y balancear la ecuación
2. Convertir masas a moles: n = m/M
3. Usar la proporción de la ecuación
4. Convertir moles a masa del producto

EJEMPLO:
2H₂ + O₂ → 2H₂O

Si tengo 4g de H₂:
• Moles H₂ = 4g / 2g/mol = 2 mol
• Según ecuación: 2 mol H₂ → 2 mol H₂O
• Masa H₂O = 2 mol × 18 g/mol = 36g

REACTIVO LIMITANTE:
• El reactivo que se consume primero
• Determina la cantidad máxima de producto
• El otro reactivo queda en exceso

RENDIMIENTO:
• Teórico: máximo calculado
• Real: obtenido experimentalmente
• % Rendimiento = (real/teórico) × 100',
    'Estequiometría',
    25,
    'Avanzado',
    150
),


(
    'Energía en las Reacciones Químicas',
    'Todas las reacciones químicas implican cambios de energía, principalmente en forma de calor.

TIPOS DE REACCIONES SEGÚN ENERGÍA:

EXOTÉRMICAS:
• Liberan energía al ambiente
• Productos tienen menos energía que reactivos
• ΔH < 0 (negativo)
• Ejemplos: Combustión, oxidación del hierro, neutralización
• Se siente calor al tacto

ENDOTÉRMICAS:
• Absorben energía del ambiente
• Productos tienen más energía que reactivos
• ΔH > 0 (positivo)
• Ejemplos: Fotosíntesis, descomposición, evaporación
• Se siente frío al tacto

ENTALPÍA (H):
• Contenido energético total de un sistema
• ΔH = H(productos) - H(reactivos)
• Se mide en kJ/mol o kcal/mol

LEY DE HESS:
El cambio de entalpía total es independiente del camino seguido.
Permite calcular ΔH de reacciones complejas.

FACTORES QUE AFECTAN:
• Naturaleza de reactivos y productos
• Estados físicos (s, l, g)
• Cantidad de sustancias
• Condiciones de presión y temperatura

La termoquímica es crucial en industria, biología y vida cotidiana.',
    'Termoquímica',
    20,
    'Intermedio',
    100
),


(
    'Velocidad de las Reacciones',
    'La cinética química estudia la rapidez con que ocurren las reacciones y los factores que la afectan.

VELOCIDAD DE REACCIÓN:
• Cambio en concentración por unidad de tiempo
• v = Δ[concentración] / Δtiempo
• Puede medirse por aparición de productos o desaparición de reactivos

FACTORES QUE AFECTAN LA VELOCIDAD:

1. CONCENTRACIÓN:
   • Mayor concentración → mayor velocidad
   • Más partículas → más choques efectivos

2. TEMPERATURA:
   • Mayor temperatura → mayor velocidad
   • Partículas más rápidas → más choques energéticos
   • Regla general: +10°C duplica la velocidad

3. SUPERFICIE DE CONTACTO:
   • Mayor superficie → mayor velocidad
   • Polvo reacciona más rápido que un bloque

4. CATALIZADORES:
   • Aumentan velocidad sin consumirse
   • Disminuyen energía de activación
   • Ejemplos: Enzimas en cuerpo, platino en autos

5. NATURALEZA DE REACTIVOS:
   • Algunos materiales reaccionan más rápido que otros

TEORÍA DE COLISIONES:
Para que ocurra reacción:
- Las partículas deben chocar
- Con orientación correcta
- Con energía suficiente (energía de activación)

ENERGÍA DE ACTIVACIÓN (Ea):
Energía mínima necesaria para iniciar la reacción.',
    'Cinética Química',
    22,
    'Avanzado',
    125
),


(
    'Equilibrio Químico Dinámico',
    'El equilibrio químico es un estado donde las velocidades de reacción directa e inversa son iguales.

CARACTERÍSTICAS:

EQUILIBRIO DINÁMICO:
• Las reacciones no se detienen
• Velocidad directa = velocidad inversa
• Concentraciones constantes (no iguales)
• Sistema cerrado
• Símbolo: ⇌

EJEMPLO:
N₂(g) + 3H₂(g) ⇌ 2NH₃(g)

CONSTANTE DE EQUILIBRIO (Keq):
• Relación entre productos y reactivos en equilibrio
• Keq = [productos]ⁿ / [reactivos]ᵐ
• Solo incluye gases y acuosos
• Valor constante a temperatura dada

Interpretación:
- Keq >> 1: favorece productos
- Keq << 1: favorece reactivos
- Keq ≈ 1: cantidades similares

PRINCIPIO DE LE CHATELIER:
Si se perturba un equilibrio, el sistema se desplaza para contrarrestar el cambio.

Perturbaciones:
1. Concentración: agregar/quitar sustancias
2. Presión: cambios en volumen (gases)
3. Temperatura: calentar/enfriar

EQUILIBRIO HETEROGÉNEO:
• Sustancias en diferentes fases
• No se incluyen sólidos ni líquidos puros en Keq',
    'Equilibrio Químico',
    20,
    'Avanzado',
    125
),


(
    'Ácidos y Bases: Propiedades',
    'Los ácidos y bases son sustancias químicas con propiedades características opuestas.

ÁCIDOS:

Propiedades:
• Sabor agrio (no probar en laboratorio)
• Tornasolazul → rojo
• pH < 7
• Liberan H⁺ en agua (iones hidronio H₃O⁺)
• Corroen metales, producen H₂
• Ejemplos: HCl, H₂SO₄, HNO₃, CH₃COOH

Ácidos comunes:
- Ácido clorhídrico (HCl): jugos gástricos
- Ácido sulfúrico (H₂SO₄): baterías
- Ácido acético (CH₃COOH): vinagre
- Ácido cítrico: limones y naranjas

BASES:

Propiedades:
• Sabor amargo
• Tacto jabonoso
• Tornasolrojo → azul
• pH > 7
• Liberan OH⁻ en agua
• Ejemplos: NaOH, KOH, Ca(OH)₂, NH₃

Bases comunes:
- Hidróxido de sodio (NaOH): limpiadores
- Hidróxido de calcio (Ca(OH)₂): cal
- Amoníaco (NH₃): limpieza
- Bicarbonato de sodio: cocina

ESCALA pH:
• 0-6: ácido (menor = más ácido)
• 7: neutro (agua pura)
• 8-14: básico (mayor = más básico)

INDICADORES:
Sustancias que cambian color según pH
- Fenolftaleína: incolora (ácido) → rosada (base)
- Tornasol: rojo (ácido) → azul (base)
- Col morada: indicador natural',
    'Ácidos y Bases',
    18,
    'Básico',
    75
),
(
    'Neutralización y Titulación',
    'La neutralización es la reacción entre un ácido y una base para formar sal y agua.

REACCIÓN DE NEUTRALIZACIÓN:

Ecuación general:
Ácido + Base → Sal + Agua

Ejemplos:
• HCl + NaOH → NaCl + H₂O
• H₂SO₄ + 2KOH → K₂SO₄ + 2H₂O
• HNO₃ + Ca(OH)₂ → Ca(NO₃)₂ + H₂O

SALES:
• Compuesto iónico formado
• Catión de la base + Anión del ácido
• Ejemplos: NaCl (sal de mesa), K₂SO₄, CaCO₃

TITULACIÓN:

Método para determinar concentración desconocida:

Procedimiento:
1. Cantidad conocida de ácido/base (analito)
2. Agregar base/ácido de concentración conocida (titulante)
3. Usar indicador para detectar punto final
4. Calcular concentración

PUNTO DE EQUIVALENCIA:
• Moles de ácido = moles de base
• Neutralización completa
• pH depende de fuerza de ácido/base

INDICADORES EN TITULACIÓN:
• Fenolftaleína: pH 8.2-10 (incolora → rosa)
• Naranja de metilo: pH 3.1-4.4 (rojo → amarillo)
• Azul de bromotimol: pH 6.0-7.6 (amarillo → azul)

APLICACIONES:
• Control de calidad en industria
• Análisis de aguas
• Medicina (antiácidos)
• Agricultura (análisis de suelos)',
    'Ácidos y Bases',
    20,
    'Intermedio',
    100
),


(
    'Reacciones de Oxidación-Reducción',
    'Las reacciones redox implican transferencia de electrones entre sustancias.

CONCEPTOS FUNDAMENTALES:

OXIDACIÓN:
• Pérdida de electrones
• Aumento en número de oxidación
• El átomo se oxida
• Agente reductor (dona electrones)

REDUCCIÓN:
• Ganancia de electrones
• Disminución en número de oxidación
• El átomo se reduce
• Agente oxidante (acepta electrones)

Nemotecnia: "LEO dice GER"
LEO: Pierde Electrones = Oxidación
GER: Gana Electrones = Reducción

NÚMERO DE OXIDACIÓN:
• Carga aparente de un átomo
• Reglas para asignar:
  - Elementos libres: 0
  - Iones monoatómicos: su carga
  - Hidrógeno: +1 (excepto en hidruros: -1)
  - Oxígeno: -2 (excepto en peróxidos: -1)
  - Suma en compuesto neutro: 0
  - Suma en ión: carga del ión

EJEMPLOS DE REDOX:

1. Oxidación del hierro:
   4Fe + 3O₂ → 2Fe₂O₃
   Fe: 0 → +3 (oxidación)
   O: 0 → -2 (reducción)

2. Fotosíntesis:
   6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
   Carbono se reduce
   Oxígeno se oxida

APLICACIONES:
• Pilas y baterías
• Corrosión de metales
• Metabolismo celular
• Blanqueadores
• Metalurgia',
    'Redox',
    22,
    'Avanzado',
    125
),


(
    'Introducción a la Química Orgánica',
    'La química orgánica estudia los compuestos del carbono, que forman la base de la vida.

¿POR QUÉ EL CARBONO?

Características únicas:
• 4 electrones de valencia
• Forma 4 enlaces covalentes
• Enlaces con otros carbonos (cadenas)
• Enlaces simples, dobles o triples
• Forma millones de compuestos

HIDROCARBUROS:
Compuestos formados solo por C e H

1. ALCANOS (enlaces simples)
   • Fórmula: CₙH₂ₙ₊₂
   • Terminación: -ano
   • Ejemplos: Metano (CH₄), Etano (C₂H₆), Propano (C₃H₈)
   • Poco reactivos

2. ALQUENOS (un doble enlace)
   • Fórmula: CₙH₂ₙ
   • Terminación: -eno
   • Ejemplos: Eteno (C₂H₄), Propeno (C₃H₆)
   • Más reactivos que alcanos

3. ALQUINOS (un triple enlace)
   • Fórmula: CₙH₂ₙ₋₂
   • Terminación: -ino
   • Ejemplos: Etino/Acetileno (C₂H₂)
   • Muy reactivos

GRUPOS FUNCIONALES:
Átomos o grupos que definen propiedades:
• Alcoholes: -OH
• Ácidos carboxílicos: -COOH
• Aldehídos: -CHO
• Cetonas: -CO-
• Aminas: -NH₂

ISOMERÍA:
Misma fórmula molecular, diferente estructura
• Isómeros de cadena
• Isómeros de posición
• Isómeros funcionales

La química orgánica es fundamental para entender biomoléculas, medicamentos, plásticos y combustibles.',
    'Química Orgánica',
    25,
    'Intermedio',
    100
);

-- ============================================
-- REACCIONES QUÍMICAS
-- ============================================
INSERT INTO reaccion (nombre, descripcion, condiciones, resultado_esperado) VALUES
(
    'Síntesis de Agua',
    'Reacción de hidrógeno con oxígeno para formar agua. Es una reacción exotérmica y explosiva.',
    'Requiere chispa eléctrica o calor. Usar cantidades pequeñas. Protección adecuada.',
    'Formación de agua líquida con liberación de energía. 2H₂ + O₂ → 2H₂O'
),
(
    'Neutralización Ácido-Base',
    'Reacción entre ácido clorhídrico y hidróxido de sodio para formar sal y agua.',
    'Temperatura ambiente. Agregar el ácido lentamente sobre la base. Usar indicador.',
    'Formación de cloruro de sodio y agua. Cambio de color del indicador. HCl + NaOH → NaCl + H₂O'
),
(
    'Descomposición del Peróxido de Hidrógeno',
    'Descomposición catalizada de agua oxigenada en agua y oxígeno.',
    'Agregar MnO₂ como catalizador. Temperatura ambiente.',
    'Desprendimiento de burbujas de oxígeno. 2H₂O₂ → 2H₂O + O₂'
),
(
    'Oxidación del Magnesio',
    'Combustión del magnesio en presencia de oxígeno formando óxido de magnesio.',
    'Encender cinta de magnesio con mechero. No mirar directamente la luz.',
    'Llama brillante blanca. Formación de polvo blanco. 2Mg + O₂ → 2MgO'
),
(
    'Precipitación de Cloruro de Plata',
    'Reacción de doble desplazamiento que forma un precipitado blanco.',
    'Mezclar soluciones de NaCl y AgNO₃ a temperatura ambiente.',
    'Precipitado blanco de AgCl. NaCl + AgNO₃ → AgCl↓ + NaNO₃'
),
(
    'Formación de Dióxido de Carbono',
    'Reacción del bicarbonato de sodio con vinagre (ácido acético).',
    'Temperatura ambiente. Agregar vinagre sobre bicarbonato.',
    'Efervescencia, producción de CO₂ gaseoso. NaHCO₃ + CH₃COOH → CO₂ + H₂O + NaCH₃COO'
),
(
    'Reducción del Óxido de Cobre',
    'Reducción de óxido de cobre (II) con hidrógeno para obtener cobre metálico.',
    'Calentar con flujo de H₂. Sistema cerrado. Temperatura alta.',
    'Formación de cobre rojizo y agua. CuO + H₂ → Cu + H₂O'
),
(
    'Combustión del Metano',
    'Oxidación completa del metano con oxígeno produciendo dióxido de carbono y agua.',
    'Proporcionar oxígeno suficiente. Ignición con llama.',
    'Llama azul limpia. Producción de CO₂ y H₂O. CH₄ + 2O₂ → CO₂ + 2H₂O'
);

-- ============================================
-- TAREAS DE SIMULACIÓN POR TEORÍA
-- ============================================
INSERT INTO teoria_tarea_simulacion (teoria_id, reaccion_id, descripcion_tarea, dificultad, puntos_tarea, orden) VALUES

(1, NULL, 'Identifica las propiedades físicas y químicas de 3 elementos diferentes en el laboratorio virtual.', 'Fácil', 25, 1),
(1, NULL, 'Clasifica 5 sustancias en elementos, compuestos o mezclas según sus características.', 'Fácil', 30, 2),


(2, NULL, 'Observa y registra los cambios de estado del agua al variar la temperatura.', 'Fácil', 25, 1),
(2, NULL, 'Calcula la energía necesaria para fundir y evaporar una cantidad específica de hielo.', 'Intermedio', 40, 2),


(3, NULL, 'Determina el número de protones, neutrones y electrones de 5 elementos dados.', 'Intermedio', 35, 1),
(3, NULL, 'Identifica isótopos del carbono y explica sus diferencias.', 'Intermedio', 40, 2),


(4, NULL, 'Ubica 10 elementos en la tabla periódica y clasifícalos según sus propiedades.', 'Fácil', 30, 1),
(4, NULL, 'Predice las propiedades de un elemento basándote en su posición en la tabla.', 'Intermedio', 45, 2),


(5, 2, 'Forma cloruro de sodio y explica el tipo de enlace presente.', 'Intermedio', 50, 1),
(5, 1, 'Analiza el tipo de enlace en la molécula de agua y dibuja su estructura.', 'Intermedio', 45, 2),

(6, 1, 'Balancea 5 ecuaciones químicas de diferentes tipos de reacciones.', 'Intermedio', 40, 1),
(6, 4, 'Realiza la oxidación del magnesio y clasifica el tipo de reacción.', 'Intermedio', 50, 2),


(7, 1, 'Calcula la masa de agua producida a partir de 10g de hidrógeno.', 'Avanzado', 60, 1),
(7, 8, 'Determina el reactivo limitante en la combustión del metano con cantidades específicas.', 'Avanzado', 70, 2),


(8, 4, 'Mide el cambio de temperatura en la oxidación del magnesio y clasifica la reacción.', 'Intermedio', 45, 1),
(8, 3, 'Observa la descomposición del peróxido y explica el cambio energético.', 'Intermedio', 40, 2),


(9, 3, 'Investiga cómo afecta la concentración de H₂O₂ en la velocidad de descomposición.', 'Avanzado', 65, 1),
(9, 6, 'Compara la velocidad de reacción del bicarbonato con vinagre a diferentes temperaturas.', 'Avanzado', 60, 2),


(10, NULL, 'Perturba un sistema en equilibrio variando concentraciones y observa el desplazamiento.', 'Avanzado', 70, 1),
(10, NULL, 'Calcula la constante de equilibrio para una reacción dada.', 'Avanzado', 75, 2),


(11, NULL, 'Mide el pH de 5 sustancias comunes y clasifícalas como ácidos o bases.', 'Fácil', 30, 1),
(11, NULL, 'Observa el cambio de color de indicadores naturales con diferentes sustancias.', 'Fácil', 25, 2),


(12, 2, 'Realiza una titulación ácido-base y calcula la concentración desconocida.', 'Avanzado', 80, 1),
(12, 2, 'Prepara una solución salina mediante neutralización completa.', 'Intermedio', 50, 2),


(13, 7, 'Identifica la oxidación y reducción en la reacción del óxido de cobre con hidrógeno.', 'Avanzado', 70, 1),
(13, 4, 'Asigna números de oxidación a todos los elementos en la oxidación del magnesio.', 'Avanzado', 65, 2),

(14, NULL, 'Construye modelos moleculares de metano, etano y propano.', 'Intermedio', 45, 1),
(14, NULL, 'Identifica grupos funcionales en moléculas orgánicas comunes.', 'Intermedio', 50, 2);

-- ============================================
-- RELACIONES REACCION-ELEMENTO
-- ============================================
-- Asumiendo que los elementos ya existen en la tabla elemento

-- Síntesis de Agua (2H₂ + O₂ → 2H₂O)
INSERT INTO reaccion_elemento (reaccion_id, elemento_id, rol) VALUES
(1, (SELECT id_elemento FROM elemento WHERE simbolo = 'H' LIMIT 1), 'reactivo'),
(1, (SELECT id_elemento FROM elemento WHERE simbolo = 'O' LIMIT 1), 'reactivo');

-- Neutralización (HCl + NaOH → NaCl + H₂O)
INSERT INTO reaccion_elemento (reaccion_id, elemento_id, rol) VALUES
(2, (SELECT id_elemento FROM elemento WHERE simbolo = 'H' LIMIT 1), 'reactivo'),
(2, (SELECT id_elemento FROM elemento WHERE simbolo = 'Cl' LIMIT 1), 'reactivo'),
(2, (SELECT id_elemento FROM elemento WHERE simbolo = 'Na' LIMIT 1), 'reactivo'),
(2, (SELECT id_elemento FROM elemento WHERE simbolo = 'O' LIMIT 1), 'reactivo');

-- Descomposición H₂O₂
INSERT INTO reaccion_elemento (reaccion_id, elemento_id, rol) VALUES
(3, (SELECT id_elemento FROM elemento WHERE simbolo = 'H' LIMIT 1), 'reactivo'),
(3, (SELECT id_elemento FROM elemento WHERE simbolo = 'O' LIMIT 1), 'reactivo');

-- Oxidación del Magnesio (2Mg + O₂ → 2MgO)
INSERT INTO reaccion_elemento (reaccion_id, elemento_id, rol) VALUES
(4, (SELECT id_elemento FROM elemento WHERE simbolo = 'Mg' LIMIT 1), 'reactivo'),
(4, (SELECT id_elemento FROM elemento WHERE simbolo = 'O' LIMIT 1), 'reactivo');

-- Precipitación AgCl
INSERT INTO reaccion_elemento (reaccion_id, elemento_id, rol) VALUES
(5, (SELECT id_elemento FROM elemento WHERE simbolo = 'Na' LIMIT 1), 'reactivo'),
(5, (SELECT id_elemento FROM elemento WHERE simbolo = 'Cl' LIMIT 1), 'reactivo'),
(5, (SELECT id_elemento FROM elemento WHERE simbolo = 'Ag' LIMIT 1), 'reactivo'),
(5, (SELECT id_elemento FROM elemento WHERE simbolo = 'N' LIMIT 1), 'reactivo'),
(5, (SELECT id_elemento FROM elemento WHERE simbolo = 'O' LIMIT 1), 'reactivo');

-- Formación de CO₂
INSERT INTO reaccion_elemento (reaccion_id, elemento_id, rol) VALUES
(6, (SELECT id_elemento FROM elemento WHERE simbolo = 'Na' LIMIT 1), 'reactivo'),
(6, (SELECT id_elemento FROM elemento WHERE simbolo = 'H' LIMIT 1), 'reactivo'),
(6, (SELECT id_elemento FROM elemento WHERE simbolo = 'C' LIMIT 1), 'reactivo'),
(6, (SELECT id_elemento FROM elemento WHERE simbolo = 'O' LIMIT 1), 'reactivo');

-- Reducción del Óxido de Cobre (CuO + H₂ → Cu + H₂O)
INSERT INTO reaccion_elemento (reaccion_id, elemento_id, rol) VALUES
(7, (SELECT id_elemento FROM elemento WHERE simbolo = 'Cu' LIMIT 1), 'reactivo'),
(7, (SELECT id_elemento FROM elemento WHERE simbolo = 'O' LIMIT 1), 'reactivo'),
(7, (SELECT id_elemento FROM elemento WHERE simbolo = 'H' LIMIT 1), 'reactivo');

-- Combustión del Metano (CH₄ + 2O₂ → CO₂ + 2H₂O)
INSERT INTO reaccion_elemento (reaccion_id, elemento_id, rol) VALUES
(8, (SELECT id_elemento FROM elemento WHERE simbolo = 'C' LIMIT 1), 'reactivo'),
(8, (SELECT id_elemento FROM elemento WHERE simbolo = 'H' LIMIT 1), 'reactivo'),
(8, (SELECT id_elemento FROM elemento WHERE simbolo = 'O' LIMIT 1), 'reactivo');

-- ============================================
-- SIMULACIONES DE EJEMPLO
-- ============================================
INSERT INTO simulacion (usuario_id, nombre, fecha, descripcion) VALUES
(1, 'Primera síntesis de agua', '2024-01-15 10:30:00', 'Simulación inicial para aprender la reacción de síntesis'),
(1, 'Prueba de neutralización', '2024-01-20 14:45:00', 'Experimento de titulación ácido-base'),
(2, 'Combustión del magnesio', '2024-01-22 09:15:00', 'Observación de reacción exotérmica'),
(4, 'Descomposición catalizada', '2024-02-01 11:00:00', 'Efecto del catalizador en la velocidad de reacción'),
(5, 'Precipitación de sales', '2024-02-05 16:20:00', 'Formación de precipitado en reacción de doble sustitución');

-- ============================================
-- ELEMENTOS DE SIMULACIÓN
-- ============================================
INSERT INTO simulacion_elemento (simulacion_id, elemento_id, cantidad, unidad) VALUES

(1, (SELECT id_elemento FROM elemento WHERE simbolo = 'H' LIMIT 1), 2.0, 'mol'),
(1, (SELECT id_elemento FROM elemento WHERE simbolo = 'O' LIMIT 1), 1.0, 'mol'),


(2, (SELECT id_elemento FROM elemento WHERE simbolo = 'H' LIMIT 1), 0.1, 'mol'),
(2, (SELECT id_elemento FROM elemento WHERE simbolo = 'Cl' LIMIT 1), 0.1, 'mol'),
(2, (SELECT id_elemento FROM elemento WHERE simbolo = 'Na' LIMIT 1), 0.1, 'mol'),


(3, (SELECT id_elemento FROM elemento WHERE simbolo = 'Mg' LIMIT 1), 5.0, 'g'),
(3, (SELECT id_elemento FROM elemento WHERE simbolo = 'O' LIMIT 1), 3.0, 'g'),


(4, (SELECT id_elemento FROM elemento WHERE simbolo = 'H' LIMIT 1), 10.0, 'ml'),
(4, (SELECT id_elemento FROM elemento WHERE simbolo = 'O' LIMIT 1), 5.0, 'ml'),


(5, (SELECT id_elemento FROM elemento WHERE simbolo = 'Ag' LIMIT 1), 0.05, 'mol'),
(5, (SELECT id_elemento FROM elemento WHERE simbolo = 'Cl' LIMIT 1), 0.05, 'mol');

-- ============================================
-- COMPUESTOS SINTETIZADOS
-- ============================================
INSERT INTO compuesto_sintetizado (nombre, formula, propiedades, descripcion) VALUES
(
    'Agua',
    'H₂O',
    'Líquido incoloro, inodoro e insípido. Punto de fusión: 0°C, Punto de ebullición: 100°C. Densidad: 1 g/cm³. Solvente universal.',
    'Compuesto fundamental para la vida. Formado por dos átomos de hidrógeno y uno de oxígeno unidos covalentemente.'
),
(
    'Cloruro de Sodio',
    'NaCl',
    'Sólido cristalino blanco. Punto de fusión: 801°C. Soluble en agua. Sabor salado. Conduce electricidad en solución.',
    'Sal de mesa común. Compuesto iónico formado por neutralización de HCl con NaOH.'
),
(
    'Óxido de Magnesio',
    'MgO',
    'Polvo blanco. Punto de fusión: 2852°C. Poco soluble en agua. Forma solución básica. Alta estabilidad térmica.',
    'Producto de la oxidación del magnesio. Compuesto iónico con alta energía de red.'
),
(
    'Dióxido de Carbono',
    'CO₂',
    'Gas incoloro. Más denso que el aire. Soluble en agua formando ácido carbónico. No inflamable.',
    'Producto de combustiones completas y respiración. Fundamental en fotosíntesis. Gas de efecto invernadero.'
),
(
    'Cloruro de Plata',
    'AgCl',
    'Sólido blanco, insoluble en agua. Fotosensible, se oscurece con la luz. Punto de fusión: 455°C.',
    'Precipitado formado en reacciones de iones cloruro con plata. Usado en fotografía tradicional.'
),
(
    'Oxígeno',
    'O₂',
    'Gas incoloro, inodoro. Comburente, necesario para combustión. Poco soluble en agua. Paramagnético.',
    'Elemento esencial para la respiración. Segundo elemento más abundante en atmósfera (21%).'
);

-- ============================================
-- PROGRESO DE USUARIOS - usuario_teoria
-- ============================================
-- Usuario 1 (Estudiante Demo) - Progreso moderado
ALTER TABLE usuario_teoria ADD COLUMN tiempo_lectura_real INTEGER;
ALTER TABLE usuario_teoria ADD COLUMN puntuacion INTEGER;
INSERT INTO usuario_teoria (usuario_id, teoria_id, leido, fecha, tiempo_lectura_real, puntuacion) VALUES
(1, 1, true, '2024-01-10 10:00:00', 15, 50),
(1, 2, true, '2024-01-12 14:30:00', 18, 50),
(1, 3, true, '2024-01-15 09:20:00', 22, 75),
(1, 5, true, '2024-01-18 16:45:00', 25, 100),
(1, 6, false, '2024-01-20 11:00:00', 10, 0),
(1, 11, true, '2024-01-25 15:30:00', 20, 75);


INSERT INTO usuario_teoria (usuario_id, teoria_id, leido, fecha, tiempo_lectura_real, puntuacion) VALUES
(2, 1, true, '2024-01-05 08:00:00', 10, 50),
(2, 2, true, '2024-01-05 09:00:00', 12, 50),
(2, 3, true, '2024-01-06 10:30:00', 15, 75),
(2, 4, true, '2024-01-06 14:00:00', 18, 75),
(2, 5, true, '2024-01-07 11:20:00', 20, 100),
(2, 6, true, '2024-01-08 09:45:00', 16, 100),
(2, 7, true, '2024-01-09 13:15:00', 28, 150),
(2, 8, true, '2024-01-10 10:30:00', 19, 100),
(2, 9, true, '2024-01-11 15:00:00', 25, 125),
(2, 10, true, '2024-01-12 11:45:00', 22, 125),
(2, 11, true, '2024-01-13 14:30:00', 17, 75),
(2, 12, true, '2024-01-14 09:00:00', 21, 100);

-- Usuario 4 (Ana) - Progreso inicial
INSERT INTO usuario_teoria (usuario_id, teoria_id, leido, fecha, tiempo_lectura_real, puntuacion) VALUES
(4, 1, true, '2024-02-01 10:00:00', 14, 50),
(4, 2, true, '2024-02-03 15:30:00', 16, 50),
(4, 11, true, '2024-02-05 11:20:00', 19, 75);

-- Usuario 5 (Carlos) - Apenas comenzando
INSERT INTO usuario_teoria (usuario_id, teoria_id, leido, fecha, tiempo_lectura_real, puntuacion) VALUES
(5, 1, true, '2024-02-10 09:30:00', 13, 50),
(5, 3, false, '2024-02-12 14:00:00', 8, 0);

-- ============================================
-- TEORÍA FAVORITOS
-- ============================================
INSERT INTO teoria_favoritos (usuario_id, teoria_id, fecha_agregado) VALUES
(1, 5, '2024-01-18 17:00:00'),
(1, 11, '2024-01-25 16:00:00'),
(1, 3, '2024-01-16 10:30:00'),
(2, 7, '2024-01-09 14:00:00'),
(2, 9, '2024-01-11 16:00:00'),
(2, 13, '2024-01-15 10:00:00'),
(4, 1, '2024-02-01 11:00:00'),
(4, 2, '2024-02-03 16:00:00');

-- ============================================
-- TEORÍA RECURSOS
-- ============================================
INSERT INTO teoria_recursos (teoria_id, tipo_recurso, titulo, url, descripcion, orden) VALUES

(1, 'video', 'Video: ¿Qué es la Química?', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Video introductorio de 10 minutos sobre los conceptos básicos de química', 1),
(1, 'enlace', 'Tabla Periódica Interactiva', 'https://ptable.com/', 'Tabla periódica interactiva con información detallada de cada elemento', 2),
(1, 'documento', 'Guía de Laboratorio', 'https://example.com/guia-lab-intro.pdf', 'Manual de seguridad y procedimientos básicos de laboratorio', 3),

(2, 'simulacion', 'Simulador de Cambios de Estado', 'https://phet.colorado.edu/es/simulations/states-of-matter', 'Simulación interactiva de PhET para observar cambios de estado', 1),
(2, 'video', 'Estados de la Materia Explicados', 'https://www.youtube.com/watch?v=example', 'Animación sobre las diferencias entre sólido, líquido y gas', 2),


(3, 'simulacion', 'Construye un Átomo', 'https://phet.colorado.edu/es/simulations/build-an-atom', 'Simulación para construir átomos y explorar isótopos', 1),
(3, 'video', 'Estructura Atómica', 'https://www.youtube.com/watch?v=example2', 'Video educativo sobre el modelo atómico actual', 2),
(3, 'documento', 'Historia de los Modelos Atómicos', 'https://example.com/modelos-atomicos.pdf', 'Documento sobre la evolución del concepto del átomo', 3),


(5, 'simulacion', 'Polaridad Molecular', 'https://phet.colorado.edu/es/simulations/molecule-polarity', 'Explora cómo la forma y los enlaces afectan la polaridad', 1),
(5, 'video', 'Enlaces Iónicos y Covalentes', 'https://www.youtube.com/watch?v=example3', 'Video comparativo entre tipos de enlaces', 2),


(7, 'video', 'Cálculos Estequiométricos Paso a Paso', 'https://www.youtube.com/watch?v=example4', 'Tutorial completo de resolución de problemas', 1),
(7, 'documento', 'Ejercicios Resueltos', 'https://example.com/ejercicios-estequiometria.pdf', 'Colección de 50 problemas resueltos', 2),


(11, 'simulacion', 'Escala de pH', 'https://phet.colorado.edu/es/simulations/ph-scale', 'Simulación interactiva de pH de soluciones', 1),
(11, 'video', 'Indicadores Ácido-Base', 'https://www.youtube.com/watch?v=example5', 'Experimentos con indicadores naturales', 2),
(11, 'enlace', 'Calculadora de pH', 'https://www.physiologyweb.com/calculators/ph_calculator.html', 'Herramienta para calcular pH de soluciones', 3);

-- ============================================
-- PREGUNTAS IA (Historial)
-- ============================================
INSERT INTO preguntas_ia (usuario_id, pregunta, respuesta, fecha) VALUES
(1, '¿Qué es un mol?', 'Un mol es la unidad fundamental de cantidad de sustancia en química. Representa 6.022 × 10²³ partículas (número de Avogadro), ya sean átomos, moléculas o iones. Es equivalente a la masa molecular expresada en gramos.', '2024-01-16 10:30:00'),
(1, '¿Cómo balanceo la ecuación Fe + O₂ → Fe₂O₃?', 'Para balancear esta ecuación: 4Fe + 3O₂ → 2Fe₂O₃. Primero ajusta el hierro (4 átomos a cada lado), luego el oxígeno (6 átomos a cada lado). Verifica que ambos lados tengan la misma cantidad de cada elemento.', '2024-01-19 15:45:00'),
(1, '¿Cuál es la diferencia entre calor y temperatura?', 'El calor es energía en tránsito entre sistemas por diferencia de temperatura, se mide en julios (J). La temperatura es una medida de la energía cinética promedio de las partículas, se mide en °C o K. El calor es energía transferida, la temperatura es el nivel térmico.', '2024-01-26 14:20:00'),
(4, '¿Qué es un enlace iónico?', 'Un enlace iónico se forma cuando un átomo transfiere completamente electrones a otro. Típicamente ocurre entre metales (que pierden electrones) y no metales (que ganan electrones). El resultado son iones con cargas opuestas que se atraen electrostáticamente. Ejemplo: Na⁺Cl⁻', '2024-02-04 16:30:00'),
(5, '¿Por qué el agua es un buen solvente?', 'El agua es polar debido a su geometría angular y la diferencia de electronegatividad entre H y O. Esto le permite disolver sustancias iónicas y polares mediante interacciones ión-dipolo o dipolo-dipolo. Sus puentes de hidrógeno también facilitan la disolución de muchos compuestos.', '2024-02-13 11:15:00');

