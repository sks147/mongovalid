# MongoValid

[![NPM Version][npm-version-image]][npm-url]
[![Linux Build][github-actions-ci-image]][github-actions-ci-url]
[![NPM downloads][npm-downloads-url]][npm-url]


[npm-url]: https://npmjs.org/package/mongovalid
[npm-version-image]: https://img.shields.io/npm/v/mongovalid.svg?style=flat
[github-actions-ci-image]: https://badgen.net/github/checks/sks147/mongovalid/main?label=linux
[github-actions-ci-url]: https://github.com/sks147/mongovalid/actions/workflows/main.yml
[npm-downloads-url]: https://img.shields.io/npm/dm/mongovalid.svg?style=flat

**MongoValid** is an npm package designed to provide robust, database-level validation for MongoDB, bringing more type safety to backend API development. This tool helps developers streamline their MongoDB workflows by simplifying the process of applying schema validation directly at the database level, ensuring that only valid data is persisted.

## Key Features

- **Type Safety**: Integrate in your existing codebase to ensure that your MongoDB schemas are strongly typed, reducing runtime errors and improving code quality.
- **Flexible Validation**: This package enhances type safety by applying validation directly at the database level, while keeping the flexibility to enforce custom rules at the application layer. It simplifies validation by focusing on primitive data types in the database, which has proven effective in practice. This approach ensures that the database remains flexible and true to MongoDB’s document-oriented nature. The package deliberately avoids nested object validation to maintain backward compatibility and support canary deployments, preventing potential issues related to schema evolution.
- **Seamless Integration**: Works with MongoDB’s native validation mechanisms, making it easy to enforce data integrity without relying on external validation libraries.
- **Error Handling**: Automatically catch and handle validation errors, providing clear feedback during development and testing. [TODO]

## Documentation
Please visit the documentation [here](https://sks147.github.io/mongovalid/index.html)

## Installation

To install the package, use npm:

```bash
npm install mongovalid
```

## Usage
```typescript
import { MongoClient } from 'mongodb';

import {
  applyValidation,
  ValidationAction,
  ValidationLevel,
  TValidationSchema,
  BSONType
} from 'mongovalid'

async function main() {
  const uri = 'mongodb://localhost:27017';
  const connection = await MongoClient.connect(uri);
  const db = connection.db('mydatabase');

  // T: BSONType, R: required?
  const schema: TValidationSchema = {
    _id: {
      T: BSONType.objectId
    } // default R: true
    name: {
      T: BSONType.string
    },
    age: {
      T: BSONType.number,
      R: false
    },
  };

  await applyValidation('mycollection', schema, db);

  // Change validation level moderate
  await applyValidation('mycollection', schema, db, ValidationLevel.moderate);

  // Change validation level to moderate and validation action to warn
  await applyValidation('mycollection', schema, db, ValidationLevel.moderate, ValidationAction.warn);

  console.log('Validation applied successfully');
}


main().catch(console.error);

```