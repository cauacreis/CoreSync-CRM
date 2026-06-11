package com.coresync.crm.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class GroqClientService {

    private final WebClient webClient;
    private final WebClient audioWebClient;
    private final String model;

    public GroqClientService(
            @Value("${groq.api.key}") String groqApiKey,
            @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}") String groqApiUrl,
            @Value("${groq.api.model:llama-3.1-8b-instant}") String groqApiModel) {
        this.webClient = WebClient.builder()
                .baseUrl(groqApiUrl)
                .defaultHeader("Authorization", "Bearer " + groqApiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
        this.audioWebClient = WebClient.builder()
                .defaultHeader("Authorization", "Bearer " + groqApiKey)
                .build();
        this.model = groqApiModel;
    }

    public record Message(String role, String content) {}
    public record GroqRequest(List<Message> messages, String model, double temperature, Object response_format) {}
    public record GroqChoice(Message message) {}
    public record GroqResponse(List<GroqChoice> choices) {}

    public String classifyIntent(String userInput) {
        String systemPrompt = "Você é um classificador de intenções e extrator de entidades de um CRM B2B. As intenções são: CREATE_LEAD, UPDATE_LEAD, GET_DASHBOARD, GET_DASHBOARD_LINK, LIST_LEADS ou UNKNOWN. " +
                "Responda EXATAMENTE em JSON rigoroso contendo a chave 'intent'. " +
                "Caso a intenção seja CREATE_LEAD e o usuário forneça os dados na frase, extraia esses dados no objeto 'parameters'. " +
                "Exemplo: 'Cadastrar o lead Apple com telefone 119999, valor 500 e produto Licença Premium' -> {\"intent\": \"CREATE_LEAD\", \"parameters\": {\"name\": \"Apple\", \"phone\": \"119999\", \"estimatedValue\": 500, \"productName\": \"Licença Premium\"}}.";

        GroqRequest request = new GroqRequest(
                List.of(
                        new Message("system", systemPrompt),
                        new Message("user", userInput)
                ),
                this.model,
                0.1,
                Map.of("type", "json_object")
        );

        GroqResponse response = webClient.post()
                .bodyValue(request)
                .retrieve()
                .bodyToMono(GroqResponse.class)
                .block(); // Como será chamado em background pelo bot, o block() simplifica o uso

        if (response != null && response.choices() != null && !response.choices().isEmpty()) {
            return response.choices().get(0).message().content();
        }

        return "{\"intent\": \"UNKNOWN\"}";
    }

    public List<String> generateSmartTags(String description) {
        if (description == null || description.length() < 10) {
            return java.util.Collections.emptyList();
        }

        String systemPrompt = "Você é um assistente de CRM B2B. Leia a descrição da negociação e gere no máximo 2 tags ultra-curtas (máximo 3 palavras cada) resumindo o status, urgência ou contexto. Inclua um emoji em cada tag. Responda estritamente em um JSON Array de strings, sem markdown extra. Exemplo: [\"🔥 Urgente\", \"💰 Pede Desconto\"].";

        GroqRequest request = new GroqRequest(
                List.of(
                        new Message("system", systemPrompt),
                        new Message("user", description)
                ),
                this.model,
                0.2,
                null
        );

        try {
            GroqResponse response = webClient.post()
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(GroqResponse.class)
                    .block();

            if (response != null && response.choices() != null && !response.choices().isEmpty()) {
                String content = response.choices().get(0).message().content();
                content = content.replace("```json", "").replace("```", "").trim();
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                return mapper.readValue(content, new com.fasterxml.jackson.core.type.TypeReference<List<String>>(){});
            }
        } catch (Exception e) {
            // Silently ignore AI or JSON parse errors
        }
        return java.util.Collections.emptyList();
    }

    public com.coresync.crm.dto.LeadRequest mergeLeadData(String existingJson, String userInput) {
        String systemPrompt = "Você é um assistente de CRM. Receba o JSON atual do Lead e a instrução do usuário sobre o que editar. " +
                "Gere um NOVO JSON completo do Lead com as alterações aplicadas. " +
                "Mantenha os campos que não foram mencionados na instrução. " +
                "O formato de saída DEVE ser estritamente um JSON com: name, email, phone, status, estimatedValue (número decimal), description. " +
                "JSON Atual:\n" + existingJson;

        GroqRequest request = new GroqRequest(
                List.of(
                        new Message("system", systemPrompt),
                        new Message("user", userInput)
                ),
                this.model,
                0.2,
                Map.of("type", "json_object")
        );

        try {
            GroqResponse response = webClient.post()
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(GroqResponse.class)
                    .block();

            if (response != null && response.choices() != null && !response.choices().isEmpty()) {
                String jsonContent = response.choices().get(0).message().content();
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                return mapper.readValue(jsonContent, com.coresync.crm.dto.LeadRequest.class);
            }
        } catch (Exception e) {
            System.err.println("Erro ao chamar Groq AI para mesclar dados: " + e.getMessage());
        }
        return null;
    }

    public String transcribeAudio(byte[] audioBytes) {
        org.springframework.http.client.MultipartBodyBuilder builder = new org.springframework.http.client.MultipartBodyBuilder();
        builder.part("file", new org.springframework.core.io.ByteArrayResource(audioBytes) {
            @Override
            public String getFilename() {
                return "audio.ogg";
            }
        });
        builder.part("model", "whisper-large-v3");

        try {
            String responseStr = audioWebClient.post()
                    .uri("https://api.groq.com/openai/v1/audio/transcriptions")
                    .contentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA)
                    .body(org.springframework.web.reactive.function.BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (responseStr != null) {
                com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(responseStr);
                if (node.has("text")) {
                    return node.get("text").asText();
                }
            }
        } catch (Exception e) {
            System.err.println("Erro ao chamar Groq Whisper: " + e.getMessage());
        }
        return null;
    }

    public String cleanChatHistoryForAi(String rawHistory) {
        if (rawHistory == null) return "";
        // Limpa caracteres especiais, mantendo letras, números, acentos e pontuação básica
        return rawHistory.replaceAll("[^\\p{IsAlphabetic}\\p{IsDigit}\\p{Punct}\\s]", " ").trim();
    }

    public com.coresync.crm.ai.review.SalesReviewResponse reviewConversation(String chatHistory) {
        if (chatHistory == null || chatHistory.trim().isEmpty()) {
            return new com.coresync.crm.ai.review.SalesReviewResponse(
                    0, 
                    List.of("Nenhum histórico de conversa encontrado."), 
                    List.of("Inicie uma conversa com o lead para obter análises."), 
                    "N/A"
            );
        }

        String cleanedHistory = cleanChatHistoryForAi(chatHistory);

        String systemPrompt = "Você é um Diretor de Vendas B2B e especialista em psicologia de consumo. " +
                "Analise a seguinte conversa entre o vendedor e o lead. Identifique erros de abordagem, pontos fracos de negociação, " +
                "onde a conversa esfriou e dê notas e dicas práticas de melhoria. Responda ESTRITAMENTE em JSON com a seguinte estrutura: " +
                "{\"score\": 8, \"detectedErrors\": [\"erro 1\", \"erro 2\"], \"improvementSuggestions\": [\"dica 1\"], \"objectionHandlingPerformance\": \"texto\"}.";

        GroqRequest request = new GroqRequest(
                List.of(
                        new Message("system", systemPrompt),
                        new Message("user", cleanedHistory)
                ),
                this.model,
                0.2,
                Map.of("type", "json_object")
        );

        try {
            GroqResponse response = webClient.post()
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(GroqResponse.class)
                    .block();

            if (response != null && response.choices() != null && !response.choices().isEmpty()) {
                String jsonContent = response.choices().get(0).message().content();
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                return mapper.readValue(jsonContent, com.coresync.crm.ai.review.SalesReviewResponse.class);
            }
        } catch (Exception e) {
            System.err.println("Erro ao chamar Groq AI para Sales Review: " + e.getMessage());
        }

        return new com.coresync.crm.ai.review.SalesReviewResponse(
                0, 
                List.of("Erro ao analisar conversa."), 
                List.of(), 
                "Falha na IA."
        );
    }
}
