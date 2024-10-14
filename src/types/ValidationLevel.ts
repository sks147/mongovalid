import { ValidationLevel } from '../constants/ValidationLevel';
export type TValidationLevel =
	(typeof ValidationLevel)[keyof typeof ValidationLevel];
