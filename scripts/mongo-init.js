// MongoDB init script — exécuté au premier démarrage du container
db = db.getSiblingDB("contentiq");
db.createCollection("users");
db.createCollection("contents");
db.createCollection("templates");
print("✅ Base de données contentiq initialisée");
