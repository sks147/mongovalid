import * as MongoDB from 'mongodb';
export const BSONType = Object.freeze({
  ...MongoDB.BSONType,
  number: 'number',
} as const);
