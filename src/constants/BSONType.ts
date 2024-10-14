import * as MongoDB from 'mongodb';
import { BSONType as TBSON } from '../types/BSONType';

export const BSONType: Record<TBSON, TBSON> = {
	...Object.keys(MongoDB.BSONType).reduce((acc, key) => {
		acc[key as keyof typeof MongoDB.BSONType] =
			key as keyof typeof MongoDB.BSONType;
		return acc;
	}, {} as Record<keyof typeof MongoDB.BSONType, keyof typeof MongoDB.BSONType>),
	number: 'number',
};
