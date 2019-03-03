var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/x";

class DatabaseManager {
    constructor() {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var adminDb = db.admin();
            // List all the available databases
            adminDb.listDatabases(function(err, dbs) {
                test.equal(null, err);
                test.ok(dbs.databases.length > 0);
                db.close();
            });
           
            console.log("Database Connection success..");
            //db.close();
          });
    }

    // Adding a method to the constructor
    greet() {
        return `test`;
    }
}

module.export=new DatabaseManager();