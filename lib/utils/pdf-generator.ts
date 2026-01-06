import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PurchaseOrder } from '@/lib/types/purchase-order';

export const generatePurchaseOrderPDF = (order: PurchaseOrder) => {
  const doc = new jsPDF();

  // Corporate colors
  const primaryBlue: [number, number, number] = [30, 58, 111]; // #1e3a6f
  const secondaryGreen: [number, number, number] = [124, 179, 66]; // #7cb342

  // Header - Company name
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('Tonic Life', 15, 15);

  doc.setFontSize(10);
  doc.text('Manufacturing Resource Planning', 15, 22);
  doc.text('Orden de Compra', 15, 28);

  // Order number and date (right side)
  doc.setFontSize(12);
  doc.text(order.order_number, 195, 15, { align: 'right' });
  doc.setFontSize(9);
  doc.text(`Fecha: ${new Date(order.order_date).toLocaleDateString('es-MX')}`, 195, 22, { align: 'right' });

  // Status badge
  const statusLabels: { [key: string]: string } = {
    'DRAFT': 'Borrador',
    'PENDING_APPROVAL': 'Pendiente Aprobación',
    'APPROVED': 'Aprobada',
    'SENT': 'Enviada',
    'PARTIALLY_RECEIVED': 'Parcialmente Recibida',
    'COMPLETED': 'Completada',
    'CANCELLED': 'Cancelada',
  };
  doc.text(`Estado: ${statusLabels[order.status] || order.status}`, 195, 28, { align: 'right' });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Supplier information
  let yPos = 45;
  doc.setFontSize(12);
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text('Información del Proveedor', 15, yPos);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  yPos += 7;
  doc.text(`Proveedor: ${order.suppliers.name}`, 15, yPos);
  yPos += 5;
  doc.text(`Código: ${order.suppliers.code}`, 15, yPos);

  if (order.suppliers.contact_email) {
    yPos += 5;
    doc.text(`Email: ${order.suppliers.contact_email}`, 15, yPos);
  }

  if (order.suppliers.contact_phone) {
    yPos += 5;
    doc.text(`Teléfono: ${order.suppliers.contact_phone}`, 15, yPos);
  }

  // Order details
  yPos += 10;
  doc.setFontSize(12);
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text('Detalles de la Orden', 15, yPos);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  yPos += 7;

  if (order.expected_date) {
    doc.text(`Fecha de Entrega Esperada: ${new Date(order.expected_date).toLocaleDateString('es-MX')}`, 15, yPos);
    yPos += 5;
  }

  // Items table
  yPos += 5;
  const tableData = order.purchase_order_items.map((item) => [
    item.products?.code || '-',
    item.products?.name || '-',
    item.quantity.toFixed(2),
    item.products?.unit_measure || '-',
    `$${item.unit_price.toFixed(2)}`,
    `$${item.total.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Código', 'Producto', 'Cantidad', 'Unidad', 'P. Unitario', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryBlue,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 70 },
      2: { cellWidth: 20, halign: 'right' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 25, halign: 'right' },
    },
  });

  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;

  // Totals
  const totalsY = finalY + 10;
  doc.setFontSize(10);

  const subtotal = (order.subtotal || 0);
  const taxAmount = (order.tax_amount || 0);
  const totalAmount = (order.total_amount || subtotal + taxAmount);

  doc.text('Subtotal:', 140, totalsY);
  doc.text(`$${subtotal.toFixed(2)}`, 195, totalsY, { align: 'right' });

  if (taxAmount > 0) {
    doc.text('IVA:', 140, totalsY + 5);
    doc.text(`$${taxAmount.toFixed(2)}`, 195, totalsY + 5, { align: 'right' });
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 140, totalsY + 10);
  doc.text(`$${totalAmount.toFixed(2)}`, 195, totalsY + 10, { align: 'right' });

  // Notes
  if (order.notes) {
    const notesY = totalsY + 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notas:', 15, notesY);
    doc.setFont('helvetica', 'normal');

    const splitNotes = doc.splitTextToSize(order.notes, 180);
    doc.text(splitNotes, 15, notesY + 5);
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      `Generado: ${new Date().toLocaleString('es-MX')}`,
      15,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  return doc;
};

export const downloadPurchaseOrderPDF = (order: PurchaseOrder) => {
  const doc = generatePurchaseOrderPDF(order);
  doc.save(`Orden_Compra_${order.order_number}.pdf`);
};

export const printPurchaseOrder = (order: PurchaseOrder) => {
  const doc = generatePurchaseOrderPDF(order);

  // Open PDF in new window for printing
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');

  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
