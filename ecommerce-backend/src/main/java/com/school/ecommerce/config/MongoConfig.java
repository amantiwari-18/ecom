package com.school.ecommerce.config;

import com.mongodb.ConnectionString;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;

@Configuration
public class MongoConfig {

    @Bean
    public MongoDatabaseFactory mongoDatabaseFactory() {
        String envUri = System.getenv("MONGODB_URI");
        String envDb = System.getenv("MONGODB_DB");
        final String defaultDb = (envDb == null || envDb.isBlank())
                ? "ecommerce_db"
                : envDb;

        String uri = (envUri == null || envUri.isBlank())
                ? "mongodb://localhost:27017/" + defaultDb
                : envUri.trim();

        try {
            ConnectionString cs = new ConnectionString(uri);

            if (cs.getDatabase() == null || cs.getDatabase().isBlank()) {
                int q = uri.indexOf("?");
                String base = (q == -1) ? uri : uri.substring(0, q);
                String query = (q == -1) ? "" : uri.substring(q);

                if (base.endsWith("/")) {
                    base = base.substring(0, base.length() - 1);
                }

                uri = base + "/" + defaultDb + query;
                cs = new ConnectionString(uri);
            }

            return new SimpleMongoClientDatabaseFactory(cs);

        } catch (IllegalArgumentException ex) {
            return new SimpleMongoClientDatabaseFactory(
                    new ConnectionString("mongodb://localhost:27017/" + defaultDb));
        }
    }

    @Bean
    public MongoTemplate mongoTemplate(MongoDatabaseFactory factory) {
        return new MongoTemplate(factory);
    }
}
