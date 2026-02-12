import Link from 'next/link';

const reports = [
  { 
    id: 1, 
    title: 'Ventas por Categoría', 
    description: 'Análisis de ingresos y productos vendidos por categoría',
    href: '/reports/report1'
  },
  { 
    id: 2, 
    title: 'Productos Más Vendidos', 
    description: 'Ranking de productos por cantidad vendida',
    href: '/reports/report2' 
  },
  { 
    id: 3, 
    title: 'Análisis de Clientes',
    description: 'Comportamiento de compra y segmentación de clientes',
    href: '/reports/report3'
  },
  { 
    id: 4, 
    title: 'Control de Inventario',
    description: 'Monitoreo de stock y productos con bajo inventario',
    href: '/reports/report4'
  },
  { 
    id: 5, 
    title: 'Productos por Rango de Precio',
    description: 'Análisis de precios y popularidad de productos',
    href: '/reports/report5'
  },
];

export default function HomePage() {
  return (
    <div className="container">
      <div className="header">
        <h1>Dashboard de Reportes</h1>
        <p>Sistema de análisis con PostgreSQL y Next.js</p>
      </div>

      <div className="report-grid">
        {reports.map((report) => (
          <Link key={report.id} href={report.href} className="report-card">
            <h3>{report.title}</h3>
            <p>{report.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}