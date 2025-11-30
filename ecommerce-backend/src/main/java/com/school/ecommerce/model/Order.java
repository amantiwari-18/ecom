package com.school.ecommerce.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    private String userId;
    private String productId;
    private Status status;
    private List<UpdateHistory> historyUpdates = new ArrayList<>();

    public enum Status { PENDING, SHIPPED, DELIVERED, CANCELLED }

    public static class UpdateHistory {
        private String update;
        private Instant timestamp;

        public UpdateHistory() {}
        public UpdateHistory(String update, Instant timestamp) { this.update = update; this.timestamp = timestamp; }

        public String getUpdate() { return update; }
        public void setUpdate(String update) { this.update = update; }
        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    }

    public Order() {}

    public Order(String id, String userId, String productId, Status status) {
        this.id = id; this.userId = userId; this.productId = productId; this.status = status;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public List<UpdateHistory> getHistoryUpdates() { return historyUpdates; }
    public void setHistoryUpdates(List<UpdateHistory> historyUpdates) { this.historyUpdates = historyUpdates; }
}

