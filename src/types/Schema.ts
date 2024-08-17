import { BSONType } from './BSONType';

export type TValidationSchema = Record<string, TSchemaField>;

type TSchemaField = {
  T: BSONType;
  R?: boolean;
};
