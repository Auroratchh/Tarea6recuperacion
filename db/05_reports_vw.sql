--REPORTS_VW.SQL - 5 Views

-- Nombre: Brittany Aurora Hernández Muñoz
-- Matricula: 243707
-- Grupo: C

-- VIEW 1: Ventas por categoría

-- Qué devuelve: totales de ventas por categoría 
-- Grain (qué representa una fila): categoría
-- Métricas: los productos vendidos e ingresos totales
-- Por qué usa GROUP BY/HAVING: Para agrupar ventas por categoría y filtrar las categorías por ventas
-- 1–2 queries VERIFY para validar resultados;
-- SELECT SUM(ingresos_totales) FROM ventas_categoria;
-- SELECT COUNT(*) FROM ventas_categoria;


CREATE OR REPLACE VIEW ventas_categoria AS
SELECT 
    c.id,
    c.nombre AS categoria,
    COUNT(od.id) AS total_productos_vendidos,
    SUM(od.subtotal) AS ingresos_totales,
    ROUND(AVG(od.precio_unitario), 2) AS precio_promedio
FROM categorias c
JOIN productos p ON c.id = p.categoria_id
JOIN orden_detalles od ON p.id = od.producto_id
GROUP BY c.id, c.nombre
HAVING COUNT(od.id) > 0
ORDER BY ingresos_totales DESC;

-- VIEW 2: Productos más vendidos

-- Qué devuelve: Los productos más vendidos con ranking
-- Grain (qué representa una fila): productos
-- Métricas: cantidad vendida, ingresos y ranking
-- Por qué usa GROUP BY/HAVING: para sumar las ventas por productos y over es para generar el ranking sin perder filas
-- 1–2 queries VERIFY para validar resultados:
-- SELECT * FROM productos_ran WHERE ranking = 1;
-- SELECT COUNT(*) FROM productos_ran;


CREATE OR REPLACE VIEW productos_ran AS
SELECT 
    p.id,
    p.nombre,
    c.nombre AS categoria,
    SUM(od.cantidad) AS cantidad_vendida,
    SUM(od.subtotal) AS ingresos,
    ROW_NUMBER() OVER (ORDER BY SUM(od.cantidad) DESC) AS ranking
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
JOIN orden_detalles od ON p.id = od.producto_id
GROUP BY p.id, p.nombre, c.nombre
ORDER BY cantidad_vendida DESC
LIMIT 10;


-- VIEW 3: 

-- Qué devuelve: compras por cliente
-- Grain (qué representa una fila): cliente
-- Métricas: órdenes totales, dinero gastado, promedio
-- Por qué usa GROUP BY/HAVING: Para calcular totales por cliente
-- 1–2 queries VERIFY para validar resultados:
-- SELECT SUM(total_gastado) FROM recopilacion_clientes;
-- SELECT * FROM recopilacion_clientes WHERE total_ordenes > 1;


CREATE OR REPLACE VIEW recopilacion_clientes AS
WITH promedio_global AS (
    SELECT AVG(total) AS ticket_promedio
    FROM ordenes
)
SELECT 
    u.id,
    u.nombre,
    u.email,
    COUNT(o.id) AS total_ordenes,
    SUM(o.total) AS total_gastado,
    ROUND(AVG(o.total), 2) AS ticket_promedio,
    CASE 
        WHEN AVG(o.total) > (SELECT ticket_promedio FROM promedio_global) THEN 'ALTO'
        WHEN COUNT(o.id) >= 2 THEN 'FRECUENTE'
        ELSE 'NUEVO'
    END AS tipo_cliente 
FROM usuarios u
JOIN ordenes o ON u.id = o.usuario_id
GROUP BY u.id, u.nombre, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_gastado DESC;


-- VIEW 4: Inventario bajo de productos

-- Qué devuelve: productos con poco inventario
-- Grain (qué representa una fila): producto
-- Métricas: stock actual y piezas vendidas
-- Por qué usa GROUP BY/HAVING: Para contar ventas por producto
-- 1–2 queries VERIFY para validar resultados:
-- SELECT COUNT(*) FROM inventario_bajo;
-- SELECT * FROM inventario_bajo WHERE stock < 10;


CREATE OR REPLACE VIEW inventario_bajo AS
SELECT 
    p.id,
    p.codigo,
    p.nombre,
    p.stock,
    COALESCE(SUM(od.cantidad), 0) AS total_vendido,
    CASE 
        WHEN p.stock = 0 THEN 'AGOTADO'
        WHEN p.stock < 50 THEN 'BAJO'
        ELSE 'NORMAL'
    END AS estado
FROM productos p
LEFT JOIN orden_detalles od ON p.id = od.producto_id
GROUP BY p.id, p.codigo, p.nombre, p.stock
HAVING p.stock < 100
ORDER BY p.stock ASC;


-- VIEW 5: Rango de precio en productos

-- Qué devuelve: Productos agrupados por rango de precio
-- Grain (qué representa una fila): producto
-- Métricas: precio y la cantidad de productos vendidos
-- Por qué usa GROUP BY/HAVING: Para contar cuántas veces se vendió cada producto
-- 1–2 queries VERIFY para validar resultados: 
-- SELECT COUNT(*) FROM productos_precio;
-- SELECT * FROM productos_precio WHERE rango_precio = 'CARO';


CREATE OR REPLACE VIEW productos_precio AS
SELECT 
    p.id,
    p.nombre,
    c.nombre AS categoria,
    p.precio,
    p.stock,
    COALESCE(COUNT(od.id), 0) AS veces_vendido,
    CASE 
        WHEN p.precio >= 100 THEN 'CARO'
        WHEN p.precio >= 50 THEN 'MEDIO'
        ELSE 'ECONOMICO'
    END AS rango_precio
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN orden_detalles od ON p.id = od.producto_id
GROUP BY p.id, p.nombre, p.precio, p.stock, c.nombre
ORDER BY p.precio DESC;
