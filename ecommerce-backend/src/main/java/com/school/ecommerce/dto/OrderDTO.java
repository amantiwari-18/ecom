package com.school.ecommerce.dto;

import java.time.Instant;
import java.util.List;

public class OrderDTO {
    private String id;
    private String userId;
    private String productId;
    private String status;
    private List<UpdateDTO> historyUpdates;

    public static class UpdateDTO {
        private String update;
        private Instant timestamp;

        public String getUpdate() { return update; }
        public void setUpdate(String update) { this.update = update; }
        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<UpdateDTO> getHistoryUpdates() { return historyUpdates; }
    public void setHistoryUpdates(List<UpdateDTO> historyUpdates) { this.historyUpdates = historyUpdates; }
}

