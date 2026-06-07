package com.coresync.crm.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class GroqClientService {

    private final WebClient webClient;
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
                "Exemplo: 'Cadastrar o lead Apple com telefone 119999 e valor 500' -> {\"intent\": \"CREATE_LEAD\", \"parameters\": {\"name\": \"Apple\", \"phone\": \"119999\", \"estimatedValue\": 500}}.";

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
}
