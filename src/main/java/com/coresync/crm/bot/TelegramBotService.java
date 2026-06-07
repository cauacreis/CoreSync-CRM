package com.coresync.crm.bot;

import com.coresync.crm.ai.GroqClientService;
import com.coresync.crm.model.ChatState;
import com.coresync.crm.model.Lead;
import com.coresync.crm.model.LeadStatus;
import com.coresync.crm.model.TelegramSession;
import com.coresync.crm.model.User;
import com.coresync.crm.repository.LeadRepository;
import com.coresync.crm.repository.TelegramSessionRepository;
import com.coresync.crm.repository.UserRepository;
import com.coresync.crm.security.TenantContext;
import com.coresync.crm.service.LeadService;
import com.coresync.crm.service.DashboardService;
import com.coresync.crm.dto.DashboardMetricsResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class TelegramBotService extends TelegramLongPollingBot {

    private final String botUsername;
    private final GroqClientService groqClientService;
    private final TelegramSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LeadRepository leadRepository;
    private final LeadService leadService;
    private final DashboardService dashboardService;
    private final ObjectMapper objectMapper;

    public TelegramBotService(
            @Value("${telegram.bot.token}") String botToken,
            @Value("${telegram.bot.username}") String botUsername,
            GroqClientService groqClientService,
            TelegramSessionRepository sessionRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            LeadRepository leadRepository,
            LeadService leadService,
            DashboardService dashboardService,
            ObjectMapper objectMapper) {
        super(botToken);
        this.botUsername = botUsername;
        this.groqClientService = groqClientService;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.leadRepository = leadRepository;
        this.leadService = leadService;
        this.dashboardService = dashboardService;
        this.objectMapper = objectMapper;
    }

    @Override
    public String getBotUsername() {
        return botUsername;
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (!update.hasMessage() || !update.getMessage().hasText()) {
            return;
        }

        Long chatId = update.getMessage().getChatId();
        String text = update.getMessage().getText().trim();

        try {
            if (text.startsWith("/login")) {
                handleLogin(chatId, text);
                return;
            }
            if (text.startsWith("/comandos")) {
                handleComandos(chatId);
                return;
            }

            TelegramSession session = sessionRepository.findById(chatId).orElse(null);
            if (session == null) {
                sendMessage(chatId, "⚠️ Você não está autenticado. Use /login <email> <senha>");
                return;
            }

            // Máquina de Estados
            switch (session.getConversationState()) {
                case IDLE -> handleIdleState(session, text);
                case WAITING_LEAD_INDEX -> handleWaitingLeadIndex(session, text);
                case WAITING_STATUS -> handleWaitingStatus(session, text);
                case WAITING_LEAD_DATA -> handleWaitingLeadData(session, text);
            }

        } catch (Exception e) {
            log.error("Erro no processamento do bot", e);
            sendMessage(chatId, "❌ Ocorreu um erro interno. A sessão foi resetada.");
            resetSession(chatId);
        }
    }

    private void handleComandos(Long chatId) {
        String msg = "🤖 *Comandos do CoreSync Bot:*\n" +
                "/login <email> <senha> - Fazer login na conta\n" +
                "/comandos - Mostrar esta lista de comandos\n\n" +
                "💬 *Diga o que você precisa (IA):*\n" +
                "- \"Quero cadastrar um novo lead\"\n" +
                "- \"Quais são os meus leads?\"\n" +
                "- \"Atualizar status de um lead\"\n" +
                "- \"Me manda o link do dashboard\"\n" +
                "- \"Como estão as vendas?\"";
        sendMessage(chatId, msg);
    }

    private void handleLogin(Long chatId, String text) {
        String[] parts = text.split(" ");
        if (parts.length != 3) {
            sendMessage(chatId, "Formato inválido. Use: /login <email> <senha>");
            return;
        }

        String email = parts[1];
        String password = parts[2];

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            sendMessage(chatId, "Credenciais inválidas.");
            return;
        }

        TelegramSession session = TelegramSession.builder()
                .chatId(chatId)
                .userId(user.getId())
                .companyId(user.getCompany().getId())
                .conversationState(ChatState.IDLE)
                .build();

        sessionRepository.save(session);
        sendWelcomeMessageWithButtons(chatId, "✅ Login realizado com sucesso! Bem-vindo(a) ao CoreSync Bot! 🚀\n\nEscolha uma das opções no menu abaixo ou simplesmente digite o que deseja fazer:");
    }

    private void handleIdleState(TelegramSession session, String text) throws Exception {
        sendMessage(session.getChatId(), "🧠 Analisando sua intenção com IA...");
        String jsonIntent = groqClientService.classifyIntent(text);
        
        JsonNode node = objectMapper.readTree(jsonIntent);
        String intent = node.has("intent") ? node.get("intent").asText() : "UNKNOWN";

        if ("CREATE_LEAD".equals(intent) || intent.equals("CREATE")) {
            sendMessage(session.getChatId(), "Ótimo! Digite o NOME, TELEFONE, VALOR ESTIMADO e STATUS do lead separados por vírgula. (Ex: TechCorp, 11999999999, 50000, NEW)");
            session.setConversationState(ChatState.WAITING_LEAD_DATA);
            sessionRepository.save(session);
        } else if ("UPDATE_LEAD".equals(intent) || intent.equals("UPDATE")) {
            List<Lead> leads = leadRepository.findAllByCompanyId(session.getCompanyId());
            if (leads.isEmpty()) {
                sendMessage(session.getChatId(), "Sua empresa ainda não possui leads.");
                return;
            }

            StringBuilder sb = new StringBuilder("Qual lead você deseja atualizar?\n\n");
            for (int i = 0; i < leads.size(); i++) {
                sb.append(i + 1).append(". ").append(leads.get(i).getName())
                  .append(" (").append(leads.get(i).getStatus()).append(")\n");
            }
            sendMessage(session.getChatId(), sb.toString());
            
            session.setConversationState(ChatState.WAITING_LEAD_INDEX);
            sessionRepository.save(session);
        } else if ("GET_DASHBOARD".equals(intent)) {
            try {
                TenantContext.setTenantId(session.getCompanyId());
                DashboardMetricsResponse metrics = dashboardService.getMetrics();
                
                String msg = String.format("📊 Seu CoreSync Dashboard:\n💰 Pipeline Total: US$ %.2f\n🏆 Receita Ganha: US$ %.2f\n📈 Taxa de Conversão: %.1f%%",
                        metrics.totalPipelineValue(), metrics.totalRevenueWon(), metrics.conversionRate());
                
                sendMessage(session.getChatId(), msg);
            } finally {
                TenantContext.clear();
            }
        } else if ("GET_DASHBOARD_LINK".equals(intent)) {
            sendMessage(session.getChatId(), "🌐 Acesse o dashboard completo em: https://coresync.com/dashboard");
        } else if ("LIST_LEADS".equals(intent)) {
            List<Lead> leads = leadRepository.findAllByCompanyId(session.getCompanyId());
            if (leads.isEmpty()) {
                sendMessage(session.getChatId(), "Sua empresa ainda não possui leads cadastrados.");
            } else {
                StringBuilder sb = new StringBuilder("📋 *Seus Leads Atuais:*\n\n");
                for (Lead l : leads) {
                    sb.append("👤 ").append(l.getName())
                      .append(" | 📞 ").append(l.getPhone() != null ? l.getPhone() : "N/A")
                      .append(" | 🏷️ ").append(l.getStatus())
                      .append("\n");
                }
                sendMessage(session.getChatId(), sb.toString());
                
                String followUpMsg = "🤖 *O que você deseja fazer a seguir?*\n" +
                                     "Responda com uma frase ou escolha uma das opções abaixo:\n\n" +
                                     "1️⃣ Cadastrar um novo lead\n" +
                                     "2️⃣ Atualizar o status de um lead\n" +
                                     "3️⃣ Ver o relatório do Dashboard\n" +
                                     "4️⃣ Pedir o link do Dashboard\n" +
                                     "5️⃣ Listar os comandos (/comandos)";
                sendMessage(session.getChatId(), followUpMsg);
            }
        } else {
            sendMessage(session.getChatId(), "Não entendi sua intenção. Atualmente suporto: listar leads, cadastrar leads, atualizar leads, ver relatório financeiro e enviar o link do dashboard.");
        }
    }

    private void handleWaitingLeadData(TelegramSession session, String text) {
        try {
            String[] parts = text.split(",");
            if (parts.length < 3) {
                sendMessage(session.getChatId(), "Formato incorreto. Digite: Nome, Telefone, Valor, [Status]. (Ex: Empresa X, 1199999999, 10000, NEW)");
                session.setConversationState(ChatState.IDLE);
                sessionRepository.save(session);
                return;
            }

            String name = parts[0].trim();
            String phone = parts[1].trim();
            java.math.BigDecimal value = new java.math.BigDecimal(parts[2].trim());

            LeadStatus status = LeadStatus.NEW;
            if (parts.length >= 4) {
                try {
                    status = LeadStatus.valueOf(parts[3].trim().toUpperCase());
                } catch (IllegalArgumentException e) {
                    sendMessage(session.getChatId(), "Status '" + parts[3].trim() + "' inválido. Usando status padrão (NEW).");
                }
            }

            Lead newLead = Lead.builder()
                    .name(name)
                    .email("sem-email@telegram.bot")
                    .phone(phone)
                    .estimatedValue(value)
                    .status(status)
                    .build();

            TenantContext.setTenantId(session.getCompanyId());
            User user = userRepository.findById(session.getUserId()).orElseThrow();
            TenantContext.setUserEmail(user.getEmail());

            leadService.createLead(newLead);

            sendMessage(session.getChatId(), "✅ Lead " + name + " cadastrado com sucesso no funil!");
            
            session.setConversationState(ChatState.IDLE);
            sessionRepository.save(session);

        } catch (NumberFormatException e) {
            sendMessage(session.getChatId(), "O valor do lead deve ser um número válido. Tente novamente do zero (ex: Quero criar lead).");
            resetSession(session.getChatId());
        } catch (Exception e) {
            log.error("Erro ao cadastrar lead", e);
            sendMessage(session.getChatId(), "Erro ao cadastrar lead. Tente novamente do zero.");
            resetSession(session.getChatId());
        } finally {
            TenantContext.clear();
        }
    }

    private void handleWaitingLeadIndex(TelegramSession session, String text) {
        try {
            int index = Integer.parseInt(text) - 1;
            List<Lead> leads = leadRepository.findAllByCompanyId(session.getCompanyId());
            
            if (index < 0 || index >= leads.size()) {
                sendMessage(session.getChatId(), "Número inválido. Digite um número da lista.");
                return;
            }
            
            Lead selectedLead = leads.get(index);
            session.setSelectedLeadId(selectedLead.getId());
            session.setConversationState(ChatState.WAITING_STATUS);
            sessionRepository.save(session);
            
            sendMessage(session.getChatId(), "Você selecionou: " + selectedLead.getName() + ".\nPara qual estágio deseja mover? (NEW, CONTACTED, QUALIFIED, WON, LOST)");
            
        } catch (NumberFormatException e) {
            sendMessage(session.getChatId(), "Por favor, digite apenas o número do lead.");
        }
    }

    private void handleWaitingStatus(TelegramSession session, String text) {
        try {
            LeadStatus newStatus = LeadStatus.valueOf(text.toUpperCase().trim());
            
            // Injetar contexto de Tenant e Auditoria manualmente
            TenantContext.setTenantId(session.getCompanyId());
            User user = userRepository.findById(session.getUserId()).orElseThrow();
            TenantContext.setUserEmail(user.getEmail());

            leadService.updateLeadStatus(session.getSelectedLeadId(), newStatus);
            
            sendMessage(session.getChatId(), "✅ Status atualizado com sucesso para " + newStatus.name() + "!");
            
            // Resetar
            session.setConversationState(ChatState.IDLE);
            session.setSelectedLeadId(null);
            sessionRepository.save(session);

        } catch (IllegalArgumentException e) {
            sendMessage(session.getChatId(), "Status inválido. Escolha um destes: NEW, CONTACTED, QUALIFIED, WON, LOST.");
        } finally {
            TenantContext.clear();
        }
    }

    private void resetSession(Long chatId) {
        sessionRepository.findById(chatId).ifPresent(session -> {
            session.setConversationState(ChatState.IDLE);
            session.setSelectedLeadId(null);
            sessionRepository.save(session);
        });
    }

    private void sendMessage(Long chatId, String text) {
        SendMessage msg = new SendMessage();
        msg.setChatId(chatId.toString());
        msg.setText(text);
        try {
            execute(msg);
        } catch (TelegramApiException e) {
            log.error("Erro ao enviar mensagem via Telegram", e);
        }
    }

    private void sendWelcomeMessageWithButtons(Long chatId, String text) {
        SendMessage msg = new SendMessage();
        msg.setChatId(chatId.toString());
        msg.setText(text);
        
        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        keyboardMarkup.setResizeKeyboard(true);
        keyboardMarkup.setOneTimeKeyboard(false);
        
        List<KeyboardRow> keyboard = new ArrayList<>();
        KeyboardRow row1 = new KeyboardRow();
        row1.add("/comandos");
        row1.add("Quais são os meus leads?");
        
        KeyboardRow row2 = new KeyboardRow();
        row2.add("Como estão as vendas?");
        row2.add("Quero cadastrar um novo lead");
        
        keyboard.add(row1);
        keyboard.add(row2);
        
        keyboardMarkup.setKeyboard(keyboard);
        msg.setReplyMarkup(keyboardMarkup);
        
        try {
            execute(msg);
        } catch (TelegramApiException e) {
            log.error("Erro ao enviar mensagem com botoes via Telegram", e);
        }
    }
}
