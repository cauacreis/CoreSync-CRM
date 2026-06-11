package com.coresync.crm.service;

import com.coresync.crm.ai.GroqClientService;
import com.coresync.crm.model.Lead;
import com.coresync.crm.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeadSmartTagWorker {

    private final GroqClientService groqClientService;
    private final LeadRepository leadRepository;

    @Async
    public void processSmartTagsAsync(Lead lead) {
        if (lead.getDescription() == null || lead.getDescription().trim().length() < 10) {
            return;
        }

        try {
            List<String> tags = groqClientService.generateSmartTags(lead.getDescription());
            if (tags != null && !tags.isEmpty()) {
                lead.setSmartTags(tags);
                leadRepository.save(lead);
            }
        } catch (Exception e) {
            // Silently ignore AI errors to not crash the background worker
        }
    }
}
