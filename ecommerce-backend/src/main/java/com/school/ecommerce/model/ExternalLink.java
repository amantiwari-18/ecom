package com.school.ecommerce.model;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "externallink")
public class ExternalLink {
    private String websiteName;
    private String url;
}
