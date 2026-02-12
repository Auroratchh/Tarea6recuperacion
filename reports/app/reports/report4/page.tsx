import { pool } from '@/lib/db';
import KPICard from '@/app/report';
import Link from 'next/link';

const ITEMS_PER_PAGE = 10;

export default async function Report4({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = parseInt(searchParams.page || '1');
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const countResult = await pool.query('SELECT COUNT(*) FROM inventario_bajo');
  const totalItems = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const result = await pool.query(
    'SELECT * FROM inventario_bajo ORDER BY stock ASC OFFSET $1 LIMIT $2',
    [offset, ITEMS_PER_PAGE]
  );
  const data = result.rows;

  const agotados = data.filter(row => row.estado === 'AGOTADO').length;
  const bajos = data.filter(row => row.estado === 'BAJO').length;
  const normales = data.filter(row => row.estado === 'NORMAL').length;

  return (
    <div className="container">
      <div className="header">
        <Link href="/" style={{ textDecoration: 'none', color: '#000' }}>← Volver</Link>
        <h1>Reporte 4: Inventario Bajo</h1>
        <p>Productos con stock limitado que requieren reposición</p>
      </div>

      <div className="kpi-grid">
        <KPICard 
          title="Agotados" 
          value={agotados}
          subtitle="Stock = 0"
        />
        <KPICard 
          title="Stock Bajo" 
          value={bajos}
          subtitle="Stock < 50"
        />
        <KPICard 
          title="Normales" 
          value={normales}
          subtitle="Stock 50-99"
        />
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Productos con Inventario Limitado</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th className="text-right">Stock Actual</th>
              <th className="text-right">Total Vendido</th>
              <th className="text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td>{row.codigo}</td>
                <td>{row.nombre}</td>
                <td className="text-right" style={{ 
                  color: row.stock === 0 ? '#ef4444' : row.stock < 30 ? '#f97316' : '#666',
                  fontWeight: row.stock === 0 ? 'bold' : 'normal'
                }}>
                  {row.stock}
                </td>
                <td className="text-right">{row.total_vendido}</td>
                <td className="text-center">
                  <span className="badge" style={{
                    background: row.estado === 'AGOTADO' ? '#ef4444' : 
                               row.estado === 'BAJO' ? '#f97316' : '#22c55e',
                    color: '#fff'
                  }}>
                    {row.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <Link 
          href={`/reports/report4?page=${currentPage - 1}`} 
          className={`nav-link ${currentPage <= 1 ? 'disabled' : ''}`}
        >
          ← Anterior
        </Link>
        <span className="page-number">
          Página {currentPage} de {totalPages}
        </span>
        <Link 
          href={`/reports/report4?page=${currentPage + 1}`} 
          className={`nav-link ${currentPage >= totalPages ? 'disabled' : ''}`}
        >
          Siguiente →
        </Link>
      </div>
    </div>
  );
}