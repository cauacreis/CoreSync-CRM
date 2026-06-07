package com.coresync.crm.event;

import com.coresync.crm.model.LeadStatus;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

public class LeadStatusChangedEvent extends ApplicationEvent {
    private final UUID companyId;
    private final UUID leadId;
    private final String leadName;
    private final LeadStatus oldStatus;
    private final LeadStatus newStatus;

    public LeadStatusChangedEvent(Object source, UUID companyId, UUID leadId, String leadName, LeadStatus oldStatus, LeadStatus newStatus) {
        super(source);
        this.companyId = companyId;
        this.leadId = leadId;
        this.leadName = leadName;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
    }

    public UUID getCompanyId() {
        return companyId;
    }

    public UUID getLeadId() {
        return leadId;
    }

    public String getLeadName() {
        return leadName;
    }

    public LeadStatus getOldStatus() {
        return oldStatus;
    }

    public LeadStatus getNewStatus() {
        return newStatus;
    }
}
