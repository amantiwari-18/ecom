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

        String database = (envDb == null || envDb.isBlank())
                ? "ecommerce_db"
                : envDb;

        String uri;
        if (envUri == null || envUri.isBlank()) {
            uri = "mongodb://localhost:27017/" + database;
        } else {
            uri = envUri.trim();
        }

        ConnectionString connectionString = new ConnectionString(uri);

        if (connectionString.getDatabase() == null || connectionString.getDatabase().isBlank()) {
            connectionString = new ConnectionString(uri + "/" + database);
        }

        return new SimpleMongoClientDatabaseFactory(connectionString);
    }

    @Bean
    public MongoTemplate mongoTemplate(MongoDatabaseFactory factory) {
        return new MongoTemplate(factory);
    }
}
