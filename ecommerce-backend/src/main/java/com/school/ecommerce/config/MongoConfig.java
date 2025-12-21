package com.school.ecommerce.config;

import com.mongodb.ConnectionString;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.embedded.EmbeddedMongoAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
public class MongoConfig {

    @Bean
    public MongoDatabaseFactory mongoDatabaseFactory() {
        String envUri = System.getenv("MONGODB_URI");
        String envDb = System.getenv("MONGODB_DB");
        final String defaultDb = (envDb == null || envDb.isBlank()) ? "ecommerce_db" : envDb;

        String uri = (envUri == null || envUri.isBlank())
                ? "mongodb://localhost:27017/" + defaultDb
                : envUri.trim();

        System.out.println("[MongoConfig] MONGODB_URI env: " + (envUri == null ? "null" : "set"));
        System.out.println("[MongoConfig] Using database: " + defaultDb);
        System.out.println("[MongoConfig] Final URI (first 50 chars): " + uri.substring(0, Math.min(50, uri.length())));

        try {
            ConnectionString cs = new ConnectionString(uri);
            if (cs.getDatabase() == null || cs.getDatabase().isBlank()) {
                int q = uri.indexOf("?");
                String before = q == -1 ? uri : uri.substring(0, q);
                String query = q == -1 ? "" : uri.substring(q);
                if (before.endsWith("/")) {
                    before = before.substring(0, before.length() - 1);
                }
                uri = before + "/" + defaultDb + query;
                System.out.println("[MongoConfig] Appended DB name to URI");
            }
        } catch (IllegalArgumentException ex) {
            System.out.println("[MongoConfig] Invalid URI, using localhost: " + ex.getMessage());
            uri = "mongodb://localhost:27017/" + defaultDb;
        }

        return new SimpleMongoClientDatabaseFactory(uri);
    }

    @Bean
    public MongoTemplate mongoTemplate(MongoDatabaseFactory factory) {
        return new MongoTemplate(factory);
    }
}
