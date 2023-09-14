import { drizzle as Drizzle } from "drizzle-orm/planetscale-serverless";
import { connect } from "@planetscale/database";

const connection = connect({
  url: process.env.DATABASE_URL,
});

export const drizzle = Drizzle(connection);
