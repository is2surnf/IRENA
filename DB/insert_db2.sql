-- ============================================
-- INSERTS COMPLETOS CORREGIDOS PARA IRENATECH
-- Archivo completo con todas las teorías y datos
-- Versión: 2.0 - Corregida y completa
-- ============================================

BEGIN;

-- ============================================
-- LIMPIAR DATOS EXISTENTES
-- ============================================
TRUNCATE TABLE teoria_tarea_simulacion CASCADE;
TRUNCATE TABLE teoria_recursos CASCADE;
TRUNCATE TABLE usuario_teoria CASCADE;
TRUNCATE TABLE teoria_favoritos CASCADE;
TRUNCATE TABLE teoria RESTART IDENTITY CASCADE;

-- ============================================
-- INSERTAR TODAS LAS TEORÍAS (10 COMPLETAS)
-- ============================================

INSERT INTO teoria (titulo, contenido, categoria, tiempo_lectura, dificultad, puntos) VALUES


('Introducción a la Química: La Ciencia de la Materia', 
'# Introducción a la Química

La química es la ciencia central que conecta la física con la biología, permitiéndonos comprender desde la composición de las estrellas hasta el funcionamiento de nuestro cuerpo.

## ¿Qué es la Química?

La química estudia:
- La **composición** de la materia (¿de qué está hecho?)
- La **estructura** molecular (¿cómo se organizan los átomos?)
- Las **propiedades** de las sustancias (¿cómo se comportan?)
- Las **transformaciones** químicas (¿cómo cambian?)

## La Materia y sus Estados

La materia es todo lo que tiene masa y ocupa un espacio. Existe en diferentes estados según la energía de sus partículas:

### Estado Sólido
- **Forma definida**: Las partículas están muy juntas y ordenadas
- **Volumen definido**: Mantiene su tamaño
- **Movimiento**: Vibración en posiciones fijas
- **Ejemplos**: Hielo, sal, metales

### Estado Líquido
- **Forma variable**: Se adapta al recipiente
- **Volumen definido**: Mantiene su cantidad
- **Movimiento**: Las partículas se deslizan entre sí
- **Ejemplos**: Agua, aceite, mercurio

### Estado Gaseoso
- **Forma variable**: Ocupa todo el espacio disponible
- **Volumen variable**: Se expande o comprime
- **Movimiento**: Las partículas se mueven libremente
- **Ejemplos**: Aire, vapor de agua, gas natural

## Cambios de Estado

Los cambios de estado son procesos físicos reversibles:

**Absorben energía (endotérmicos):**
- Fusión: sólido → líquido
- Vaporización: líquido → gas
- Sublimación: sólido → gas

**Liberan energía (exotérmicos):**
- Solidificación: líquido → sólido
- Condensación: gas → líquido
- Deposición: gas → sólido

---

**Recuerda:** La química no es solo memorizar fórmulas, es comprender cómo funciona el mundo a nivel molecular.',
'Fundamentos', 20, 'Básico', 50),


('La Tabla Periódica: El Mapa de los Elementos', 
'# La Tabla Periódica de los Elementos

La tabla periódica organiza todos los elementos conocidos de manera que podemos predecir sus propiedades y comportamiento.

## Historia
- **1869**: Dmitri Mendeléyev organiza los elementos por masa atómica
- Deja espacios vacíos para elementos aún no descubiertos
- **Éxito**: Sus predicciones fueron confirmadas

## Clasificación de los Elementos

### Metales (≈80% de los elementos)
**Propiedades:**
- Buenos conductores de calor y electricidad
- Maleables y dúctiles
- Brillo metálico
- Pierden electrones (forman cationes)

### No Metales
**Propiedades:**
- Malos conductores
- Frágiles en estado sólido
- Ganan electrones (forman aniones)

### Grupos Importantes

**Grupo 1: Metales Alcalinos**
- Muy reactivos
- Ejemplos: Sodio (Na), Potasio (K)

**Grupo 17: Halógenos**
- Muy reactivos
- Ejemplos: Cloro (Cl), Flúor (F)

**Grupo 18: Gases Nobles**
- Muy estables
- Ejemplos: Helio (He), Neón (Ne)

---

**Dato curioso:** La tabla periódica tiene 118 elementos confirmados.',
'Fundamentos', 30, 'Básico', 75),


('Reacciones Químicas: Transformaciones de la Materia', 
'# Reacciones Químicas

Una reacción química transforma sustancias iniciales (reactivos) en sustancias diferentes (productos).

## Tipos de Reacciones

### 1. Síntesis
A + B → AB
Ejemplo: 2H₂ + O₂ → 2H₂O

### 2. Descomposición
AB → A + B
Ejemplo: 2H₂O → 2H₂ + O₂

### 3. Desplazamiento Simple
A + BC → AC + B
Ejemplo: Zn + 2HCl → ZnCl₂ + H₂

### 4. Doble Desplazamiento
AB + CD → AD + CB
Ejemplo: HCl + NaOH → NaCl + H₂O

### 5. Combustión
Combustible + O₂ → CO₂ + H₂O + Energía
Ejemplo: CH₄ + 2O₂ → CO₂ + 2H₂O

## Balanceo de Ecuaciones
Los átomos no se crean ni destruyen.

**Ejemplo:**
4Fe + 3O₂ → 2Fe₂O₃

---

**Recuerda:** Balancear ecuaciones es fundamental para calcular cantidades.',
'Reacciones', 35, 'Intermedio', 100),


('Ácidos y Bases: Los Opuestos que se Atraen', 
'# Ácidos y Bases

## Propiedades de los Ácidos
- Sabor agrio
- pH < 7
- Reaccionan con metales liberando H₂
- Ejemplos: HCl, H₂SO₄, vinagre

## Propiedades de las Bases
- Sabor amargo
- Tacto jabonoso
- pH > 7
- Ejemplos: NaOH, NH₃

## La Escala de pH
```
0 ─────── 7 ─────── 14
ÁCIDO  NEUTRO  BÁSICO
```

**Valores comunes:**
- Limón: 2-3
- Agua: 7
- Sangre: 7.35-7.45
- Blanqueador: 12.5

## Neutralización
Ácido + Base → Sal + Agua

Ejemplo: HCl + NaOH → NaCl + H₂O

---

**Recuerda:** El pH es logarítmico. pH 5 es 10 veces más ácido que pH 6.',
'Compuestos', 30, 'Intermedio', 100),


('Enlaces Químicos: Las Fuerzas que Unen los Átomos', 
'# Enlaces Químicos

Los enlaces mantienen unidos a los átomos para formar moléculas.

## Tipos de Enlaces

### 1. Enlace Iónico
- Transferencia de electrones
- Metal + No metal
- Ejemplo: NaCl (Na⁺ + Cl⁻)
- Propiedades: sólidos cristalinos, conductores en solución

### 2. Enlace Covalente
- Compartición de electrones
- No metal + No metal
- Ejemplo: H₂O, CO₂
- Propiedades: puntos de fusión bajos

**Tipos:**
- Simple: H-H
- Doble: O=O
- Triple: N≡N

### 3. Enlace Metálico
- Electrones deslocalizados
- Propiedades: conductores, maleables, dúctiles

## Polaridad
**Covalente no polar:** Electrones compartidos equitativamente (H₂, O₂)
**Covalente polar:** Electrones desigualmente compartidos (H₂O, HCl)

---

**Recuerda:** Los enlaces determinan las propiedades de las sustancias.',
'Fundamentos', 40, 'Avanzado', 150),


('Estequiometría: Matemáticas de la Química', 
'# Estequiometría

Cálculos cuantitativos de reactivos y productos en reacciones químicas.

## El Mol
**1 mol = 6.022 × 10²³ partículas** (Número de Avogadro)

## Masa Molar
Masa de un mol de sustancia (g/mol)

**Ejemplo H₂O:**
2(H) = 2 × 1 = 2 g/mol
1(O) = 1 × 16 = 16 g/mol
Masa molar = 18 g/mol

## Conversiones Fundamentales

### Moles ↔ Gramos
```
moles = masa (g) / masa molar (g/mol)
```

### Moles ↔ Partículas
```
partículas = moles × 6.022 × 10²³
```

## Cálculos Estequiométricos

**Pasos:**
1. Balancear ecuación
2. Convertir a moles
3. Usar relación molar
4. Convertir a unidades deseadas

**Ejemplo:**
2H₂ + O₂ → 2H₂O

¿Cuántos gramos de H₂O se forman con 8g de H₂?

1. moles H₂ = 8g / 2g/mol = 4 mol
2. Relación: 2 mol H₂ → 2 mol H₂O
3. 4 mol H₂ → 4 mol H₂O
4. masa H₂O = 4 mol × 18 g/mol = 72 g

## Reactivo Limitante
El que se consume completamente y limita la producción.

---

**Recuerda:** La estequiometría te permite calcular cantidades exactas.',
'Cálculos', 45, 'Avanzado', 150),

('Estructura Atómica: El Mundo Subatómico', 
'# Estructura Atómica

## Partículas Subatómicas

| Partícula | Carga | Masa | Ubicación |
|-----------|-------|------|-----------|
| Protón | +1 | 1 | Núcleo |
| Neutrón | 0 | 1 | Núcleo |
| Electrón | -1 | ~0 | Niveles |

## Números Atómicos
- **Número atómico (Z):** protones
- **Número de masa (A):** protones + neutrones

## Isótopos
Mismo elemento, diferente número de neutrones.

**Ejemplo Carbono:**
- C-12: 6 protones, 6 neutrones
- C-13: 6 protones, 7 neutrones
- C-14: 6 protones, 8 neutrones (radiactivo)

## Configuración Electrónica
Distribución de electrones en niveles de energía.

**Ejemplos:**
- H: 1s¹
- C: 1s² 2s² 2p²
- Na: 1s² 2s² 2p⁶ 3s¹

**Principios:**
1. Aufbau: de menor a mayor energía
2. Pauli: máximo 2 electrones por orbital
3. Hund: orbitales de igual energía se llenan uno a uno

---

**Recuerda:** La configuración electrónica determina el comportamiento químico.',
'Fundamentos', 35, 'Intermedio', 100),


('Soluciones y Concentraciones', 
'# Soluciones

Mezcla homogénea de soluto y solvente.

## Componentes
- **Soluto:** sustancia disuelta (menor cantidad)
- **Solvente:** sustancia que disuelve (mayor cantidad)

## Tipos según cantidad de soluto
- Diluida: poco soluto
- Concentrada: mucho soluto
- Saturada: máximo soluto disuelto
- Sobresaturada: más del máximo (inestable)

## Factores que afectan solubilidad

### Temperatura
- Sólidos en líquidos: ↑T → ↑solubilidad
- Gases en líquidos: ↑T → ↓solubilidad

### Naturaleza química
"Lo similar disuelve a lo similar"

## Unidades de Concentración

### Porcentaje en masa
```
% m/m = (masa soluto / masa solución) × 100
```

### Molaridad (M)
```
M = moles soluto / litros solución
```

### Diluciones
```
M₁V₁ = M₂V₂
```

---

**Recuerda:** Las soluciones están en todas partes de nuestra vida diaria.',
'Química Aplicada', 30, 'Intermedio', 100),


('Cinética Química: Velocidad de las Reacciones', 
'# Cinética Química

Estudio de la velocidad de las reacciones químicas.

## Teoría de Colisiones
Para que ocurra reacción:
1. Las moléculas deben colisionar
2. Orientación correcta
3. Energía suficiente (energía de activación)

## Factores que afectan velocidad

### 1. Concentración
↑ concentración → ↑ velocidad

### 2. Temperatura
↑ temperatura → ↑ velocidad
**Regla general:** +10°C duplica/triplica velocidad

### 3. Superficie de contacto
↑ área → ↑ velocidad

### 4. Catalizadores
Aumentan velocidad sin consumirse

**Tipos:**
- Homogéneos: misma fase
- Heterogéneos: diferente fase
- Enzimas: catalizadores biológicos

## Aplicaciones
- Industria: optimizar producción
- Alimentos: conservación
- Medicina: absorción de fármacos

---

**Recuerda:** Controlar la velocidad es tan importante como conocer los productos.',
'Reacciones', 35, 'Avanzado', 150),


('Química Orgánica: El Carbono y la Vida', 
'# Química Orgánica

Estudio de los compuestos del carbono - la química de la vida.

## El Átomo de Carbono
- Tetravalente: forma 4 enlaces
- Catenación: forma cadenas
- Enlaces múltiples: simples, dobles, triples

## Hidrocarburos

### Alcanos (enlaces simples)
Fórmula: CₙH₂ₙ₊₂
- Metano: CH₄
- Etano: C₂H₆
- Propano: C₃H₈

### Alquenos (doble enlace)
Fórmula: CₙH₂ₙ
- Eteno: C₂H₄

### Alquinos (triple enlace)
Fórmula: CₙH₂ₙ₋₂
- Etino (acetileno): C₂H₂

## Grupos Funcionales

### Alcoholes (-OH)
- Metanol: CH₃OH
- Etanol: C₂H₅OH

### Aldehídos (-CHO)
- Formaldehído: HCHO

### Cetonas (C=O)
- Acetona: CH₃-CO-CH₃

### Ácidos Carboxílicos (-COOH)
- Ácido acético: CH₃COOH

### Ésteres (-COO-)
- Formación: Ácido + Alcohol → Éster + Agua

### Aminas (-NH₂)
- Metilamina: CH₃NH₂

## Aplicaciones
- Medicina: fármacos
- Industria: plásticos, combustibles
- Agricultura: pesticidas

---

**Recuerda:** La química orgánica es la base de toda la vida.',
'Química Orgánica', 40, 'Avanzado', 150);

-- ============================================
-- TAREAS DE SIMULACIÓN VINCULADAS A TEORÍAS
-- ============================================

INSERT INTO teoria_tarea_simulacion (teoria_id, reaccion_id, descripcion_tarea, dificultad, puntos_tarea, orden) VALUES
-- Introducción a la Química (ID: 1)
(1, NULL, 'Observa los cambios de estado del agua. Congela agua, caliéntala y observa la evaporación', 'Fácil', 25, 1),
(1, NULL, 'Identifica 10 sustancias de tu casa y clasifícalas como sólidos, líquidos o gases', 'Fácil', 20, 2),

-- Tabla Periódica (ID: 2)
(2, NULL, 'Ubica en la tabla periódica: Na, Fe, O, Cl, Au. Indica grupo y período de cada uno', 'Fácil', 30, 1),
(2, NULL, 'Identifica 5 metales y 5 no metales en la tabla periódica y describe sus propiedades', 'Intermedio', 40, 2),
(2, NULL, 'Predice qué elementos son más reactivos basándote en su posición en la tabla', 'Intermedio', 45, 3),

-- Reacciones Químicas (ID: 3)
(3, NULL, 'Simula la combustión del carbono con oxígeno y observa la formación de CO₂', 'Intermedio', 50, 1),
(3, NULL, 'Realiza una neutralización entre HCl y NaOH. Mide el pH antes y después', 'Intermedio', 50, 2),
(3, NULL, 'Simula la síntesis de agua a partir de H₂ y O₂. Balancea la ecuación', 'Difícil', 60, 3),
(3, NULL, 'Reacciona zinc metálico con HCl diluido y observa la liberación de hidrógeno', 'Intermedio', 45, 4),

-- Ácidos y Bases (ID: 4)
(4, NULL, 'Experimenta con diferentes ácidos y bases. Usa indicadores para determinar el pH', 'Intermedio', 40, 1),
(4, NULL, 'Prepara una solución buffer y prueba su resistencia al cambio de pH', 'Avanzado', 70, 2),
(4, NULL, 'Neutraliza completamente 50 mL de HCl 0.1M. Calcula la cantidad de NaOH necesaria', 'Intermedio', 50, 3),

-- Enlaces Químicos (ID: 5)
(5, NULL, 'Construye modelos moleculares de H₂O, CO₂, NH₃ y CH₄. Identifica el tipo de enlace', 'Intermedio', 45, 1),
(5, NULL, 'Predice la polaridad de 10 moléculas diferentes basándote en su geometría', 'Avanzado', 60, 2),
(5, NULL, 'Compara las propiedades de compuestos iónicos (NaCl) y covalentes (H₂O)', 'Intermedio', 40, 3),

-- Estequiometría (ID: 6)
(6, NULL, 'Calcula cuántos gramos de H₂O se forman al reaccionar 4 g de H₂ con exceso de O₂', 'Avanzado', 65, 1),
(6, NULL, 'Determina el reactivo limitante: 10 g C con 20 g O₂ para formar CO₂', 'Avanzado', 70, 2),
(6, NULL, 'Prepara 250 mL de NaCl 0.5M. Calcula la cantidad de sal necesaria', 'Intermedio', 50, 3),
(6, NULL, 'Realiza una dilución: prepara 100 mL de HCl 0.1M desde HCl 1M', 'Intermedio', 45, 4),

-- Estructura Atómica (ID: 7)
(7, NULL, 'Escribe la configuración electrónica de los primeros 20 elementos', 'Intermedio', 40, 1),
(7, NULL, 'Identifica isótopos del carbono y calcula neutrones en cada uno', 'Intermedio', 35, 2),
(7, NULL, 'Dibuja modelos atómicos de H, He, Li mostrando protones, neutrones y electrones', 'Fácil', 30, 3),

-- Soluciones (ID: 8)
(8, NULL, 'Prepara soluciones de diferentes concentraciones: 1M, 0.5M, 0.1M de NaCl', 'Intermedio', 45, 1),
(8, NULL, 'Calcula la molaridad de una solución con 10g de NaOH en 500 mL de solución', 'Intermedio', 40, 2),
(8, NULL, 'Observa el efecto de la temperatura en la solubilidad del azúcar en agua', 'Fácil', 30, 3),

-- Cinética Química (ID: 9)
(9, NULL, 'Estudia cómo la temperatura afecta la velocidad de disolución del azúcar', 'Intermedio', 45, 1),
(9, NULL, 'Compara la velocidad de reacción entre ácido concentrado y diluido con metal', 'Avanzado', 60, 2),
(9, NULL, 'Investiga el efecto de un catalizador en una reacción química', 'Avanzado', 65, 3),

-- Química Orgánica (ID: 10)
(10, NULL, 'Identifica los grupos funcionales en: etanol, acetona, ácido acético, éster', 'Intermedio', 50, 1),
(10, NULL, 'Dibuja isómeros estructurales de C₅H₁₂ (pentano)', 'Avanzado', 60, 2),
(10, NULL, 'Clasifica 10 compuestos orgánicos según su grupo funcional', 'Intermedio', 45, 3);

-- ============================================
-- RECURSOS ADICIONALES PARA TEORÍAS
-- ============================================

INSERT INTO teoria_recursos (teoria_id, tipo_recurso, titulo, url, descripcion, orden) VALUES
-- Introducción a la Química (ID: 1)
(1, 'video', 'Estados de la Materia - Animación', 'https://youtube.com/watch?v=ejemplo', 'Visualización de cambios de estado a nivel molecular', 1),
(1, 'imagen', 'Diagrama de Estados de la Materia', '/images/teoria/estados_materia.png', 'Infografía sobre sólido, líquido y gas', 2),
(1, 'enlace', 'Experimentos Caseros de Química', 'https://quimica-experimentos.com', 'Experimentos seguros para hacer en casa', 3),

-- Tabla Periódica (ID: 2)
(2, 'enlace', 'Tabla Periódica Interactiva', 'https://ptable.com', 'Explorar elementos con información detallada', 1),
(2, 'video', 'Historia de la Tabla Periódica', 'https://youtube.com/watch?v=ejemplo2', 'Cómo se desarrolló la tabla periódica', 2),
(2, 'simulacion', 'Construye Átomos', '/simulacion/build-atom', 'Simula la construcción de diferentes átomos', 3),
(2, 'imagen', 'Tendencias Periódicas', '/images/teoria/tendencias_periodicas.png', 'Gráfico de electronegatividad y radio atómico', 4),

-- Reacciones Químicas (ID: 3)
(3, 'video', 'Tipos de Reacciones Químicas', 'https://youtube.com/watch?v=ejemplo3', 'Demostraciones de cada tipo de reacción', 1),
(3, 'simulacion', 'Balanceo de Ecuaciones', '/simulacion/balance-equations', 'Practica balanceo de ecuaciones químicas', 2),
(3, 'documento', 'Guía de Reacciones Comunes', '/docs/reacciones_comunes.pdf', 'Lista de reacciones importantes', 3),
(3, 'imagen', 'Diagrama de Energía', '/images/teoria/diagrama_energia.png', 'Reacciones exo y endotérmicas', 4),

-- Ácidos y Bases (ID: 4)
(4, 'simulacion', 'pH Meter Virtual', '/simulacion/ph-meter', 'Simula medición de pH de diferentes sustancias', 1),
(4, 'video', 'Neutralización Ácido-Base', 'https://youtube.com/watch?v=ejemplo4', 'Demostración de titulación', 2),
(4, 'imagen', 'Escala de pH', '/images/teoria/escala_ph.png', 'Escala de pH con ejemplos cotidianos', 3),
(4, 'enlace', 'Indicadores Naturales', 'https://quimica-indicadores.com', 'Cómo hacer indicadores caseros', 4),

-- Enlaces Químicos (ID: 5)
(5, 'simulacion', 'Moléculas 3D', '/simulacion/molecules-3d', 'Visualiza estructuras moleculares en 3D', 1),
(5, 'video', 'Enlaces Químicos Explicados', 'https://youtube.com/watch?v=ejemplo5', 'Diferencias entre iónico, covalente y metálico', 2),
(5, 'imagen', 'Tipos de Enlaces', '/images/teoria/tipos_enlaces.png', 'Comparación visual de enlaces', 3),
(5, 'documento', 'Tabla de Electronegatividad', '/docs/electronegatividad.pdf', 'Valores de electronegatividad de elementos', 4),

-- Estequiometría (ID: 6)
(6, 'video', 'Conversiones Mol-Gramo', 'https://youtube.com/watch?v=ejemplo6', 'Paso a paso de conversiones', 1),
(6, 'simulacion', 'Calculadora Estequiométrica', '/simulacion/stoich-calc', 'Calcula cantidades en reacciones', 2),
(6, 'documento', 'Ejercicios Resueltos', '/docs/ejercicios_estequiometria.pdf', '20 problemas con soluciones detalladas', 3),
(6, 'imagen', 'Mapa de Conversiones', '/images/teoria/mapa_conversiones.png', 'Diagrama de todas las conversiones posibles', 4),

-- Estructura Atómica (ID: 7)
(7, 'simulacion', 'Orbitales Atómicos', '/simulacion/atomic-orbitals', 'Visualiza formas de orbitales s, p, d, f', 1),
(7, 'video', 'Configuración Electrónica', 'https://youtube.com/watch?v=ejemplo7', 'Cómo escribir configuraciones', 2),
(7, 'imagen', 'Modelos Atómicos', '/images/teoria/modelos_atomicos.png', 'Evolución de los modelos atómicos', 3),
(7, 'enlace', 'Espectros Atómicos', 'https://spectral-lines.com', 'Líneas espectrales de elementos', 4),

-- Soluciones (ID: 8)
(8, 'simulacion', 'Prepara Soluciones', '/simulacion/solutions', 'Simula preparación de soluciones molares', 1),
(8, 'video', 'Diluciones Paso a Paso', 'https://youtube.com/watch?v=ejemplo8', 'Técnica correcta para diluir soluciones', 2),
(8, 'imagen', 'Tipos de Concentración', '/images/teoria/concentraciones.png', 'Comparación de unidades de concentración', 3),
(8, 'documento', 'Tabla de Solubilidad', '/docs/solubilidad.pdf', 'Solubilidad de compuestos comunes', 4),

-- Cinética Química (ID: 9)
(9, 'video', 'Teoría de Colisiones', 'https://youtube.com/watch?v=ejemplo9', 'Animación de colisiones moleculares', 1),
(9, 'simulacion', 'Factores de Velocidad', '/simulacion/reaction-rates', 'Experimenta con temperatura y concentración', 2),
(9, 'imagen', 'Energía de Activación', '/images/teoria/energia_activacion.png', 'Diagramas de energía con y sin catalizador', 3),
(9, 'enlace', 'Catalizadores Industriales', 'https://catalysis-industry.com', 'Aplicaciones de catalizadores', 4),

-- Química Orgánica (ID: 10)
(10, 'simulacion', 'Construye Moléculas Orgánicas', '/simulacion/organic-builder', 'Crea diferentes compuestos orgánicos', 1),
(10, 'video', 'Grupos Funcionales', 'https://youtube.com/watch?v=ejemplo10', 'Identificación de grupos funcionales', 2),
(10, 'imagen', 'Tabla de Grupos Funcionales', '/images/teoria/grupos_funcionales.png', 'Referencia rápida de grupos funcionales', 3),
(10, 'documento', 'Nomenclatura IUPAC', '/docs/nomenclatura_organica.pdf', 'Guía completa de nomenclatura', 4),
(10, 'enlace', 'Base de Datos de Moléculas', 'https://pubchem.ncbi.nlm.nih.gov', 'Busca información de compuestos orgánicos', 5);

-- ============================================
-- DATOS DE PRUEBA OPCIONALES
-- ============================================

-- Insertar usuarios de prueba
INSERT INTO usuario (nombre, correo, tipo_usuario) VALUES
('Usuario Demo', 'demo@irenatech.com', 'registrado'),
('Estudiante Test', 'estudiante@test.com', 'registrado'),
('Usuario Anónimo', NULL, 'anonimo');

-- Marcar algunas teorías como leídas para el usuario demo
INSERT INTO usuario_teoria (usuario_id, teoria_id, leido, tiempo_lectura_real, puntuacion) VALUES
(1, 1, true, 18, 5),
(1, 2, true, 28, 4),
(1, 3, false, NULL, NULL);

-- Agregar algunas teorías a favoritos
INSERT INTO teoria_favoritos (usuario_id, teoria_id) VALUES
(1, 5),
(1, 6),
(2, 1);

-- ============================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ============================================

-- Contar teorías por categoría
SELECT 
    categoria, 
    COUNT(*) as cantidad_teorias,
    AVG(tiempo_lectura) as tiempo_promedio
FROM teoria 
GROUP BY categoria 
ORDER BY categoria;

-- Contar teorías por dificultad
SELECT 
    dificultad, 
    COUNT(*) as cantidad,
    SUM(puntos) as puntos_totales
FROM teoria 
GROUP BY dificultad 
ORDER BY 
    CASE dificultad 
        WHEN 'Básico' THEN 1 
        WHEN 'Intermedio' THEN 2 
        WHEN 'Avanzado' THEN 3 
    END;

-- Mostrar resumen de tareas
SELECT 
    t.titulo as teoria,
    COUNT(tts.id_teoria_tarea_simulacion) as num_tareas,
    SUM(tts.puntos_tarea) as puntos_tareas
FROM teoria t
LEFT JOIN teoria_tarea_simulacion tts ON t.id_teoria = tts.teoria_id
GROUP BY t.id_teoria, t.titulo
ORDER BY t.id_teoria;

-- Mostrar resumen de recursos
SELECT 
    t.titulo as teoria,
    COUNT(tr.id_recurso) as num_recursos,
    STRING_AGG(DISTINCT tr.tipo_recurso, ', ') as tipos_recursos
FROM teoria t
LEFT JOIN teoria_recursos tr ON t.id_teoria = tr.teoria_id
GROUP BY t.id_teoria, t.titulo
ORDER BY t.id_teoria;

-- Estadísticas generales
SELECT 
    'Total teorías' as metrica,
    COUNT(*)::text as valor
FROM teoria
UNION ALL
SELECT 
    'Total tareas',
    COUNT(*)::text
FROM teoria_tarea_simulacion
UNION ALL
SELECT 
    'Total recursos',
    COUNT(*)::text
FROM teoria_recursos
UNION ALL
SELECT 
    'Puntos totales disponibles',
    SUM(puntos + COALESCE((
        SELECT SUM(puntos_tarea) 
        FROM teoria_tarea_simulacion 
        WHERE teoria_id = teoria.id_teoria
    ), 0))::text
FROM teoria;

-- ============================================
-- COMMIT FINAL
-- ============================================
COMMIT;

-- Mensaje de éxito
DO $
BEGIN
    RAISE NOTICE '✅ Contenidos de teoría insertados exitosamente';
    RAISE NOTICE '📚 Total de teorías: 10';
    RAISE NOTICE '🎯 Categorías: Fundamentos (4), Reacciones (2), Compuestos (1), Cálculos (1), Química Aplicada (1), Química Orgánica (1)';
    RAISE NOTICE '📊 Dificultades: Básico (2), Intermedio (5), Avanzado (3)';
    RAISE NOTICE '✏️ Total de tareas: 33';
    RAISE NOTICE '🔎 Total de recursos: 44';
    RAISE NOTICE '👥 3 usuarios de prueba creados';
    RAISE NOTICE '🎓 Sistema de teoría completo y listo para usar';
END $;