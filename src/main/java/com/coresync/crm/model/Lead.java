package com.coresync.crm.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "leads")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeadStatus status;

    @Column(precision = 19, scale = 2)
    private java.math.BigDecimal estimatedValue;

    @Column(nullable = false, name = "company_id")
    private UUID companyId;

    @Column(columnDefinition = "TEXT")
    private String chatHistory;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "lead_attachments", joinColumns = @JoinColumn(name = "lead_id"))
    @Column(name = "file_url")
    @Builder.Default
    private java.util.List<String> attachments = new java.util.ArrayList<>();
}
