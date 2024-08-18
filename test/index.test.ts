import { MongoClient, Db, MongoServerError } from 'mongodb';
import {
  applyValidation,
  getValidation,
  BSONType,
  ValidationAction,
  ValidationLevel,
} from '../src/index';
import { TValidationSchema } from '../src/types/Schema';

let connection: MongoClient;
let db: Db;

const DB_NAME = 'mongovalid';

const TEST_COLL = 'test';
const STRICT_TEST_COLL = 'strict_test_collection';
const MODERATE_TEST_COLL = 'moderate_test_collection';
const NO_REQUIRED_FIELD_COLL = 'no_required_field_collection';

beforeAll(async () => {
  const uri = 'mongodb://localhost:27017';
  connection = await MongoClient.connect(uri);
  db = connection.db(DB_NAME);
});

afterAll(async () => {
  if (connection) {
    await connection.close();
  }
  if (db) {
    await db
      .collection(TEST_COLL)
      .drop()
      .catch(() => {});
    await db
      .collection(STRICT_TEST_COLL)
      .drop()
      .catch(() => {});
    await db
      .collection(MODERATE_TEST_COLL)
      .drop()
      .catch(() => {});
    await db
      .collection(NO_REQUIRED_FIELD_COLL)
      .drop()
      .catch(() => {});
  }
});

describe('test connection', () => {
  it('should successfully set & get information from the database', async () => {
    expect(db).toBeDefined();
    const col = db.collection(TEST_COLL);
    const result = await col.insertMany([{ a: 1 }, { b: 1 }]);
    expect(result.insertedCount).toStrictEqual(2);
    expect(await col.countDocuments({})).toBe(2);
    await col.drop();
  });
});

describe('applyValidation', () => {
  beforeEach(async () => {
    await db
      .collection(TEST_COLL)
      .drop()
      .catch(() => {});
    await db
      .collection(STRICT_TEST_COLL)
      .drop()
      .catch(() => {});
    await db
      .collection(MODERATE_TEST_COLL)
      .drop()
      .catch(() => {});
    await db
      .collection(NO_REQUIRED_FIELD_COLL)
      .drop()
      .catch(() => {});

    await db.createCollection(TEST_COLL);
    await db.createCollection(STRICT_TEST_COLL);
    await db.createCollection(MODERATE_TEST_COLL);
    await db.createCollection(NO_REQUIRED_FIELD_COLL);
  });

  afterEach(async () => {
    await db
      .collection(TEST_COLL)
      .drop()
      .catch(() => {});
    await db
      .collection(MODERATE_TEST_COLL)
      .drop()
      .catch(() => {});
    await db
      .collection(NO_REQUIRED_FIELD_COLL)
      .drop()
      .catch(() => {});
  });

  it('should apply validation with strict level by default', async () => {
    const collectionName: string = STRICT_TEST_COLL;
    const schema: TValidationSchema = {
      _id: { T: BSONType.objectId, R: true },
      name: { T: BSONType.string, R: true },
      age: { T: BSONType.number, R: false },
    };

    await applyValidation(collectionName, schema, db, ValidationLevel.strict);

    const { validator, validationLevel, validationAction } =
      await getValidation(collectionName, db);

    expect(validator).toMatchObject({
      $jsonSchema: {
        bsonType: BSONType.object,
        required: ['_id', 'name'],
        properties: {
          _id: {
            bsonType: BSONType.objectId,
            description: '_id must be of type objectId and is required',
          },
          name: {
            bsonType: BSONType.string,
            description: 'name must be of type string and is required',
          },
          age: {
            bsonType: BSONType.number,
            description: 'age must be of type number and is not required',
          },
        },
        additionalProperties: false,
      },
    });

    expect(validationLevel).toBe(ValidationLevel.strict);
    expect(validationAction).toBe(ValidationAction.error);

    const collection = db.collection(collectionName);

    const validDoc = { name: 'John Doe', age: 30 };
    try {
      const validResult = await collection.insertOne(validDoc);
      expect(validResult.acknowledged).toBe(true);
    } catch (error) {
      console.error('Failed to insert valid document:', error);
      throw error; // Re-throw the error if it's unexpected
    }

    const invalidDoc = { age: 25 };
    try {
      await collection.insertOne(invalidDoc);
    } catch (error) {
      expect(error).toBeInstanceOf(MongoServerError);
      expect((error as MongoServerError).errorResponse.errmsg).toMatch(
        /Document failed validation/
      );
    }

    const invalidDocType = { name: 'Jane Doe', age: 'twenty-five' };
    try {
      await collection.insertOne(invalidDocType);
    } catch (error) {
      expect(error).toBeInstanceOf(MongoServerError);
      expect((error as MongoServerError).errorResponse.errmsg).toMatch(
        /Document failed validation/
      );
    }
  });

  it('should apply validation with moderate level', async () => {
    const collectionName: string = MODERATE_TEST_COLL;
    const schema: TValidationSchema = {
      _id: { T: BSONType.objectId, R: true },
      title: { T: BSONType.string, R: true },
      views: { T: BSONType.number, R: false },
    };

    await applyValidation(
      collectionName,
      schema,
      db,
      ValidationLevel.moderate,
      ValidationAction.warn
    );

    const { validator, validationLevel, validationAction } =
      await getValidation(collectionName, db);

    expect(validator).toMatchObject({
      $jsonSchema: {
        bsonType: BSONType.object,
        required: ['_id', 'title'],
        properties: {
          _id: {
            bsonType: BSONType.objectId,
            description: '_id must be of type objectId and is required',
          },
          title: {
            bsonType: BSONType.string,
            description: 'title must be of type string and is required',
          },
          views: {
            bsonType: BSONType.number,
            description: 'views must be of type number and is not required',
          },
        },
        additionalProperties: false,
      },
    });

    expect(validationLevel).toBe(ValidationLevel.moderate);
    expect(validationAction).toBe(ValidationAction.warn);
  });

  it('should throw an error when applying validation with no required fields', async () => {
    const collectionName: string = NO_REQUIRED_FIELD_COLL;
    const schema: TValidationSchema = {
      title: { T: BSONType.string, R: false },
      views: { T: BSONType.number, R: false },
    };

    try {
      await applyValidation(collectionName, schema, db);
    } catch (error) {
      expect(error).toBeDefined();
      const errmsg = (error as MongoServerError).errorResponse.errmsg;
      expect(errmsg).toContain('Parsing of collection validator failed');
      expect(errmsg).toContain("'required' cannot be an empty array");
    }
  });
});
