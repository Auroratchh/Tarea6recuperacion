import { pool } from '@/lib/db';
import KPICard from '@/app/report';
import Link from 'next/link';
import { z } from 'zod';

const FilterSchema = z.object({
  minIngresos: z.coerce.number().min(0).optional(),
});

export default async function Report1({ searchParams }: { searchParams: { minIngresos?: string } }) {
  const validatedParams = FilterSchema.parse({
    minIngresos: searchParams.minIngresos,
  });

  const query = validatedParams.minIngresos
    ? 'SELECT * FROM ventas_categoria WHERE ingresos_totales >= $1 ORDER BY ingresos_totales DESC'
    : 'SELECT * FROM ventas_categoria ORDER BY ingresos_totales DESC';

  const values = validatedParams.minIngresos ? [validatedParams.minIngresos] : [];
  const result = await pool.query(query, values);
  const data = result.rows;

  const totalIngresos = data.reduce((sum, row) => sum + parseFloat(row.ingresos_totales), 0);
  const totalProductos = data.reduce((sum, row) => sum + parseInt(row.total_productos_vendidos), 0);
  const promedioCategoria = data.length > 0 ? totalIngresos / data.length : 0;

  return (
    <div className="container">
      <div className="header">
        <Link href="/" style={{ textDecoration: 'none', color: '#000' }}>← Volver</Link>
        <h1>Reporte 1: Ventas por Categoría</h1>
        <p>Análisis de ingresos y productos vendidos por categoría</p>
      </div>

      <div className="kpi-grid">
        <KPICard 
          title="Ingresos Totales" 
          value={`$${totalIngresos.toFixed(2)}`}
          subtitle="Suma de todas las categorías"
        />
        <KPICard 
          title="Productos Vendidos" 
          value={totalProductos}
          subtitle="Total de unidades"
        />
        <KPICard 
          title="Promedio por Categoría" 
          value={`$${promedioCategoria.toFixed(2)}`}
          subtitle="Ingreso promedio"
        />
      </div>

      <div className="filter-container">
        <form method="GET" style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="number" 
            name="minIngresos" 
            placeholder="Ingresos mínimos"
            className="search-input"
            defaultValue={searchParams.minIngresos || ''}
            step="0.01"
            min="0"
          />
          <button type="submit" className="btn-primary">Filtrar</button>
          <Link href="/reports/report1" className="btn-primary">Limpiar</Link>
        </form>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Desglose por Categoría</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Categoría</th>
              <th className="text-right">Productos Vendidos</th>
              <th className="text-right">Ingresos Totales</th>
              <th className="text-right">Precio Promedio</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td>{row.categoria}</td>
                <td className="text-right">{row.total_productos_vendidos}</td>
                <td className="text-right">${parseFloat(row.ingresos_totales).toFixed(2)}</td>
                <td className="text-right">${parseFloat(row.precio_promedio).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}