package org.mskcc.oncokb.service.util;

import com.github.mongobee.changeset.ChangeSet;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import java.util.ArrayList;
import java.util.List;
import static com.mongodb.client.model.Projections.exclude;

public class MongoUtil {

    @ChangeSet(order = "001", id = "getCollection", author = "jingsu")
    public static List<Document> getCollection(MongoDatabase mongoDatabase, String collectionName) {
        List<Document> docList = new ArrayList<>();
        MongoCollection<Document> collection = mongoDatabase.getCollection(collectionName);
        MongoCursor<Document> cursor = collection.find().projection(exclude("_id")).iterator();
        while (cursor.hasNext()) {
            Document doc = cursor.next();
            docList.add(doc);
        }
        return docList;
    }

    @ChangeSet(order = "002", id = "createCollection", author = "jingsu")
    public static Boolean createCollection(MongoDatabase mongoDatabase, String collectionName, List<Document> docs) {
        MongoCollection collection = mongoDatabase.getCollection(collectionName);
        collection.insertMany(docs);
        long count =  collection.count();
        return count > 0 ? true: false;
    }

    @ChangeSet(order = "003", id = "dropCollection", author = "jingsu")
    public static Boolean dropCollection(MongoDatabase mongoDatabase, String collectionName) {
        Boolean collectionExists = mongoDatabase.listCollectionNames()
            .into(new ArrayList<String>()).contains(collectionName);
        if (collectionExists) {
            MongoCollection collection = mongoDatabase.getCollection(collectionName);
            collection.drop();

            Boolean isDropped = !(mongoDatabase.listCollectionNames()
                .into(new ArrayList<String>()).contains(collectionName));
            return isDropped;
        } else {
            return true;
        }
    }

    @ChangeSet(order = "004", id = "deleteMany", author = "jingsu")
    public static Boolean deleteMany(MongoDatabase mongoDatabase, String collectionName, String id) {
        Boolean collectionExists = mongoDatabase.listCollectionNames()
            .into(new ArrayList<String>()).contains(collectionName);
        if (collectionExists) {
            MongoCollection collection = mongoDatabase.getCollection(collectionName);
            collection.deleteMany(new Document("nct_id", id));
            MongoCursor<Document> cursor = collection.find(new Document("nct_id", id)).iterator();
            return !cursor.hasNext();
        } else {
            return true;
        }
    }

    @ChangeSet(order = "005", id = "findByOneField", author = "jingsu")
    public static List<Document> findByOneField(MongoDatabase mongoDatabase, String collectionName, String fieldName, String id) {
        List<Document> docList = new ArrayList<>();
        MongoCollection collection = mongoDatabase.getCollection(collectionName);
        MongoCursor<Document> cursor = collection.find(new Document(fieldName, id)).projection(exclude("_id")).iterator();
        while (cursor.hasNext()) {
            Document doc = cursor.next();
            docList.add(doc);
        }
        return docList;
    }

    public static String getPureMongoUri(String uri) {
        if(uri.contains("?authMode=scram-sha1")) {
            uri = uri.replace("?authMode=scram-sha1", "");
        }
        return uri;
    }
}
