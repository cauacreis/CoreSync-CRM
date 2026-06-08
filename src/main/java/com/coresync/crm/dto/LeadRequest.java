package com.coresync.crm.dto;

import com.coresync.crm.model.LeadStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LeadRequest {
    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;

    private String phone;

    @NotNull
    private LeadStatus status;

    @NotNull(message = "O valor estimado não pode ser nulo")
    private java.math.BigDecimal estimatedValue;

    private java.util.UUID productId;
}
