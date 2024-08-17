import { BSONType } from './BSONType';

type TPropertyDescription = {
  bsonType: BSONType;
  description: string;
};

export type TPropertiesWithDescription = Record<string, TPropertyDescription>;
