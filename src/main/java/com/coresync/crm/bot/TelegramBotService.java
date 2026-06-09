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
import com.coresync.crm.document.InvoiceGeneratorService;
import com.coresync.crm.dto.DashboardMetricsResponse;
import com.coresync.crm.repository.AuditLogRepository;
import com.coresync.crm.model.AuditLog;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.methods.send.SendDocument;
import org.telegram.telegrambots.meta.api.objects.InputFile;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.api.methods.updatingmessages.EditMessageText;
import org.telegram.telegrambots.meta.api.methods.AnswerCallbackQuery;
import org.telegram.telegrambots.meta.api.objects.CallbackQuery;

import org.springframework.context.event.EventListener;
import com.coresync.crm.event.LeadStatusChangedEvent;

import java.io.ByteArrayInputStream;
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
    private final InvoiceGeneratorService invoiceGeneratorService;
    private final AuditLogRepository auditLogRepository;
    private final com.coresync.crm.repository.ProductRepository productRepository;
    private final com.coresync.crm.service.ProductService productService;

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
            ObjectMapper objectMapper,
            InvoiceGeneratorService invoiceGeneratorService,
            AuditLogRepository auditLogRepository,
            com.coresync.crm.repository.ProductRepository productRepository,
            com.coresync.crm.service.ProductService productService) {
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
        this.invoiceGeneratorService = invoiceGeneratorService;
        this.auditLogRepository = auditLogRepository;
        this.productRepository = productRepository;
        this.productService = productService;
    }

    @Override
    public String getBotUsername() {
        return botUsername;
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (update.hasCallbackQuery()) {
            handleCallbackQuery(update.getCallbackQuery());
            return;
        }

        if (!update.hasMessage()) {
            return;
        }

        Long chatId = update.getMessage().getChatId();
        String text = "";

        if (update.getMessage().hasVoice()) {
            try {
                org.telegram.telegrambots.meta.api.objects.Voice voice = update.getMessage().getVoice();
                String fileId = voice.getFileId();
                org.telegram.telegrambots.meta.api.methods.GetFile getFile = new org.telegram.telegrambots.meta.api.methods.GetFile(fileId);
                org.telegram.telegrambots.meta.api.objects.File file = execute(getFile);
                
                String fileUrl = "https://api.telegram.org/file/bot" + getBotToken() + "/" + file.getFilePath();
                
                sendMessage(chatId, "⏳ Processando áudio via IA Whisper...");
                
                byte[] audioBytes = new org.springframework.web.client.RestTemplate().getForObject(fileUrl, byte[].class);
                
                String transcribedText = groqClientService.transcribeAudio(audioBytes);
                if (transcribedText == null || transcribedText.trim().isEmpty()) {
                    sendMessage(chatId, "⚠️ Desculpe, o áudio estava inaudível ou houve um erro de transcrição. Pode repetir?");
                    return;
                }
                
                text = transcribedText;
                sendMessage(chatId, "🎙️ Áudio compreendido: '" + text + "'. Processando comando...");
            } catch (Exception e) {
                log.error("Erro ao processar áudio", e);
                sendMessage(chatId, "❌ Erro ao processar o áudio.");
                return;
            }
        } else if (update.getMessage().hasText()) {
            text = update.getMessage().getText().trim();
        } else {
            return;
        }

        try {
            if (text.startsWith("/start")) {
                TelegramSession session = sessionRepository.findById(chatId).orElse(null);
                if (session != null && session.getUserId() != null) {
                    sendWelcomeMessageWithInlineButtons(chatId, "👋 Bem-vindo de volta! Escolha uma opção:");
                    return;
                }
                sendMessage(chatId, "👋 Olá! Bem-vindo(a) ao CoreSync Assistant!\n\n" +
                                    "Para começar a usar a IA nas suas vendas, você precisa se autenticar.\n" +
                                    "Por favor, use o comando:\n" +
                                    "`/login <seu-email>`");
                return;
            }
            if (text.startsWith("/login")) {
                handleLogin(chatId, text);
                return;
            }
            if (text.startsWith("/comandos")) {
                handleComandos(chatId);
                return;
            }

            TelegramSession session = sessionRepository.findById(chatId).orElse(null);
            
            if (session != null && session.getConversationState() == ChatState.WAITING_PASSWORD) {
                handleWaitingPassword(session, text);
                return;
            }

            if (session == null || session.getUserId() == null) {
                sendMessage(chatId, "⚠️ Você não está autenticado. Use `/login <email>`");
                return;
            }

            // Máquina de Estados
            switch (session.getConversationState()) {
                case IDLE -> handleIdleState(session, text);
                case WAITING_LEAD_INDEX -> handleWaitingLeadIndex(session, text);
                case WAITING_STATUS -> handleWaitingStatus(session, text);
                case WAITING_LEAD_DATA -> handleWaitingLeadData(session, text);
                default -> sendMessage(chatId, "Estado de conversa não reconhecido.");
            }

        } catch (Exception e) {
            log.error("Erro no processamento do bot", e);
            sendMessage(chatId, "❌ Ocorreu um erro interno. A sessão foi resetada.");
            resetSession(chatId);
        }
    }

    private void handleComandos(Long chatId) {
        String msg = "🤖 *Comandos do CoreSync Bot:*\n" +
                "/login <email> - Fazer login na conta\n" +
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
        
        if (parts.length == 2) {
            String email = parts[1];
            TelegramSession session = sessionRepository.findById(chatId).orElse(new TelegramSession());
            session.setChatId(chatId);
            session.setPendingEmail(email);
            session.setConversationState(ChatState.WAITING_PASSWORD);
            sessionRepository.save(session);
            sendMessage(chatId, "🔒 Digite sua senha para o e-mail `" + email + "`:");
            return;
        }

        if (parts.length == 3) {
            String email = parts[1];
            String password = parts[2];
            authenticateUser(chatId, email, password);
            return;
        }

        sendMessage(chatId, "⚠️ Formato inválido. Use: `/login <email>`");
    }

    private void handleWaitingPassword(TelegramSession session, String text) {
        String password = text;
        String email = session.getPendingEmail();
        
        // Clear the password state
        session.setConversationState(ChatState.IDLE);
        session.setPendingEmail(null);
        sessionRepository.save(session);
        
        authenticateUser(session.getChatId(), email, password);
    }

    private void authenticateUser(Long chatId, String email, String password) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            sendMessage(chatId, "❌ Credenciais inválidas.");
            return;
        }

        TelegramSession session = sessionRepository.findById(chatId).orElse(new TelegramSession());
        session.setChatId(chatId);
        session.setUserId(user.getId());
        session.setCompanyId(user.getCompany().getId());
        session.setConversationState(ChatState.IDLE);
        session.setPendingEmail(null);
        sessionRepository.save(session);

        sendWelcomeMessageWithInlineButtons(chatId, "✅ Login realizado com sucesso! Bem-vindo(a) ao CoreSync Bot! 🚀\n\nEscolha uma das opções no menu abaixo ou simplesmente digite o que deseja fazer:");
    }

    private void handleIdleState(TelegramSession session, String text) throws Exception {
        sendMessage(session.getChatId(), "🧠 Analisando sua intenção com IA...");
        String jsonIntent = groqClientService.classifyIntent(text);
        
        JsonNode node = objectMapper.readTree(jsonIntent);
        String intent = node.has("intent") ? node.get("intent").asText() : "UNKNOWN";

        if ("CREATE_LEAD".equals(intent) || intent.equals("CREATE")) {
            if (node.has("parameters") && node.get("parameters").has("name") && node.get("parameters").has("estimatedValue")) {
                JsonNode params = node.get("parameters");
                try {
                    String name = params.get("name").asText();
                    String phone = params.has("phone") ? params.get("phone").asText() : null;
                    java.math.BigDecimal value = new java.math.BigDecimal(params.get("estimatedValue").asText());
                    
                    Lead newLead = Lead.builder()
                            .name(name)
                            .email("sem-email@telegram.bot")
                            .phone(phone)
                            .estimatedValue(value)
                            .status(LeadStatus.NEW)
                            .build();

                    TenantContext.setTenantId(session.getCompanyId());
                    User user = userRepository.findById(session.getUserId()).orElseThrow();
                    TenantContext.setUserEmail(user.getEmail());

                    if (params.has("productName")) {
                        String productName = params.get("productName").asText();
                        List<com.coresync.crm.model.Product> products = productRepository.findAllByCompanyId(session.getCompanyId());
                        products.stream()
                                .filter(p -> p.getName().equalsIgnoreCase(productName) && p.isActive())
                                .findFirst()
                                .ifPresent(newLead::setProduct);
                    }

                    leadService.createLead(newLead);

                    String productMsg = newLead.getProduct() != null ? " (Produto: " + newLead.getProduct().getName() + ")" : "";
                    sendMessage(session.getChatId(), "🤖🪄 *Magia NLP!* Detectei os dados automaticamente:\n" +
                                                     "✅ Lead *" + name + "* (Valor: $" + value + ")" + productMsg + " cadastrado com sucesso direto no funil!");
                    return;
                } catch (Exception e) {
                    log.error("Erro ao extrair entidades via Groq", e);
                } finally {
                    TenantContext.clear();
                }
            }
            doAskForNewLead(session);
        } else if ("UPDATE_LEAD".equals(intent) || intent.equals("UPDATE")) {
            List<Lead> leads = leadRepository.findAllByCompanyId(session.getCompanyId());
            if (leads.isEmpty()) {
                sendMessage(session.getChatId(), "Sua empresa ainda não possui leads.");
                return;
            }

            InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
            List<List<InlineKeyboardButton>> rows = new ArrayList<>();
            
            for (Lead lead : leads) {
                InlineKeyboardButton btn = new InlineKeyboardButton();
                btn.setText(lead.getName() + " (" + lead.getStatus() + ")");
                btn.setCallbackData("UPDATE_LEAD:" + lead.getId());
                rows.add(List.of(btn));
            }
            markup.setKeyboard(rows);

            sendMessageWithInlineKeyboard(session.getChatId(), "Selecione o lead que deseja atualizar:", markup);
        } else if ("GET_DASHBOARD".equals(intent)) {
            doGetDashboard(session);
        } else if ("GET_DASHBOARD_LINK".equals(intent)) {
            sendMessage(session.getChatId(), "🌐 Acesse o dashboard completo em: https://coresync.com/dashboard");
        } else if ("LIST_LEADS".equals(intent)) {
            doListLeads(session);
        } else {
            sendMessage(session.getChatId(), "Não entendi sua intenção. Atualmente suporto: listar leads, cadastrar leads, atualizar leads, ver relatório financeiro e enviar o link do dashboard.");
        }
    }

    private void doListLeads(TelegramSession session) {
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
            
            String followUpMsg = "🤖 *O que você deseja fazer a seguir?*";
            sendWelcomeMessageWithInlineButtons(session.getChatId(), followUpMsg);
        }
    }

    private void doGetDashboard(TelegramSession session) {
        try {
            TenantContext.setTenantId(session.getCompanyId());
            DashboardMetricsResponse metrics = dashboardService.getMetrics();
            String dashboardText = String.format(
                    "📊 *Dashboard CoreSync*\n\n" +
                    "👥 Total de Leads: %d\n" +
                    "🏆 Leads Ganho: %d\n" +
                    "📈 Taxa de Conversão: %.2f%%\n" +
                    "💰 Valor do Pipeline: $%.2f\n" +
                    "💵 Receita Ganha: $%.2f",
                    metrics.totalLeads(), metrics.totalWonLeads(), metrics.conversionRate(),
                    metrics.totalPipelineValue(), metrics.totalRevenueWon());
            sendMessage(session.getChatId(), dashboardText);
            
            try {
                List<AuditLog> auditLogs = auditLogRepository.findAllByCompanyIdOrderByTimestampDesc(session.getCompanyId());
                byte[] pdfBytes = invoiceGeneratorService.generateDashboardReport(metrics, auditLogs, null);
                SendDocument sendDocument = new SendDocument();
                sendDocument.setChatId(session.getChatId().toString());
                sendDocument.setDocument(new InputFile(new ByteArrayInputStream(pdfBytes), "DashboardReport.pdf"));
                sendDocument.setCaption("📄 Aqui está o seu Relatório de Insights Executivos em PDF.");
                execute(sendDocument);
            } catch (Exception e) {
                log.error("Erro ao gerar PDF do Dashboard", e);
            }
        } finally {
            TenantContext.clear();
        }
    }

    private void handleReviewLeadCallback(Long chatId, String leadIdStr) {
        TelegramSession session = sessionRepository.findById(chatId).orElse(null);
        if (session == null || session.getCompanyId() == null) return;

        if (session.getConversationState() == ChatState.ANALYZING_LEAD) {
            sendMessage(chatId, "⏳ Já estou analisando um lead para você. Aguarde um instante.");
            return;
        }

        session.setConversationState(ChatState.ANALYZING_LEAD);
        sessionRepository.save(session);

        UUID companyId = session.getCompanyId();
        
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                TenantContext.setTenantId(companyId);
                UUID leadId = UUID.fromString(leadIdStr);
                Lead lead = leadRepository.findByIdAndCompanyId(leadId, companyId).orElse(null);

                if (lead == null) {
                    sendMessage(chatId, "⚠️ Lead não encontrado.");
                    return;
                }
                
                if (lead.getChatHistory() == null || lead.getChatHistory().trim().isEmpty()) {
                    sendMessage(chatId, "⚠️ Nenhuma conversa registrada para este lead ainda. Impossível gerar análise.");
                    return;
                }

                sendMessage(chatId, "⏳ A IA Groq está analisando o histórico do lead " + lead.getName() + "...\nIsso pode levar alguns segundos.");

                com.coresync.crm.ai.review.SalesReviewResponse review = groqClientService.reviewConversation(lead.getChatHistory());

                String msg = String.format(
                        "🤖 *AI Sales Coach - Análise de Desempenho*\n\n" +
                        "⭐ *Nota:* %d/10\n\n" +
                        "❌ *Erros Detectados:*\n%s\n\n" +
                        "💡 *Sugestões de Melhoria:*\n%s\n\n" +
                        "🛡️ *Tratamento de Objeções:*\n%s",
                        review.score(),
                        String.join("\n- ", review.detectedErrors().isEmpty() ? List.of("Nenhum") : review.detectedErrors()),
                        String.join("\n- ", review.improvementSuggestions().isEmpty() ? List.of("Nenhum") : review.improvementSuggestions()),
                        review.objectionHandlingPerformance()
                );

                sendMessage(chatId, msg);
                
                // Gerar o PDF de Dashboard contextualizado
                try {
                    DashboardMetricsResponse metrics = dashboardService.getMetrics();
                    List<AuditLog> auditLogs = auditLogRepository.findAllByCompanyIdOrderByTimestampDesc(companyId);
                    byte[] pdfBytes = invoiceGeneratorService.generateDashboardReport(metrics, auditLogs, review.objectionHandlingPerformance());
                    SendDocument sendDocument = new SendDocument();
                    sendDocument.setChatId(chatId.toString());
                    sendDocument.setDocument(new InputFile(new ByteArrayInputStream(pdfBytes), "Dashboard_AI_Insights_" + lead.getName().replace(" ", "_") + ".pdf"));
                    sendDocument.setCaption("📄 Anexado: Dashboard Executivo enriquecido com os Insights do AI Coach para este lead.");
                    execute(sendDocument);
                } catch (Exception e) {
                    log.error("Erro ao gerar PDF do Dashboard com AI Insights", e);
                }
            } catch (Exception e) {
                log.error("Erro ao analisar lead no Telegram", e);
                sendMessage(chatId, "⚠️ Ocorreu um erro ao chamar a IA.");
            } finally {
                TenantContext.clear();
                TelegramSession currentSession = sessionRepository.findById(chatId).orElse(null);
                if (currentSession != null) {
                    currentSession.setConversationState(ChatState.IDLE);
                    sessionRepository.save(currentSession);
                }
            }
        });
    }

    private void doAskForNewLead(TelegramSession session) {
        List<com.coresync.crm.model.Product> products = productRepository.findAllByCompanyId(session.getCompanyId());
        StringBuilder productsList = new StringBuilder();
        if (products.isEmpty()) {
            productsList.append("Nenhum produto cadastrado.\n");
        } else {
            for (com.coresync.crm.model.Product p : products) {
                if (p.isActive()) {
                    productsList.append("🔹 *").append(p.getName()).append("*\n");
                }
            }
        }

        String msg = "📝 *Cadastro Manual de Lead*\n\n" +
                     "Para cadastrar um lead de forma guiada, digite os dados separados por vírgula no seguinte formato:\n\n" +
                     "👉 `Nome, Telefone, Valor, Status, Produto, Descrição`\n\n" +
                     "📌 *Status Disponíveis:*\n" +
                     "🔸 *NEW* (Novo Lead)\n" +
                     "🔸 *CONTACTED* (Contatado)\n" +
                     "🔸 *QUALIFIED* (Qualificado)\n" +
                     "🔸 *WON* (Venda Ganha)\n" +
                     "🔸 *UNPAID* (Não Pago)\n" +
                     "🔸 *LOST* (Venda Perdida)\n\n" +
                     "📦 *Produtos Disponíveis na Empresa:*\n" +
                     productsList.toString() + "\n" +
                     "💡 *Exemplo:* `Empresa Alpha, 11999999999, 15000, NEW, Licença Premium, Cliente interessado em fechar logo`\n\n" +
                     "Por favor, digite os dados do lead agora:";
        sendMessage(session.getChatId(), msg);
        session.setConversationState(ChatState.WAITING_LEAD_DATA);
        sessionRepository.save(session);
    }

    private void handleWaitingLeadData(TelegramSession session, String text) {
        try {
            String[] parts = text.split(",");
            if (parts.length < 3) {
                sendMessage(session.getChatId(), "⚠️ *Formato incorreto.*\nDigite: `Nome, Telefone, Valor, [Status], [Produto], [Descrição]`.\n(Ex: `Empresa X, 1199999999, 10000, NEW, Consultoria, Nota sobre o cliente`)");
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
                    sendMessage(session.getChatId(), "⚠️ Status '" + parts[3].trim() + "' inválido. Usando status padrão (*NEW*).");
                }
            }

            Lead newLead = Lead.builder()
                    .name(name)
                    .email("sem-email@telegram.bot")
                    .phone(phone)
                    .estimatedValue(value)
                    .status(status)
                    .build();

            if (parts.length >= 5) {
                String productName = parts[4].trim();
                List<com.coresync.crm.model.Product> products = productRepository.findAllByCompanyId(session.getCompanyId());
                products.stream()
                        .filter(p -> p.getName().equalsIgnoreCase(productName) && p.isActive())
                        .findFirst()
                        .ifPresent(newLead::setProduct);
                if (newLead.getProduct() == null) {
                    sendMessage(session.getChatId(), "⚠️ Produto '" + productName + "' não encontrado ou inativo. Lead será cadastrado sem produto.");
                }
            }

            if (parts.length >= 6) {
                newLead.setDescription(parts[5].trim());
            }

            TenantContext.setTenantId(session.getCompanyId());
            User user = userRepository.findById(session.getUserId()).orElseThrow();
            TenantContext.setUserEmail(user.getEmail());

            leadService.createLead(newLead);

            String productMsg = newLead.getProduct() != null ? " (Produto: " + newLead.getProduct().getName() + ")" : "";
            sendMessage(session.getChatId(), "✅ Lead *" + name + "*" + productMsg + " cadastrado com sucesso no funil!");
            
            session.setConversationState(ChatState.IDLE);
            sessionRepository.save(session);

        } catch (NumberFormatException e) {
            sendMessage(session.getChatId(), "⚠️ O valor do lead deve ser um número válido. Tente novamente do zero (ex: `Quero criar lead`).");
            resetSession(session.getChatId());
        } catch (Exception e) {
            log.error("Erro ao cadastrar lead", e);
            sendMessage(session.getChatId(), "❌ Erro ao cadastrar lead. Tente novamente do zero.");
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
                sendMessage(session.getChatId(), "⚠️ Número inválido. Digite um número da lista.");
                return;
            }
            
            Lead selectedLead = leads.get(index);
            session.setSelectedLeadId(selectedLead.getId());
            session.setConversationState(ChatState.WAITING_STATUS);
            sessionRepository.save(session);
            
            sendMessage(session.getChatId(), "Você selecionou: *" + selectedLead.getName() + "*.\nPara qual estágio deseja mover? (*NEW, CONTACTED, QUALIFIED, WON, UNPAID, LOST*)");
            
        } catch (NumberFormatException e) {
            sendMessage(session.getChatId(), "⚠️ Por favor, digite apenas o número do lead.");
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
            
            sendMessage(session.getChatId(), "✅ Status atualizado com sucesso para *" + newStatus.name() + "*!");
            
            // Resetar
            session.setConversationState(ChatState.IDLE);
            session.setSelectedLeadId(null);
            sessionRepository.save(session);

        } catch (IllegalArgumentException e) {
            sendMessage(session.getChatId(), "⚠️ Status inválido. Escolha um destes: *NEW, CONTACTED, QUALIFIED, WON, UNPAID, LOST*.");
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
        msg.setParseMode("Markdown");
        try {
            execute(msg);
        } catch (TelegramApiException e) {
            log.error("Erro ao enviar mensagem via Telegram", e);
        }
    }

    private void handleCallbackQuery(CallbackQuery callbackQuery) {
        String data = callbackQuery.getData();
        Long chatId = callbackQuery.getMessage().getChatId();
        Integer messageId = callbackQuery.getMessage().getMessageId();
        
        try {
            TelegramSession session = sessionRepository.findById(chatId).orElse(null);
            if (session == null) {
                answerCallbackQuery(callbackQuery.getId(), "Sessão expirada. Faça login novamente.", true);
                return;
            }

            TenantContext.setTenantId(session.getCompanyId());
            User user = userRepository.findById(session.getUserId()).orElseThrow();
            TenantContext.setUserEmail(user.getEmail());

            if (data.startsWith("UPDATE_LEAD:")) {
                String leadIdStr = data.split(":")[1];
                UUID leadId = UUID.fromString(leadIdStr);
                Lead lead = leadRepository.findByIdAndCompanyId(leadId, session.getCompanyId()).orElse(null);
                
                if (lead == null) {
                    answerCallbackQuery(callbackQuery.getId(), "Lead não encontrado.", true);
                    return;
                }

                editMessageWithStatusButtons(chatId, messageId, lead);
                answerCallbackQuery(callbackQuery.getId(), "Lead " + lead.getName() + " selecionado.", false);

            } else if (data.startsWith("SET_STATUS:")) {
                String[] parts = data.split(":");
                UUID leadId = UUID.fromString(parts[1]);
                LeadStatus newStatus = LeadStatus.valueOf(parts[2]);
                
                leadService.updateLeadStatus(leadId, newStatus);
                
                Lead lead = leadRepository.findByIdAndCompanyId(leadId, session.getCompanyId()).orElseThrow();
                editMessageText(chatId, messageId, "✅ Status do lead *" + lead.getName() + "* atualizado para *" + newStatus.name() + "*!");
                answerCallbackQuery(callbackQuery.getId(), "Status atualizado!", false);
            } else if (data.equals("CMD_LIST_LEADS")) {
                doListLeads(session);
                answerCallbackQuery(callbackQuery.getId(), "Lista carregada!", false);
            } else if (data.equals("CMD_DASHBOARD")) {
                doGetDashboard(session);
                answerCallbackQuery(callbackQuery.getId(), "Dashboard carregado!", false);
            } else if (data.equals("CMD_NEW_LEAD")) {
                doAskForNewLead(session);
                answerCallbackQuery(callbackQuery.getId(), "Pronto para cadastrar!", false);
            } else if (data.equals("CMD_HELP")) {
                handleComandos(session.getChatId());
                answerCallbackQuery(callbackQuery.getId(), "Menu exibido!", false);
            } else if (data.equals("CMD_MANAGE_PRODUCTS")) {
                doManageProducts(session, chatId, messageId);
                answerCallbackQuery(callbackQuery.getId(), "Carregando produtos...", false);
            } else if (data.startsWith("TOGGLE_PRODUCT:")) {
                String productIdStr = data.split(":")[1];
                UUID productId = UUID.fromString(productIdStr);
                com.coresync.crm.model.Product p = productRepository.findByIdAndCompanyId(productId, session.getCompanyId()).orElse(null);
                if (p != null) {
                    p.setActive(!p.isActive());
                    productService.updateProduct(productId, p);
                    doManageProducts(session, chatId, messageId);
                    answerCallbackQuery(callbackQuery.getId(), "Status do produto invertido!", false);
                } else {
                    answerCallbackQuery(callbackQuery.getId(), "Produto não encontrado.", true);
                }
            } else if (data.startsWith("REVIEW_LEAD:")) {
                String leadIdStr = data.split(":")[1];
                handleReviewLeadCallback(chatId, leadIdStr);
                answerCallbackQuery(callbackQuery.getId(), "Análise em andamento...", false);
            }
        } catch (Exception e) {
            log.error("Erro ao processar callback query", e);
            answerCallbackQuery(callbackQuery.getId(), "Ocorreu um erro ao processar a ação.", true);
        } finally {
            TenantContext.clear();
        }
    }

    private void answerCallbackQuery(String callbackQueryId, String text, boolean showAlert) {
        AnswerCallbackQuery answer = new AnswerCallbackQuery();
        answer.setCallbackQueryId(callbackQueryId);
        answer.setText(text);
        answer.setShowAlert(showAlert);
        try {
            execute(answer);
        } catch (TelegramApiException e) {
            log.error("Erro ao responder callback query", e);
        }
    }

    private void editMessageText(Long chatId, Integer messageId, String text) {
        EditMessageText edit = new EditMessageText();
        edit.setChatId(chatId.toString());
        edit.setMessageId(messageId);
        edit.setText(text);
        edit.setParseMode("Markdown");
        try {
            execute(edit);
        } catch (TelegramApiException e) {
            log.error("Erro ao editar mensagem", e);
        }
    }

    private void editMessageWithStatusButtons(Long chatId, Integer messageId, Lead lead) {
        EditMessageText edit = new EditMessageText();
        edit.setChatId(chatId.toString());
        edit.setMessageId(messageId);
        edit.setText("Lead selecionado: *" + lead.getName() + "*\nStatus atual: " + lead.getStatus() + "\n\nSelecione o novo status:");
        edit.setParseMode("Markdown");

        InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
        List<List<InlineKeyboardButton>> rows = new ArrayList<>();
        
        List<InlineKeyboardButton> row1 = new ArrayList<>();
        for (LeadStatus status : LeadStatus.values()) {
            InlineKeyboardButton btn = new InlineKeyboardButton();
            btn.setText(status.name());
            btn.setCallbackData("SET_STATUS:" + lead.getId() + ":" + status.name());
            row1.add(btn);
            
            if (row1.size() == 2) {
                rows.add(row1);
                row1 = new ArrayList<>();
            }
        }
        if (!row1.isEmpty()) {
            rows.add(row1);
        }

        InlineKeyboardButton reviewButton = new InlineKeyboardButton();
        reviewButton.setText("🔍 Analisar Desempenho");
        reviewButton.setCallbackData("REVIEW_LEAD:" + lead.getId());
        rows.add(List.of(reviewButton));
        
        markup.setKeyboard(rows);
        edit.setReplyMarkup(markup);

        try {
            execute(edit);
        } catch (TelegramApiException e) {
            log.error("Erro ao editar mensagem com botões de status", e);
        }
    }

    private void sendMessageWithInlineKeyboard(Long chatId, String text, InlineKeyboardMarkup markup) {
        SendMessage msg = new SendMessage();
        msg.setChatId(chatId.toString());
        msg.setText(text);
        msg.setReplyMarkup(markup);
        msg.setParseMode("Markdown");
        try {
            execute(msg);
        } catch (TelegramApiException e) {
            log.error("Erro ao enviar mensagem com inline keyboard", e);
        }
    }

    private void sendWelcomeMessageWithInlineButtons(Long chatId, String text) {
        SendMessage msg = new SendMessage();
        msg.setChatId(chatId.toString());
        msg.setText(text);
        
        InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
        List<List<InlineKeyboardButton>> rows = new ArrayList<>();
        
        InlineKeyboardButton btn1 = new InlineKeyboardButton();
        btn1.setText("📋 Meus Leads");
        btn1.setCallbackData("CMD_LIST_LEADS");
        rows.add(List.of(btn1));
        
        InlineKeyboardButton btn2 = new InlineKeyboardButton();
        btn2.setText("💰 Ver Dashboard");
        btn2.setCallbackData("CMD_DASHBOARD");
        rows.add(List.of(btn2));
        
        InlineKeyboardButton btn3 = new InlineKeyboardButton();
        btn3.setText("➕ Cadastrar Lead");
        btn3.setCallbackData("CMD_NEW_LEAD");
        rows.add(List.of(btn3));
        
        InlineKeyboardButton btn4 = new InlineKeyboardButton();
        btn4.setText("⚙️ Menu de Comandos");
        btn4.setCallbackData("CMD_HELP");
        rows.add(List.of(btn4));
        
        InlineKeyboardButton btn5 = new InlineKeyboardButton();
        btn5.setText("📦 Gerenciar Produtos");
        btn5.setCallbackData("CMD_MANAGE_PRODUCTS");
        rows.add(List.of(btn5));
        
        markup.setKeyboard(rows);
        msg.setReplyMarkup(markup);
        
        try {
            execute(msg);
        } catch (TelegramApiException e) {
            log.error("Erro ao enviar mensagem de boas vindas com botoes inline", e);
        }
    }

    @EventListener
    public void onLeadStatusChanged(LeadStatusChangedEvent event) {
        Iterable<TelegramSession> allSessions = sessionRepository.findAll();
        for (TelegramSession session : allSessions) {
            if (session.getCompanyId() != null && session.getCompanyId().equals(event.getCompanyId())) {
                String message = String.format("🔔 *Notificação do Sistema:*\nO lead *%s* foi movido da fase %s para a fase *%s* no painel web!",
                        event.getLeadName(), event.getOldStatus().name(), event.getNewStatus().name());
                sendMessage(session.getChatId(), message);
                
                if (event.getNewStatus() == LeadStatus.WON) {
                    try {
                        Lead lead = leadRepository.findById(event.getLeadId()).orElse(null);
                        if (lead != null) {
                            byte[] pdfBytes = invoiceGeneratorService.generateContractPdf(lead);
                            SendDocument sendDocument = new SendDocument();
                            sendDocument.setChatId(session.getChatId().toString());
                            sendDocument.setDocument(new InputFile(new ByteArrayInputStream(pdfBytes), "Contrato_" + lead.getName().replace(" ", "_") + ".pdf"));
                            sendDocument.setCaption("🎉 Venda Fechada! Aqui está o rascunho do contrato do lead.");
                            execute(sendDocument);
                        }
                    } catch (Exception e) {
                        log.error("Erro ao gerar ou enviar PDF do contrato para o Telegram", e);
                        sendMessage(session.getChatId(), "⚠️ A venda foi registrada, mas ocorreu um erro ao gerar o PDF do contrato.");
                    }
                }
            }
        }
    }

    private void doManageProducts(TelegramSession session, Long chatId, Integer messageId) {
        List<com.coresync.crm.model.Product> products = productRepository.findAllByCompanyId(session.getCompanyId());
        if (products.isEmpty()) {
            String emptyMsg = "📦 Sua empresa ainda não possui produtos cadastrados no catálogo.";
            if (messageId != null) {
                editMessageText(chatId, messageId, emptyMsg);
            } else {
                sendMessage(chatId, emptyMsg);
            }
            return;
        }

        InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
        List<List<InlineKeyboardButton>> rows = new ArrayList<>();
        
        for (com.coresync.crm.model.Product p : products) {
            InlineKeyboardButton btn = new InlineKeyboardButton();
            String status = p.isActive() ? "🟢 Ativo" : "🔴 Inativo";
            btn.setText("[" + status + "] " + p.getName());
            btn.setCallbackData("TOGGLE_PRODUCT:" + p.getId());
            rows.add(List.of(btn));
        }
        
        InlineKeyboardButton btnBack = new InlineKeyboardButton();
        btnBack.setText("⬅️ Voltar");
        btnBack.setCallbackData("CMD_HELP");
        rows.add(List.of(btnBack));

        markup.setKeyboard(rows);

        String text = "📦 *Gerenciamento de Produtos*\n\nClique em um produto abaixo para ativar ou desativá-lo:";
        
        if (messageId != null) {
            EditMessageText edit = new EditMessageText();
            edit.setChatId(chatId.toString());
            edit.setMessageId(messageId);
            edit.setText(text);
            edit.setReplyMarkup(markup);
            edit.setParseMode("Markdown");
            try {
                execute(edit);
            } catch (TelegramApiException e) {
                log.error("Erro ao editar mensagem de produtos", e);
            }
        } else {
            sendMessageWithInlineKeyboard(chatId, text, markup);
        }
    }
}
