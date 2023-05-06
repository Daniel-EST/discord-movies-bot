import * as dotenv from 'dotenv'
dotenv.config()

export const environment = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN as string,
  DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID as string,

  OMDB_TOKEN: process.env.OMDB_TOKEN as string,

  DB_DATABASE: process.env.DB_DATABASE as string,
  DB_USERNAME: process.env.DB_USERNAME as string,
  DB_PASSWORD: process.env.DB_PASSWORD as string,
  DB_HOST: process.env.DB_HOST as string,
  DB_PORT: process.env.OMDB_TOKEN as string
}
