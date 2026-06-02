package com.coresync.crm.dto;

import com.coresync.crm.model.LeadStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStatusRequest {
    @NotNull(message = "O novo status não pode ser nulo")
    private LeadStatus status;
}
