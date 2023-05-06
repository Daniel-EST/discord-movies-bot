import { type Command } from '../interfaces/commands'
import { listMovies, infoMovie, addMovie, randomMovie } from './movies'

export const CommandList: Command[] = [infoMovie, listMovies, addMovie, randomMovie]
