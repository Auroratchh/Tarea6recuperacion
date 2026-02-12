-- ROLES.SQL

-- Nombre: Brittany Aurora Hernández Muñoz
-- Matricula: 243707
-- Grupo: C

DROP ROLE IF EXISTS user_nuevo;

CREATE ROLE user_nuevo WITH
    LOGIN
    PASSWORD 'password_123';

GRANT CONNECT ON DATABASE postgres TO user_nuevo;

GRANT USAGE ON SCHEMA public TO user_nuevo;

GRANT SELECT ON ventas_categoria TO user_nuevo;
GRANT SELECT ON productos_ran TO user_nuevo;
GRANT SELECT ON recopilacion_clientes TO user_nuevo;
GRANT SELECT ON productos_precio TO user_nuevo;
GRANT SELECT ON inventario_bajo TO user_nuevo;

