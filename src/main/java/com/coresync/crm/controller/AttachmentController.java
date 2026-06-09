package com.coresync.crm.controller;

import com.coresync.crm.model.Lead;
import com.coresync.crm.repository.LeadRepository;
import com.coresync.crm.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/leads/{id}/attachments")
@RequiredArgsConstructor
@Slf4j
public class AttachmentController {

    private final LeadRepository leadRepository;

    @PostMapping
    public ResponseEntity<?> uploadAttachment(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) {
        
        UUID companyId = TenantContext.getTenantId();
        Lead lead = leadRepository.findByIdAndCompanyId(id, companyId).orElse(null);
        
        if (lead == null) {
            return ResponseEntity.notFound().build();
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Arquivo vazio");
        }

        try {
            // Diretório de uploads base
            Path uploadDir = Paths.get("data", "uploads");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            // Gerar nome único
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + extension;
            
            Path targetLocation = uploadDir.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Gerar a URL para acesso (baseada na configuração do WebConfig)
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/")
                    .path(uniqueFilename)
                    .toUriString();

            lead.getAttachments().add(fileDownloadUri);
            leadRepository.save(lead);

            return ResponseEntity.status(HttpStatus.CREATED).body(java.util.Map.of("url", fileDownloadUri));

        } catch (IOException ex) {
            log.error("Erro ao salvar arquivo de upload", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno ao salvar arquivo.");
        }
    }
}
