package com.coresync.crm.aop;

import com.coresync.crm.model.AuditLog;
import com.coresync.crm.repository.AuditLogRepository;
import com.coresync.crm.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.util.UUID;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditLogRepository auditLogRepository;

    @AfterReturning(pointcut = "@annotation(auditable)", returning = "result")
    public void logAction(Auditable auditable, Object result) {
        if (result == null) return;

        try {
            UUID companyId = TenantContext.getTenantId();
            String userEmail = TenantContext.getUserEmail();

            if (companyId == null || userEmail == null) return;

            // Extrair ID via Reflexão
            Field idField = getField(result.getClass(), "id");
            if (idField != null) {
                idField.setAccessible(true);
                Object idValue = idField.get(result);

                if (idValue instanceof UUID) {
                    AuditLog log = AuditLog.builder()
                            .entityName(result.getClass().getSimpleName().toUpperCase())
                            .entityId((UUID) idValue)
                            .action(auditable.action())
                            .performedBy(userEmail)
                            .companyId(companyId)
                            .build();

                    auditLogRepository.save(log);
                }
            }
        } catch (Exception e) {
            // Log silencioso no console para não quebrar fluxo principal
            System.err.println("Erro ao gerar log de auditoria via AOP: " + e.getMessage());
        }
    }

    private Field getField(Class<?> clazz, String fieldName) {
        Class<?> currentClass = clazz;
        while (currentClass != null) {
            try {
                return currentClass.getDeclaredField(fieldName);
            } catch (NoSuchFieldException e) {
                currentClass = currentClass.getSuperclass();
            }
        }
        return null;
    }
}
