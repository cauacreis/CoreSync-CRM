package com.coresync.crm.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class GroqClientService {

    private final WebClient webClient;

    public GroqClientService(@Value("${groq.api.key}") String groqApiKey) {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.groq.com/openai/v1/chat/completions")
                .defaultHeader("Authorization", "Bearer " + groqApiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public record Message(String role, String content) {}
    public record GroqRequest(List<Message> messages, String model, double temperature, Object response_format) {}
    public record GroqChoice(Message message) {}
    public record GroqResponse(List<GroqChoice> choices) {}

    public String classifyIntent(String userInput) {
        String systemPrompt = "Você é um classificador de intenções de um CRM B2B. O usuário quer atualizar um lead. " +
                "Identifique se ele quer listar os leads ou se já informou o nome/status. " +
                "Responda EXATAMENTE em JSON rigoroso com a intenção. " +
                "Exemplo de saída: {\"intent\": \"UPDATE_LEAD\"} ou {\"intent\": \"UNKNOWN\"}";

        GroqRequest request = new GroqRequest(
                List.of(
                        new Message("system", systemPrompt),
                        new Message("user", userInput)
                ),
                "llama3-8b-8192",
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
