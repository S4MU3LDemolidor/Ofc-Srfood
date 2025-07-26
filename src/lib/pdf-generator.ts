import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FichaTecnica, Cliente, Ingrediente, Passo } from '@/types';

export interface PDFData {
  ficha: FichaTecnica;
  cliente: Cliente;
  ingredientes: Ingrediente[];
  passos: Passo[];
}

export async function generateRecipePDF(data: PDFData): Promise<void> {
  const { ficha, cliente, ingredientes, passos } = data;
  
  // Create a temporary container for PDF content
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '210mm'; // A4 width
  container.style.background = 'white';
  container.style.padding = '15mm';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.fontSize = '12px';
  container.style.lineHeight = '1.4';
  container.style.pageBreakInside = 'avoid';
  
  // Build PDF content HTML
  let content = `
    <div style="max-width: 170mm; margin: 0 auto; padding: 10mm;">
      <!-- Header with SrFoodSafety logo -->
      <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #16a34a; padding-bottom: 25px; page-break-inside: avoid;">
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <div style="background: #16a34a; color: white; padding: 12px 16px; border-radius: 12px; font-weight: bold; margin-right: 15px; font-size: 18px; box-shadow: 0 4px 8px rgba(22,163,74,0.3);">Sr.</div>
          <h1 style="color: #16a34a; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: -1px;">SrFoodSafety</h1>
        </div>
        <h2 style="color: #16a34a; margin: 15px 0; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Ficha Técnica de Receita</h2>
        <h3 style="color: #1f2937; margin: 10px 0; font-size: 22px; font-weight: 600; background: #f8fafc; padding: 10px 20px; border-radius: 8px; display: inline-block;">${ficha.nomeReceita}</h3>
      </div>
      
      <!-- Recipe and Client photos side by side -->
      ${ficha.fotoProduto || cliente.logo ? `
        <div style="display: flex; gap: 30px; align-items: flex-start; margin-bottom: 40px; justify-content: center; page-break-inside: avoid;">
          ${ficha.fotoProduto ? `
            <div style="flex: 1; text-align: center;">
              <div style="background: #f8fafc; padding: 15px; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.1);">
                <img src="${ficha.fotoProduto}" style="max-width: 100%; max-height: 250px; border-radius: 8px; object-fit: cover;" />
                <p style="color: #16a34a; font-weight: bold; margin-top: 10px; font-size: 14px;">Produto Final</p>
              </div>
            </div>
          ` : ''}
          ${cliente.logo ? `
            <div style="flex: 0 0 140px; text-align: center;">
              <div style="background: #f8fafc; padding: 15px; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.1);">
                <img src="${cliente.logo}" style="max-width: 110px; max-height: 110px; border-radius: 8px; object-fit: contain;" />
                <p style="color: #16a34a; font-weight: bold; margin-top: 10px; font-size: 12px;">Cliente</p>
              </div>
            </div>
          ` : ''}
        </div>
      ` : ''}
      
      <!-- Client section -->
      <div style="text-align: center; margin-bottom: 25px; padding: 20px; border: 2px solid #e5e7eb; border-radius: 12px; background-color: #f9fafb; page-break-inside: avoid;">
        <h3 style="color: #22c55e; margin-bottom: 15px; font-size: 16px; font-weight: bold;">Cliente</h3>
        <h4 style="color: #1f2937; margin: 5px 0; font-size: 18px; font-weight: bold;">${cliente.nomeCliente}</h4>
        ${cliente.email ? `<p style="color: #6b7280; margin: 2px 0; font-size: 12px;">${cliente.email}</p>` : ''}
        ${cliente.telefone ? `<p style="color: #6b7280; margin: 2px 0; font-size: 12px;">${cliente.telefone}</p>` : ''}
      </div>
      
      <!-- Recipe information -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 35px; page-break-inside: avoid;">
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 5px solid #16a34a;">
          <h3 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 8px; margin-bottom: 20px; font-size: 18px; font-weight: bold;">📊 Informações Gerais</h3>
          <div style="space-y: 12px;">
            <p style="margin: 8px 0; font-size: 14px;"><strong style="color: #1f2937;">Tipo de Ficha:</strong> <span style="color: #16a34a; font-weight: 600;">${ficha.tipoFicha}</span></p>
            <p style="margin: 8px 0; font-size: 14px;"><strong style="color: #1f2937;">Peso da Preparação:</strong> <span style="color: #16a34a; font-weight: 600;">${ficha.pesoPreparacao}g</span></p>
            <p style="margin: 8px 0; font-size: 14px;"><strong style="color: #1f2937;">Peso por Porção:</strong> <span style="color: #16a34a; font-weight: 600;">${ficha.pesoPorcao}g</span></p>
            <p style="margin: 8px 0; font-size: 14px;"><strong style="color: #1f2937;">Tempo de Preparo:</strong> <span style="color: #16a34a; font-weight: 600;">${ficha.tempoPreparo} min</span></p>
            <p style="margin: 8px 0; font-size: 14px;"><strong style="color: #1f2937;">Rendimento:</strong> <span style="color: #16a34a; font-weight: 600;">${ficha.rendimento} porções</span></p>
          </div>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 5px solid #16a34a;">
          <h3 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 8px; margin-bottom: 20px; font-size: 18px; font-weight: bold;">👥 Responsáveis</h3>
          <div style="space-y: 12px;">
            <p style="margin: 8px 0; font-size: 14px;"><strong style="color: #1f2937;">Empresa:</strong> <span style="color: #16a34a; font-weight: 600;">${ficha.empresa}</span></p>
            <p style="margin: 8px 0; font-size: 14px;"><strong style="color: #1f2937;">Realizado por:</strong> <span style="color: #16a34a; font-weight: 600;">${ficha.realizadoPor}</span></p>
            <p style="margin: 8px 0; font-size: 14px;"><strong style="color: #1f2937;">Aprovado por:</strong> <span style="color: #16a34a; font-weight: 600;">${ficha.aprovadoPor}</span></p>
            <p style="margin: 8px 0; font-size: 14px;"><strong style="color: #1f2937;">Cliente:</strong> <span style="color: #16a34a; font-weight: 600;">${cliente.nomeCliente}</span></p>
          </div>
        </div>
      </div>
      
      <!-- Utensils -->
      <div style="margin-bottom: 35px; page-break-inside: avoid; background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 5px solid #16a34a;">
        <h3 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 8px; margin-bottom: 20px; font-size: 18px; font-weight: bold;">🍴 Utensílios Necessários</h3>
        <p style="font-size: 14px; line-height: 1.6; color: #1f2937;">${ficha.utensilhosNecessarios.join(', ')}</p>
      </div>
      
      <!-- Ingredients -->
      <div style="margin-bottom: 35px; page-break-inside: avoid;">
        <h3 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 8px; margin-bottom: 20px; font-size: 18px; font-weight: bold;">🥕 Ingredientes</h3>
        <table style="width: 100%; border-collapse: collapse; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: linear-gradient(135deg, #16a34a, #22c55e); color: white;">
              <th style="padding: 15px 12px; text-align: left; font-size: 14px; font-weight: bold;">Ingrediente</th>
              <th style="padding: 15px 12px; text-align: left; font-size: 14px; font-weight: bold;">Quantidade</th>
              <th style="padding: 15px 12px; text-align: left; font-size: 14px; font-weight: bold;">Medida Caseira</th>
            </tr>
          </thead>
          <tbody>
            ${ingredientes.map((ing, index) => `
              <tr style="background-color: ${index % 2 === 0 ? '#f8fafc' : 'white'};">
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px;">${ing.ingrediente}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; font-weight: 600; color: #16a34a;">${ing.quantidade}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px;">${ing.medidaCaseira}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <!-- Steps -->
      <div style="margin-bottom: 35px;">
        <h3 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 8px; margin-bottom: 25px; font-size: 18px; font-weight: bold;">👨‍🍳 Modo de Preparo</h3>
        ${passos.map((passo, index) => `
          <div style="margin-bottom: 25px; padding: 20px; border: 2px solid #e5e7eb; border-radius: 12px; page-break-inside: avoid; background: #f8fafc; border-left: 5px solid #16a34a;">
            <h4 style="color: #16a34a; margin-bottom: 15px; font-size: 16px; font-weight: bold; background: white; padding: 8px 12px; border-radius: 6px; display: inline-block;">Passo ${index + 1}</h4>
            <p style="margin-bottom: 15px; font-size: 14px; line-height: 1.6; color: #1f2937;">${passo.passo}</p>
            ${passo.foto ? `
              <div style="text-align: center; margin-top: 15px;">
                <img src="${passo.foto}" style="max-width: 100%; max-height: 180px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 10px;">
        <p>Ficha técnica gerada em ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>
    </div>
  `;
  
  container.innerHTML = content;
  document.body.appendChild(container);
  
  try {
    // Convert to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Download the PDF
    pdf.save(`ficha-tecnica-${ficha.nomeReceita.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Falha ao gerar PDF');
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
}