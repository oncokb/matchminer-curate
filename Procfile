web: java $JAVA_OPTS -Xmx500m -jar target/*.war --spring.profiles.active=swagger,prod,heroku --server.port=$PORT --spring.data.mongodb.database=$(echo "$MONGODB_URI" | sed "s/^.*:[0-9]*\///g")
