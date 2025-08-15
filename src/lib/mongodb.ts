import { MongoClient, Db, Collection, Document } from "mongodb";

declare global {
  // for hot-reload in dev
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;
const defaultDb = process.env.MONGODB_DB; // optional but handy

console.log(
  'MONGODB_URI present?', Boolean(process.env.MONGODB_URI),
  ' MONGODB_DB:', process.env.MONGODB_DB
);

if (!uri) {
  throw new Error("MONGODB_URI is not set in environment variables");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise!;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getClient(): Promise<MongoClient> {
  return clientPromise;
}

export async function getDb(name = defaultDb): Promise<Db> {
  const c = await getClient();
  return c.db(name);
}

export async function getCollection<T extends Document = Document>(
  name: string,
  dbName = defaultDb
): Promise<Collection<T>> {
  const db = await getDb(dbName);
  return db.collection<T>(name);
}
