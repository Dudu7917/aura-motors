import { Lead, Car } from '../types';

export const exportToCSV = (leads: Lead[]) => {
  if (leads.length === 0) return;
  const headers = ['Nome', 'Telefone', 'Email', 'Marca Desejada', 'Modelo Desejado', 'Ano Min', 'Ano Max', 'Preco Max', 'Notas', 'Data Criacao'];
  const rows = leads.map(l => [
    l.fullName,
    l.phone,
    l.email || '',
    l.desiredBrand || '',
    l.desiredModel || '',
    l.minYear || '',
    l.maxYear || '',
    l.maxPrice || '',
    l.notes || '',
    l.createdAt || ''
  ]);
  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
    + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `leads_fila_espera_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const printReport = (leads: Lead[], cars: Car[]) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  const leadsHtml = leads.map(l => {
    const matches = cars.filter(car => {
      if (l.desiredBrand && !car.brand.toLowerCase().includes(l.desiredBrand.toLowerCase()) && !l.desiredBrand.toLowerCase().includes(car.brand.toLowerCase())) return false;
      if (l.desiredModel && !car.name.toLowerCase().includes(l.desiredModel.toLowerCase()) && !l.desiredModel.toLowerCase().includes(car.name.toLowerCase())) return false;
      if (l.minYear && car.year < l.minYear) return false;
      if (l.maxYear && car.year > l.maxYear) return false;
      if (l.maxPrice && car.price > l.maxPrice) return false;
      return true;
    });

    return `
      <div class="lead-card">
        <div class="lead-header">
          <h3>${l.fullName}</h3>
          <span class="lead-date">Registrado em ${new Date(l.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>
        <div class="lead-details">
          <p><strong>Contato:</strong> ${l.phone} ${l.email ? ` | ${l.email}` : ''}</p>
          <p><strong>Preferências:</strong> 
            ${l.desiredBrand ? `Marca: ${l.desiredBrand}` : ''} 
            ${l.desiredModel ? ` | Modelo: ${l.desiredModel}` : ''}
            ${l.minYear ? ` | Ano Mínimo: ${l.minYear}` : ''} 
            ${l.maxYear ? ` | Ano Máximo: ${l.maxYear}` : ''} 
            ${l.maxPrice ? ` | Preço Máximo: R$ ${l.maxPrice.toLocaleString('pt-BR')}` : ''}
          </p>
          ${l.notes ? `<p><strong>Anotações:</strong> <em>"${l.notes}"</em></p>` : ''}
        </div>
        <div class="matches-section">
          <h4>Veículos Compatíveis (${matches.length})</h4>
          ${matches.length > 0 ? `
            <ul class="matches-list">
              ${matches.map(m => `
                <li>
                  <strong>${m.brand} ${m.name}</strong> - ${m.year} | R$ ${m.price.toLocaleString('pt-BR')} | ${m.specs.rangeOrdisplacement}
                </li>
              `).join('')}
            </ul>
          ` : `<p class="no-matches">Aguardando veículo compatível em estoque.</p>`}
        </div>
      </div>
    `;
  }).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Relatório de Fila de Espera - Aura Motors</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1f2937; padding: 40px; background-color: #ffffff; }
          header { border-bottom: 2px solid #f59e0b; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
          h1 { font-family: Georgia, serif; font-size: 26px; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
          .subtitle { font-size: 11px; text-transform: uppercase; color: #6b7280; letter-spacing: 1.5px; margin-top: 5px; }
          .lead-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
          .lead-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f3f4f6; padding-bottom: 10px; margin-bottom: 10px; }
          .lead-header h3 { margin: 0; font-size: 16px; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; }
          .lead-date { font-size: 10px; color: #9ca3af; font-family: monospace; }
          .lead-details p { margin: 6px 0; font-size: 12px; }
          .matches-section { margin-top: 15px; background: #f9fafb; padding: 12px; border-radius: 8px; }
          .matches-section h4 { margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #f59e0b; }
          .matches-list { margin: 0; padding-left: 15px; font-size: 11px; }
          .matches-list li { margin: 4px 0; }
          .no-matches { font-size: 11px; color: #9ca3af; font-style: italic; margin: 0; }
          @media print {
            body { padding: 0; }
            header { border-bottom-color: #000000; }
          }
        </style>
      </head>
      <body>
        <header>
          <div>
            <h1>Aura Motors</h1>
            <div class="subtitle">Relatório da Fila de Espera • Geral</div>
          </div>
          <div style="font-size: 10px; text-align: right; color: #6b7280;">
            Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}<br>
            Total de Contatos: ${leads.length}
          </div>
        </header>
        ${leadsHtml}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
