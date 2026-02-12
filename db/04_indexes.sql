-- INDEXES.SQL

-- Nombre: Brittany Aurora Hernández Muñoz
-- Matricula: 243707
-- Grupo: C

--1
-- Acelera los JOIN entre orden_detalles y ordenes
-- Usado en: ventas_categoria, recopilacion_clientes
-- Optimiza queries que filtran por orden_id
CREATE INDEX idx_orden_detalles_orden_id 
ON orden_detalles(orden_id);

COMMENT ON INDEX idx_orden_detalles_orden_id IS 
'Optimiza joins con tabla ordenes, se usa en: ventas_categoria, recopilacion_clientes';

-- CON EXPLAIN:
EXPLAIN ANALYZE
SELECT o.id, o.usuario_id, od.producto_id, od.cantidad
FROM ordenes o
JOIN orden_detalles od ON o.id = od.orden_id
WHERE o.id = 1;
-- Resultado esperado: Index Scan usando idx_orden_detalles_orden_id

--2
-- Acelera los JOIN entre orden_detalles y productos
-- Usado en: productos_ran, inventario_bajo, productos_precio
-- Optimiza queries que agrupan por producto_id
CREATE INDEX idx_orden_detalles_producto_id 
ON orden_detalles(producto_id);

COMMENT ON INDEX idx_orden_detalles_producto_id IS 
'Optimiza joins con tabla productos, se usa en: productos_ran, inventario_bajo, productos_precio';

-- VERIFICACIÓN CON EXPLAIN:
EXPLAIN ANALYZE
SELECT p.id, p.nombre, SUM(od.cantidad) AS total_vendido
FROM productos p
LEFT JOIN orden_detalles od ON p.id = od.producto_id
GROUP BY p.id, p.nombre
ORDER BY total_vendido DESC;
-- Resultado esperado: Index Scan usando idx_orden_detalles_producto_id

--3
-- Acelera la búsqueda de productos por categoría
-- Usado en: ventas_categoria, productos_ran, productos_precio

CREATE INDEX idx_productos_categoria_id ON productos(categoria_id);

COMMENT ON INDEX idx_productos_categoria_id IS 
'Optimiza joins con tabla categorias y filtros por categoría id';

-- VERIFICACIÓN CON EXPLAIN:
EXPLAIN ANALYZE
SELECT p.nombre, c.nombre 
FROM productos p 
JOIN categorias c ON p.categoria_id = c.id 
WHERE c.id = 1;

--4
-- Acelera el ordenamiento por ingresos en el reporte de categorías

CREATE INDEX idx_orden_detalles_subtotal_desc ON orden_detalles(subtotal DESC);

COMMENT ON INDEX idx_orden_detalles_subtotal_desc IS 
'Optimiza la paginación y ordenamiento por montos de dinero';