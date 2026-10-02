package com.example.order;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OrderHttpTest {
    @LocalServerPort
    private int port;
    private final ObjectMapper json = new ObjectMapper();
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    private HttpResponse<String> post(String body) throws Exception {
        return client.send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + "/api/orders"))
                .timeout(Duration.ofSeconds(10)).header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void createsThenRetrievesOverHttp() throws Exception {
        var created = post("{\"productName\":\"Notebook\",\"quantity\":2}");
        assertEquals(201, created.statusCode());
        JsonNode order = json.readTree(created.body());
        assertEquals(2, order.path("quantity").asInt());
        assertFalse(order.path("orderId").asText().isBlank());
        var fetched = client.send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port
                + "/api/orders/" + order.path("orderId").asText())).timeout(Duration.ofSeconds(10)).GET().build(),
                HttpResponse.BodyHandlers.ofString());
        assertEquals(200, fetched.statusCode());
        assertEquals(order, json.readTree(fetched.body()));
    }

    @Test
    void rejectsInvalidOrMissingQuantityWithStableCode() throws Exception {
        for (String body : new String[]{"{\"productName\":\"Notebook\",\"quantity\":0}",
                "{\"productName\":\"Notebook\",\"quantity\":100}",
                "{\"productName\":\"Notebook\",\"quantity\":1.5}",
                "{\"productName\":\"Notebook\",\"quantity\":\"2\"}",
                "{\"productName\":\"  \",\"quantity\":1}",
                "{\"productName\":\"Notebook\"}", "{broken"}) {
            var result = post(body);
            assertEquals(400, result.statusCode());
            assertEquals("VALIDATION_ERROR", json.readTree(result.body()).path("code").asText());
        }
    }

    @Test
    void missingOrderReturns404NotSuccess() throws Exception {
        var result = client.send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + "/api/orders/missing"))
                .timeout(Duration.ofSeconds(10)).GET().build(), HttpResponse.BodyHandlers.ofString());
        assertEquals(404, result.statusCode());
        assertEquals("ORDER_NOT_FOUND", json.readTree(result.body()).path("code").asText());
    }
}
