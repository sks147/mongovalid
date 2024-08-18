import { ValidationAction } from '../constants/ValidationAction';
export type TValidationAction =
  (typeof ValidationAction)[keyof typeof ValidationAction];
