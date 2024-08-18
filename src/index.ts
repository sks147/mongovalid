import { BSONType } from './constants/BSONType';
import { ValidationLevel } from './constants/ValidationLevel';
import { TValidationLevel } from './types/ValidationLevel';
import {
  TPropertiesWithDescription,
  TPropertyDescription,
} from './types/Property';
import { TValidationSchema, TSchemaField } from './types/Schema';
import * as MongoDB from 'mongodb';
import { TValidationAction } from './types/ValidationAction';
import { ValidationAction } from './constants/ValidationAction';

export const applyValidation = async (
  collectionName: string,
  schema: TValidationSchema,
  db: MongoDB.Db,
  validationLevel: TValidationLevel = ValidationLevel.strict,
  validationAction: TValidationAction = ValidationAction.error
): Promise<void> => {
  const requiredFields: string[] = Object.entries(schema)
    .filter(([_key, value]) => value.R !== false)
    .map(([key, _value]) => {
      return key.toString();
    });

  await db.command({
    collMod: collectionName,
    validator: {
      $jsonSchema: {
        bsonType: BSONType.object,
        title: `${collectionName} schema validation`,
        required: requiredFields,
        properties: generateProperties(schema),
        additionalProperties: false,
      },
    },
    validationLevel: validationLevel,
    validationAction: validationAction,
  });
};

export const getValidation = async (
  collectionName: string,
  db: MongoDB.Db
): Promise<{
  validator: MongoDB.Document;
  validationLevel: TValidationLevel;
  validationAction: TValidationAction;
}> => {
  const collectionInfos = db.listCollections({ name: collectionName });
  const collectionInfo = await collectionInfos.next();
  // TODO: notify mongodb team to fix typescript types for listCollections output
  const { validator, validationLevel, validationAction } = (
    collectionInfo as any
  ).options;

  return { validator, validationLevel, validationAction };
};

const generateProperties = (
  schema: TValidationSchema
): TPropertiesWithDescription => {
  const propertiesWithDescription: TPropertiesWithDescription = Object.entries(
    schema
  ).reduce((properties, [key, value]) => {
    const fieldType = value.T;
    const isRequired = value.R !== false;
    const isRequiredStr = isRequired ? 'required' : 'not required';
    const description = `${key} must be of type ${fieldType} and is ${isRequiredStr}`;

    return {
      ...properties,
      [key]: { bsonType: fieldType, description },
    };
  }, {} as TPropertiesWithDescription);
  return propertiesWithDescription;
};

export type {
  TValidationAction,
  TValidationLevel,
  TPropertiesWithDescription,
  TPropertyDescription,
  TSchemaField,
  TValidationSchema,
};

export { BSONType, ValidationAction, ValidationLevel };
