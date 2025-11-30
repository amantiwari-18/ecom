package com.school.ecommerce.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "shipping")
public class Shipping {
    @Id
    private String id;
    private String address;
    private Status status;
    private String orderId;
    private double cost;

    public enum Status {
        PENDING, IN_TRANSIT, DELIVERED
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public double getCost() {
        return cost;
    }

    public void setCost(double cost) {
        this.cost = cost;
    }

    // getters and setters...
}
