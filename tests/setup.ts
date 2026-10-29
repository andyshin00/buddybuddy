// Abort before any test touches a database that isn't the test branch.
if (process.env.APP_ENV !== "test") {
  throw new Error(
    "APP_ENV is not 'test'. Is .env.test missing? Refusing to run tests against the dev database.",
  );
}
