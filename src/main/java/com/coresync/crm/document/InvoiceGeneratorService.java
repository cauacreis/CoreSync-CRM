package com.coresync.crm.document;

import com.coresync.crm.model.Lead;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.events.PdfDocumentEvent;
import com.itextpdf.kernel.events.IEventHandler;
import com.itextpdf.kernel.events.Event;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.Canvas;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class InvoiceGeneratorService {

    private static class FooterEventHandler implements IEventHandler {
        @Override
        public void handleEvent(Event event) {
            PdfDocumentEvent docEvent = (PdfDocumentEvent) event;
            com.itextpdf.kernel.pdf.PdfDocument pdf = docEvent.getDocument();
            com.itextpdf.kernel.pdf.PdfPage page = docEvent.getPage();
            Rectangle pageSize = page.getPageSize();
            PdfCanvas pdfCanvas = new PdfCanvas(page.newContentStreamBefore(), page.getResources(), pdf);
            Canvas canvas = new Canvas(pdfCanvas, pageSize);

            float x = pageSize.getX() + 36;
            float y = pageSize.getY() + 20;
            float width = pageSize.getWidth() - 72;

            canvas.add(new Paragraph(new Text("Gerado pelo CoreSync CRM - Agentic SaaS"))
                    .setFontSize(10)
                    .setBold()
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setFixedPosition(x, y, width));

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
            String now = LocalDateTime.now().format(dtf);
            canvas.add(new Paragraph(new Text(now))
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.LEFT)
                    .setFixedPosition(x, y, width));

            pdfCanvas.setLineWidth(3f);
            pdfCanvas.moveTo(x, y + 15);
            pdfCanvas.lineTo(x + width, y + 15);
            pdfCanvas.stroke();
            
            canvas.close();
        }
    }

    public byte[] generateContractPdf(Lead lead) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Title
            Paragraph title = new Paragraph("CONTRATO DE FECHAMENTO")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setBold()
                    .setFontSize(20)
                    .setMarginBottom(30);
            document.add(title);

            // Intro
            document.add(new Paragraph("Este documento formaliza o fechamento da negociação e serve como rascunho de contrato."));
            document.add(new Paragraph("\n"));

            // Lead Details
            document.add(new Paragraph(new Text("Nome do Lead: ").setBold()).add(lead.getName()));
            document.add(new Paragraph(new Text("Telefone de Contato: ").setBold()).add(lead.getPhone() != null ? lead.getPhone() : "N/A"));
            document.add(new Paragraph(new Text("E-mail de Contato: ").setBold()).add(lead.getEmail() != null ? lead.getEmail() : "N/A"));

            // Value formatting
            NumberFormat format = NumberFormat.getCurrencyInstance(Locale.US);
            String formattedValue = lead.getEstimatedValue() != null ? format.format(lead.getEstimatedValue()) : "$0.00";
            document.add(new Paragraph(new Text("Valor Acordado: ").setBold()).add(formattedValue));

            document.add(new Paragraph("\n"));

            // Timestamp
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
            String now = LocalDateTime.now().format(dtf);
            document.add(new Paragraph(new Text("Data de Aprovação: ").setBold()).add(now));

            document.add(new Paragraph("\n"));
            document.add(new Paragraph("________________________________________________"));
            document.add(new Paragraph("Assinatura do Representante").setTextAlignment(TextAlignment.CENTER));

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF do contrato em memoria", e);
        }
    }

    public byte[] generateDashboardReport(com.coresync.crm.dto.DashboardMetricsResponse metrics, java.util.List<com.coresync.crm.model.AuditLog> auditLogs) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            pdfDoc.addEventHandler(PdfDocumentEvent.END_PAGE, new FooterEventHandler());
            
            Document document = new Document(pdfDoc);
            document.setMargins(50, 36, 70, 36);

            // Header Neo-Brutalist
            Table headerTable = new Table(UnitValue.createPercentArray(new float[]{100})).useAllAvailableWidth();
            headerTable.addCell(new Cell()
                    .add(new Paragraph("RELATÓRIO DE INSIGHTS EXECUTIVOS").setBold().setFontSize(22))
                    .setBackgroundColor(ColorConstants.BLACK)
                    .setFontColor(ColorConstants.WHITE)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setPadding(20)
                    .setBorder(new SolidBorder(ColorConstants.BLACK, 3)));
            document.add(headerTable.setMarginBottom(30));

            // Metrics Section (Cards)
            document.add(new Paragraph("VISÃO GERAL DO PIPELINE").setBold().setFontSize(14).setMarginBottom(10));
            
            Table cardsTable = new Table(UnitValue.createPercentArray(new float[]{33, 33, 34})).useAllAvailableWidth();
            DeviceRgb highlightGreen = new DeviceRgb(20, 180, 20);
            
            cardsTable.addCell(createCard("Total de Leads", String.valueOf(metrics.totalLeads()), ColorConstants.BLACK));
            cardsTable.addCell(createCard("Leads Ganho", String.valueOf(metrics.totalWonLeads()), ColorConstants.BLACK));
            cardsTable.addCell(createCard("Taxa de Conversão", String.format("%.2f%%", metrics.conversionRate()), ColorConstants.BLACK));
            
            NumberFormat format = NumberFormat.getCurrencyInstance(Locale.US);
            cardsTable.addCell(createCard("Valor do Pipeline", format.format(metrics.totalPipelineValue()), highlightGreen));
            cardsTable.addCell(createCard("Receita Ganha", format.format(metrics.totalRevenueWon()), highlightGreen));
            java.math.BigDecimal ticketMedio = metrics.totalWonLeads() > 0 
                    ? metrics.totalRevenueWon().divide(new java.math.BigDecimal(metrics.totalWonLeads()), 2, java.math.RoundingMode.HALF_UP) 
                    : java.math.BigDecimal.ZERO;
            cardsTable.addCell(createCard("Ticket Médio", format.format(ticketMedio), highlightGreen));

            document.add(cardsTable.setMarginBottom(30));

            // Audit Logs Section
            document.add(new Paragraph("ÚLTIMAS MOVIMENTAÇÕES (AOP)").setBold().setFontSize(14).setMarginBottom(10));
            
            Table auditTable = new Table(UnitValue.createPercentArray(new float[]{20, 20, 20, 40})).useAllAvailableWidth();
            auditTable.addHeaderCell(createAuditHeaderCell("Data/Hora"));
            auditTable.addHeaderCell(createAuditHeaderCell("Usuário"));
            auditTable.addHeaderCell(createAuditHeaderCell("Ação"));
            auditTable.addHeaderCell(createAuditHeaderCell("Entidade"));
            
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yy HH:mm:ss");
            boolean zebra = false;
            
            if (auditLogs == null || auditLogs.isEmpty()) {
                Cell emptyCell = new Cell(1, 4).add(new Paragraph("Nenhuma movimentação registrada."))
                    .setTextAlignment(TextAlignment.CENTER).setPadding(10).setBorder(new SolidBorder(1));
                auditTable.addCell(emptyCell);
            } else {
                for (com.coresync.crm.model.AuditLog log : auditLogs) {
                    com.itextpdf.kernel.colors.Color bgColor = zebra ? new DeviceRgb(240, 240, 240) : ColorConstants.WHITE;
                    
                    auditTable.addCell(createAuditCell(log.getTimestamp().format(dtf), bgColor));
                    auditTable.addCell(createAuditCell(log.getPerformedBy(), bgColor));
                    auditTable.addCell(createAuditCell(log.getAction(), bgColor));
                    auditTable.addCell(createAuditCell(log.getEntityName(), bgColor));
                    
                    zebra = !zebra;
                }
            }
            
            document.add(auditTable);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF do relatório em memoria", e);
        }
    }

    private Cell createCard(String title, String value, com.itextpdf.kernel.colors.Color valueColor) {
        Cell cell = new Cell().setPadding(15).setBorder(new SolidBorder(ColorConstants.BLACK, 2));
        cell.add(new Paragraph(title).setFontSize(10).setBold().setFontColor(ColorConstants.DARK_GRAY));
        cell.add(new Paragraph(value).setFontSize(16).setBold().setFontColor(valueColor));
        return cell;
    }
    
    private Cell createAuditHeaderCell(String text) {
        return new Cell().add(new Paragraph(text).setBold().setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(ColorConstants.BLACK)
                .setPadding(8)
                .setBorder(new SolidBorder(ColorConstants.BLACK, 2));
    }
    
    private Cell createAuditCell(String text, com.itextpdf.kernel.colors.Color bgColor) {
        return new Cell().add(new Paragraph(text).setFontSize(10))
                .setBackgroundColor(bgColor)
                .setPadding(8)
                .setBorder(new SolidBorder(ColorConstants.BLACK, 1));
    }
}
