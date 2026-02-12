import { pool } from '@/lib/db';
import KPICard from '@/app/report';
import Link from 'next/link';

const ITEMS_PER_PAGE = 5;

export default async function Report2({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = parseInt(searchParams.page || '1');
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const countResult = await pool.query('SELECT COUNT(*) FROM productos_ran');
  const totalItems = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const result = await pool.query(
    'SELECT * FROM productos_ran OFFSET $1 LIMIT $2',
    [offset, ITEMS_PER_PAGE]
  );
  const data = result.rows;

  const totalVendido = data.reduce((sum, row) => sum + parseInt(row.cantidad_vendida), 0);
  const totalIngresos = data.reduce((sum, row) => sum + parseFloat(row.ingresos), 0);

  return (
    <div className="container">
      <div className="header">
        <Link href="/" style={{ textDecoration: 'none', color: '#000' }}>← Volver</Link>
        <h1>Reporte 2: Productos Más Vendidos</h1>
        <p>Top productos por cantidad vendida con ranking</p>
      </div>

      <div className="kpi-grid">
        <KPICard 
          title="Total Vendido (Página)" 
          value={totalVendido}
          subtitle={`${ITEMS_PER_PAGE} productos`}
        />
        <KPICard 
          title="Ingresos (Página)" 
          value={`$${totalIngresos.toFixed(2)}`}
          subtitle="Suma de la página actual"
        />
        <KPICard 
          title="Productos Totales" 
          value={totalItems}
          subtitle={`${totalPages} páginas`}
        />
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Ranking de Productos</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th className="text-center">Ranking</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th className="text-right">Cantidad Vendida</th>
              <th className="text-right">Ingresos</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td className="text-center">
                  <span className={`ranking-badge ${row.ranking <= 3 ? 'badge' : ''}`} 
                        style={{ 
                          background: row.ranking === 1 ? '#FFD700' : 
                                     row.ranking === 2 ? '#C0C0C0' : 
                                     row.ranking === 3 ? '#CD7F32' : '#f3f4f6',
                          color: row.ranking <= 3 ? '#000' : '#666'
                        }}>
                    #{row.ranking}
                  </span>
                </td>
                <td>{row.nombre}</td>
                <td>{row.categoria}</td>
                <td className="text-right">{row.cantidad_vendida}</td>
                <td className="text-right">${parseFloat(row.ingresos).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <Link 
          href={`/reports/report2?page=${currentPage - 1}`} 
          className={`nav-link ${currentPage <= 1 ? 'disabled' : ''}`}
        >
          ← Anterior
        </Link>
        <span className="page-number">
          Página {currentPage} de {totalPages}
        </span>
        <Link 
          href={`/reports/report2?page=${currentPage + 1}`} 
          className={`nav-link ${currentPage >= totalPages ? 'disabled' : ''}`}
        >
          Siguiente →
        </Link>
      </div>
    </div>
  );
}