import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";

const toCursor = (value) => {
  if (!value) { return null; }

  const serializedValue = JSON.stringify(value);

  return Buffer.from(serializedValue).toString("base64");
};
const fromCursor = (cursor) => {
  if (!cursor) { return null; }

  const serializedValue = Buffer.from(cursor, "base64").toString("utf8");

  try {
    return JSON.parse(serializedValue);
  } catch (e) {
    return null;
  }
};

const description = `
An opaque string that identifies a particular result within a connection which
has a grouped _id, allowing you to request a subset of results before or after
that result.
`;

export default new GraphQLScalarType({
  description,
  name: "GroupedDataConnectionCursor",
  serialize: toCursor,
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return fromCursor(ast.value);
    return ast.value;
  },
  parseValue: fromCursor
});
