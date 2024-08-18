import { BSONType } from './BSONType';

export type TPropertyDescription = {
  bsonType: BSONType;
  description: string;
};

export type TPropertiesWithDescription = Record<string, TPropertyDescription>;
