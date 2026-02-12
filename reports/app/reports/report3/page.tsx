import { pool } from '@/lib/db';
import KPICard from '@/app/report';
import Link from 'next/link';
import { z } from 'zod';

const FilterSchema = z.object({
  tipoCliente: z.enum(['ALTO', 'FRECUENTE', 'NUEVO', '']).optional(),
});

export default async function Report3({ searchParams }: { searchParams: { tipoCliente?: string } }) {
  const validatedParams = FilterSchema.parse({
    tipoCliente: searchParams.tipoCliente || '',
  });

  const query = validatedParams.tipoCliente && validatedParams.tipoCliente !== ''
    ? 'SELECT * FROM recopilacion_clientes WHERE tipo_cliente = $1 ORDER BY total_gastado DESC'
    : 'SELECT * FROM recopilacion_clientes ORDER BY total_gastado DESC';

  const values = validatedParams.tipoCliente && validatedParams.tipoCliente !== '' 
    ? [validatedParams.tipoCliente] 
    : [];
  const result = await pool.query(query, values);
  const data = result.rows;

  const totalClientes = data.length;
  const totalGastado = data.reduce((sum, row) => sum + parseFloat(row.total_gastado), 0);
  const promedioGasto = totalClientes > 0 ? totalGastado / totalClientes : 0;

  return (
    <div className="container">
      <div className="header">
        <Link href="/" style={{ textDecoration: 'none', color: '#000' }}>← Volver</Link>
        <h1>Reporte 3: Resumen de Clientes</h1>
        <p>Análisis de comportamiento de compra y segmentación</p>
      </div>

      <div className="kpi-grid">
        <KPICard 
          title="Total Clientes" 
          value={totalClientes}
          subtitle={validatedParams.tipoCliente ? `Tipo: ${validatedParams.tipoCliente}` : 'Todos los tipos'}
        />
        <KPICard 
          title="Gasto Total" 
          value={`$${totalGastado.toFixed(2)}`}
          subtitle="Suma acumulada"
        />
        <KPICard 
          title="Ticket Promedio" 
          value={`$${promedioGasto.toFixed(2)}`}
          subtitle="Gasto promedio por cliente"
        />
      </div>

      <div className="filter-container">
        <form method="GET" style={{ display: 'flex', gap: '10px' }}>
          <select name="tipoCliente" className="search-input" defaultValue={searchParams.tipoCliente || ''}>
            <option value="">Todos los tipos</option>
            <option value="ALTO">Alto Valor</option>
            <option value="FRECUENTE">Frecuente</option>
            <option value="NUEVO">Nuevo</option>
          </select>
          <button type="submit" className="btn-primary">Filtrar</button>
          <Link href="/reports/report3" className="btn-primary">Limpiar</Link>
        </form>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Desglose por Cliente</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Email</th>
              <th className="text-right">Órdenes</th>
              <th className="text-right">Total Gastado</th>
              <th className="text-right">Ticket Promedio</th>
              <th className="text-center">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td>{row.nombre}</td>
                <td>{row.email}</td>
                <td className="text-right">{row.total_ordenes}</td>
                <td className="text-right">${parseFloat(row.total_gastado).toFixed(2)}</td>
                <td className="text-right">${parseFloat(row.ticket_promedio).toFixed(2)}</td>
                <td className="text-center">
                  <span className="badge" style={{
                    background: row.tipo_cliente === 'ALTO' ? '#4ade80' : 
                               row.tipo_cliente === 'FRECUENTE' ? '#60a5fa' : '#fbbf24',
                    color: '#fff'
                  }}>
                    {row.tipo_cliente}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}