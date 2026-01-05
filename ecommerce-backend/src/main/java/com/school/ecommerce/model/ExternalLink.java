package com.school.ecommerce.model;

public class ExternalLink {
    private String websiteName;
    private String url;

    // Constructors
    public ExternalLink() {
    }

    public ExternalLink(String websiteName, String url) {
        this.websiteName = websiteName;
        this.url = url;
    }

    // Getters and Setters
    public String getWebsiteName() {
        return websiteName;
    }

    public void setWebsiteName(String websiteName) {
        this.websiteName = websiteName;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}