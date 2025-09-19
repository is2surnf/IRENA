-- Active: 1750015819059@@127.0.0.1@5000@irenatech
-- Eliminar tablas intermedias primero
DROP TABLE IF EXISTS usuario_teoria CASCADE;
DROP TABLE IF EXISTS reaccion_elemento CASCADE;
DROP TABLE IF EXISTS simulacion_elemento CASCADE;

-- Eliminar tablas principales dependientes
DROP TABLE IF EXISTS compuesto_sintetizado CASCADE;
DROP TABLE IF EXISTS utensilio CASCADE;
DROP TABLE IF EXISTS preguntas_ia CASCADE;
DROP TABLE IF EXISTS teoria CASCADE;
DROP TABLE IF EXISTS simulacion CASCADE;
DROP TABLE IF EXISTS reaccion CASCADE;
DROP TABLE IF EXISTS elemento CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;
