import * as MongoDB from 'mongodb';
export type BSONType = keyof typeof MongoDB.BSONType | 'number';
