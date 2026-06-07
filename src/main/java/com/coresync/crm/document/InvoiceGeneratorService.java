package com.coresync.crm.document;

import com.coresync.crm.model.Lead;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.TextAlignment;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class InvoiceGeneratorService {

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
}
