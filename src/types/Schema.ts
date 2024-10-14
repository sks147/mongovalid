import { BSONType } from './BSONType';

export type TValidationSchema = Record<string, TSchemaField>;

export type TSchemaField = {
	T: BSONType;
	R?: boolean;
};
