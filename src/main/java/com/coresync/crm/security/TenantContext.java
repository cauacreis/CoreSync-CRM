package com.coresync.crm.security;

import java.util.UUID;

public class TenantContext {

    private static final ThreadLocal<UUID> currentTenant = new ThreadLocal<>();
    private static final ThreadLocal<String> currentUserEmail = new ThreadLocal<>();

    public static void setTenantId(UUID tenantId) {
        currentTenant.set(tenantId);
    }

    public static UUID getTenantId() {
        return currentTenant.get();
    }

    public static void setUserEmail(String email) {
        currentUserEmail.set(email);
    }

    public static String getUserEmail() {
        return currentUserEmail.get();
    }

    public static void clear() {
        currentTenant.remove();
        currentUserEmail.remove();
    }
}
