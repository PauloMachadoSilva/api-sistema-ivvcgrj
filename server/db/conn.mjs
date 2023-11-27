import { MongoClient } from "mongodb";

const connectionString = 'mongodb+srv://sistemasivvcgrj:mudar123@ivvcgrj-bd.qbpvfkb.mongodb.net/?retryWrites=true&w=majority';

const client = new MongoClient(connectionString);

let conn;
try {
  conn = await client.connect();
} catch(e) {
  console.error(e);
}

let db = conn.db("devio-food");

export default db;