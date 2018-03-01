package org.mskcc.oncokb.service.util;

import com.github.mongobee.changeset.ChangeSet;
import com.mongodb.Mongo;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.mskcc.oncokb.config.DatabaseConfiguration;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import java.util.ArrayList;
import java.util.List;

import static com.mongodb.client.model.Projections.exclude;

public class MongoUtil {

    private static ApplicationContext context = new AnnotationConfigApplicationContext();
    private static DatabaseConfiguration dbc = (DatabaseConfiguration) context.getBean("databaseConfiguration");
    private static String database = dbc.getDatabaseName();
    private static MongoClient mongoClient = (MongoClient) context.getBean(Mongo.class);
    private static MongoDatabase db = mongoClient.getDatabase(database);

    @ChangeSet(order = "001", id = "getCollection", author = "jingsu")
    public static List<Document> getCollection(String collectionName) {
        List<Document> docList = new ArrayList<>();
        MongoCollection<Document> collection = db.getCollection(collectionName);
        MongoCursor<Document> cursor = collection.find().projection(exclude("_id")).iterator();
        while (cursor.hasNext()) {
            Document doc = cursor.next();
            docList.add(doc);
        }
        return docList;
    }
}
