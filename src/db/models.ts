import { DATE, STRING, Sequelize } from 'sequelize'
import { environment } from '../environment'

const sequelize = new Sequelize(environment.DB_DATABASE, environment.DB_USERNAME, environment.DB_PASSWORD, {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'database.sqlite'
})

export const MoviesTable = sequelize.define('movies', {
  movie_id: {
    type: STRING,
    unique: true
  },
  movie_title: {
    type: STRING,
    allowNull: false
  },
  user: {
    type: STRING,
    allowNull: false
  },
  date: DATE
})
