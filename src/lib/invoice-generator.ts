// src/lib/invoice-generator.ts
import jsPDF from 'jspdf'

type InvoiceItem = {
  service_name: string
  qty: number
  unit_price: number
  total: number
}

type InvoiceData = {
  invoice_number: string
  invoice_date: string
  booking_id: string
  customer: {
    name: string
    email: string
    phone: string
    address: string
    city: string
    postcode: string
  }
  service_date?: string
  items: InvoiceItem[]
  subtotal: number
  discount: number
  total: number
  payment_status: string
}

export function generateInvoicePDF(data: InvoiceData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20

  // ============================================
  // HEADER with gradient background effect
  // ============================================

  // Gradient background rectangles (approximation since jsPDF doesn't support true gradients)
  doc.setFillColor(34, 197, 94) // Green
  doc.rect(0, 0, pageWidth, 50, 'F')

  doc.setFillColor(16, 185, 129) // Slightly darker green
  doc.rect(0, 30, pageWidth, 20, 'F')

  // Company name
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('Eleventh Hour Cleaning', margin, 25)

  // Tagline
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Premium Cleaning Services', margin, 35)

  // Invoice title on the right
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', pageWidth - margin, 25, { align: 'right' })

  // Invoice number
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(251, 191, 36) // Amber
  doc.text(data.invoice_number, pageWidth - margin, 35, { align: 'right' })

  // Status badge
  let statusColor: [number, number, number] = [156, 163, 175] // Gray
  if (data.payment_status === 'paid') statusColor = [34, 197, 94] // Green
  else if (data.payment_status === 'pending') statusColor = [251, 191, 36] // Amber
  else if (data.payment_status === 'failed') statusColor = [239, 68, 68] // Red

  doc.setFillColor(...statusColor)
  doc.roundedRect(pageWidth - margin - 35, 38, 35, 8, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(data.payment_status.toUpperCase(), pageWidth - margin - 17.5, 43, { align: 'center' })

  // ============================================
  // COMPANY & INVOICE DETAILS
  // ============================================

  let yPos = 65

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  // Company details (left side)
  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128) // Gray-500
  doc.text('Eleventh Hour Cleaning Ltd', margin, yPos)
  doc.text('London, UK', margin, yPos + 5)
  doc.text('hello@eleventhhourcleaning.co.uk', margin, yPos + 10)
  doc.text('Landline: 020 3355 1526 | WhatsApp: 07400 760630', margin, yPos + 15)

  // Invoice details (right side)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(75, 85, 99) // Gray-600
  doc.text('Invoice Date:', pageWidth - margin - 60, yPos)
  doc.text('Booking ID:', pageWidth - margin - 60, yPos + 5)
  if (data.service_date) {
    doc.text('Service Date:', pageWidth - margin - 60, yPos + 10)
  }

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text(data.invoice_date, pageWidth - margin, yPos, { align: 'right' })
  doc.text(data.booking_id.slice(0, 8).toUpperCase(), pageWidth - margin, yPos + 5, { align: 'right' })
  if (data.service_date) {
    doc.text(data.service_date, pageWidth - margin, yPos + 10, { align: 'right' })
  }

  // ============================================
  // BILL TO SECTION
  // ============================================

  yPos += 35

  // Bill To box
  doc.setFillColor(249, 250, 251) // Gray-50
  doc.roundedRect(margin, yPos - 5, pageWidth - 2 * margin, 35, 3, 3, 'F')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(107, 114, 128) // Gray-500
  doc.text('BILL TO', margin + 5, yPos)

  yPos += 7
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(data.customer.name, margin + 5, yPos)

  yPos += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  doc.text(data.customer.address, margin + 5, yPos)

  yPos += 5
  doc.text(`${data.customer.city}, ${data.customer.postcode}`, margin + 5, yPos)

  yPos += 5
  doc.text(data.customer.email, margin + 5, yPos)

  yPos += 5
  doc.text(data.customer.phone, margin + 5, yPos)

  // ============================================
  // ITEMS TABLE
  // ============================================

  yPos += 15

  // Table header
  doc.setFillColor(251, 191, 36) // Amber
  doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('Service', margin + 3, yPos + 6.5)
  doc.text('Qty', pageWidth - margin - 70, yPos + 6.5, { align: 'center' })
  doc.text('Unit Price', pageWidth - margin - 45, yPos + 6.5, { align: 'right' })
  doc.text('Total', pageWidth - margin - 3, yPos + 6.5, { align: 'right' })

  yPos += 10

  // Table rows
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(9)

  data.items.forEach((item, index) => {
    if (yPos > pageHeight - 80) {
      // Add new page if needed
      doc.addPage()
      yPos = margin
    }

    // Alternating row colors
    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251) // Gray-50
      doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
    }

    doc.text(item.service_name, margin + 3, yPos + 5.5)
    doc.text(item.qty.toString(), pageWidth - margin - 70, yPos + 5.5, { align: 'center' })
    doc.text(`£${item.unit_price.toFixed(2)}`, pageWidth - margin - 45, yPos + 5.5, { align: 'right' })
    doc.text(`£${item.total.toFixed(2)}`, pageWidth - margin - 3, yPos + 5.5, { align: 'right' })

    yPos += 8
  })

  // ============================================
  // TOTALS SECTION
  // ============================================

  yPos += 10

  const totalsX = pageWidth - margin - 60

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(75, 85, 99)

  // Subtotal
  doc.text('Subtotal:', totalsX, yPos)
  doc.text(`£${data.subtotal.toFixed(2)}`, pageWidth - margin - 3, yPos, { align: 'right' })

  // Discount (if applicable)
  if (data.discount > 0) {
    yPos += 6
    doc.setTextColor(34, 197, 94) // Green
    doc.text('Discount:', totalsX, yPos)
    doc.text(`-£${data.discount.toFixed(2)}`, pageWidth - margin - 3, yPos, { align: 'right' })
  }

  // Total
  yPos += 8
  doc.setLineWidth(0.5)
  doc.setDrawColor(251, 191, 36) // Amber
  doc.line(totalsX - 5, yPos - 3, pageWidth - margin, yPos - 3)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text('Total:', totalsX, yPos + 2)
  doc.setTextColor(251, 191, 36) // Amber
  doc.text(`£${data.total.toFixed(2)} GBP`, pageWidth - margin - 3, yPos + 2, { align: 'right' })

  // ============================================
  // PAYMENT INFORMATION
  // ============================================

  yPos += 20

  doc.setFillColor(254, 252, 232) // Yellow-50
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 30, 3, 3, 'F')

  yPos += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(120, 53, 15) // Yellow-900
  doc.text('PAYMENT INFORMATION', margin + 5, yPos)

  yPos += 7
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(113, 63, 18) // Yellow-800

  doc.text('Stripe Payment & Bank Transfer:', margin + 5, yPos)
  yPos += 5
  doc.text('Account Title: Eleventh Hour Cleaning and Maintenance Services Ltd.', margin + 5, yPos)
  yPos += 4
  doc.text('Sort Code: XX-XX-XX  |  Account Number: XXXXXXXX', margin + 5, yPos)
  yPos += 5
  doc.text(`Reference: ${data.invoice_number}`, margin + 5, yPos)

  // ============================================
  // FOOTER
  // ============================================

  yPos = pageHeight - 25

  doc.setDrawColor(229, 231, 235) // Gray-200
  doc.setLineWidth(0.3)
  doc.line(margin, yPos, pageWidth - margin, yPos)

  yPos += 6
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 114, 128)
  doc.text('Thank you for choosing Eleventh Hour Cleaning!', pageWidth / 2, yPos, { align: 'center' })

  yPos += 5
  doc.setFontSize(8)
  doc.text('www.eleventhhourkleaning.co.uk  |  hello@eleventhhourcleaning.co.uk', pageWidth / 2, yPos, { align: 'center' })

  yPos += 4
  doc.text('Landline: 020 3355 1526  |  WhatsApp: 07400 760630', pageWidth / 2, yPos, { align: 'center' })

  return doc
}

export function downloadInvoice(data: InvoiceData) {
  const pdf = generateInvoicePDF(data)
  const fileName = `Invoice_${data.invoice_number.replace(/\s+/g, '_')}.pdf`
  pdf.save(fileName)
}

export function viewInvoice(data: InvoiceData) {
  const pdf = generateInvoicePDF(data)
  const pdfBlob = pdf.output('blob')
  const pdfUrl = URL.createObjectURL(pdfBlob)
  window.open(pdfUrl, '_blank')
}
