package com.coresync.crm.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "telegram_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelegramSession {
    @Id
    private Long chatId;
    
    private UUID userId;
    private UUID companyId;
    
    @Enumerated(EnumType.STRING)
    private ChatState conversationState;
    
    private UUID selectedLeadId;
    
    private String pendingEmail;
}
