package com.coresync.crm.repository;

import com.coresync.crm.model.TelegramSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TelegramSessionRepository extends JpaRepository<TelegramSession, Long> {
}
