import * as bsonTypeConstants from './constants/BSONType';
import { ValidationLevel } from './constants/ValidationLevel';
import { TValidationLevel } from './types/ValidationLevel';
import { TPropertiesWithDescription } from './types/Property';
import * as Schema from './types/Schema';
import * as MongoDB from 'mongodb';

export const applyValidation = async (
  collectionName: string,
  schema: Schema.TValidationSchema,
  db: MongoDB.Db,
  validationLevel: TValidationLevel = ValidationLevel.strict
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
        bsonType: bsonTypeConstants.BSONType.object,
        title: `${collectionName} schema validation`,
        required: requiredFields,
        properties: generateProperties(schema),
        additionalProperties: false,
      },
    },
    validationLevel: validationLevel,
  });
};

const generateProperties = (
  schema: Schema.TValidationSchema
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
