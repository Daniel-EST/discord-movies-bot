import {
  type CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder
} from 'discord.js'
import { type Command } from '../interfaces/commands'
import got from 'got'
import { environment } from '../environment'
import { MoviesTable } from '../db/models'
import { Sequelize } from 'sequelize'

interface Movie {
  Title: string
  Year: string
  Rated: string
  Released: string
  Runtime: string
  Genre: string
  Director: string
  Writer: string
  Actors: string
  Plot: string
  Language: string
  Country: string
  Awards: string
  Poster: string
  Ratings: Array<{
    Source: string
    Value: string
  }>
  Metascore: string
  imdbRating: string
  imdbVotes: string
  imdbID: string
  Type: string
  DVD: string
  BoxOffice: string
  Production: string
  Website: string
  Response: string
}

export const getMovieInfo = async (title: string, year: string=''): Promise<Movie> => {
  const movie: Movie = await got.get('http://www.omdbapi.com/', {
    searchParams:
    {
      t: title,
      y: year,
      apiKey: environment.OMDB_TOKEN,
      r: 'json',
      plot: 'short',
      type: 'movie'
    }
  }).json()
  return movie
}

export const listMovies: Command = {
  data: new SlashCommandBuilder()
    .setName('listar_filmes')
    .setDescription('Lista todos os filmes.'),
  run: async (interaction: CommandInteraction) => {
    await interaction.deferReply()

    try {
      const movies = await MoviesTable.findAll({ attributes: ['movie_title', 'user'] })

      const movieEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Lista de filmes')

      movies.forEach((movie) => {
        movieEmbed.addFields({
          name: movie.getDataValue('movie_title'), value: movie.getDataValue('user')
        })
      })

      await interaction.editReply({
        embeds: [movieEmbed]
      })
    } catch (err) {
      await interaction.editReply({
        content: 'Algum erro aconteceu, tente mais tarde'
      })
    }
  }
}

export const addMovie: Command = {
  data: new SlashCommandBuilder()
    .setName('adicionar_filme')
    .setDescription('Adiciona um filme para o sorteio semanal.')
    .addStringOption((option) =>
      option
        .setName('filme')
        .setDescription('Nome do filme (em inglês) que deseja adicionar.')
        .setRequired(true)
    ) 
    .addStringOption((option) =>
    option
      .setName('ano')
      .setDescription('Ano do filme (em inglês) que deseja adicionar.')
      .setRequired(false)
    ),
  run: async (interaction: CommandInteraction) => {
    await interaction.deferReply()
    const title = interaction.options.data[0]?.value as string
    const ano = interaction.options.data[1]?.value as string
    try {
      const movie: Movie = await getMovieInfo(title.trim(), ano.trim())

      switch (movie.Response) {
        case 'True': {
          try {
            await MoviesTable.create({
              movie_id: movie.imdbID,
              movie_title: movie.Title,
              user: interaction.user.tag,
              date: new Date()
            })
            await interaction.editReply({
              content: `O Filme "${movie.Title}" foi adicionado.`
            })
          } catch (err) {
            console.log(err)
            // if (err.name === 'SequelizeUniqueConstraintError') {
            //   return interaction.reply('Este filme já esta na lista');
            // }
          }
          break
        }
        case 'False': {
          await interaction.editReply({
            content: 'Filme não encontrado.'
          })
          break
        }
      }
    } catch (err) {
      await interaction.editReply({
        content: 'Algum erro aconteceu, tente mais tarde'
      })
    }
  }
}

export const removeMovie: Command = {
  data: new SlashCommandBuilder()
    .setName('remover_filme')
    .setDescription('Remove um filme do sorteio.')
    .addStringOption((option) =>
      option
        .setName('filme')
        .setDescription('Nome do filme (em inglês) que deseja remover.')
        .setRequired(true)
    ),
  run: async (interaction: CommandInteraction) => {
    await interaction.deferReply()
    const title = interaction.options.data[0]?.value as string
    const rowCount = await MoviesTable.destroy({ where: { movie_title: title } })
    if (rowCount > 0) {
      await interaction.editReply({ content: `O filme "${title}" foi removido.` })
    } else {
      await interaction.editReply({ content: 'Filme não encontrado.' })
    }
  }
}

export const randomMovie: Command = {
  data: new SlashCommandBuilder()
    .setName('sortear_filme')
    .setDescription('Sorteia aleatoriamente um filme.'),
  run: async (interaction: CommandInteraction) => {
    await interaction.deferReply()
    const drawnMovie = await MoviesTable.findOne({
      order: Sequelize.literal('RANDOM()'), attributes: ['movie_title', 'user']
    })

    const movie: Movie = await getMovieInfo(drawnMovie?.getDataValue('movie_title'))
    switch (movie.Response) {
      case 'True': {
        const movieEmbed = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle(movie.Title)
          .setURL(`https://www.imdb.com/title/${movie.imdbID}/`)
          .setDescription(movie.Plot)
          .addFields(
            { name: 'Atores', value: movie.Actors, inline: true },
            { name: 'Diretor', value: movie.Director, inline: true },
            { name: 'Roterista', value: movie.Writer, inline: true }
          )
          .addFields(
            { name: 'Gênero', value: movie.Genre, inline: true },
            { name: 'País', value: movie.Country, inline: true },
            { name: 'Ano', value: movie.Year, inline: true },
            { name: 'Nota', value: movie.Ratings[0].Value }
          )
          .setImage(movie.Poster)
          .setTimestamp()

        await interaction.editReply({
          embeds: [movieEmbed]
        })
        break
      }

      case 'False': {
        await interaction.editReply({
          content: 'Filme não encontrado.'
        })
        break
      }
    }
  }
}

export const infoMovie: Command = {
  data: new SlashCommandBuilder()
    .setName('informacoes_filme')
    .setDescription('Obtém informações de um determinado filme.')
    .addStringOption((option) =>
      option
        .setName('filme')
        .setDescription('Nome do filme (em inglês) que deseja verificar as informações.')
        .setRequired(true)
    ) 
    .addStringOption((option) =>
    option
      .setName('ano')
      .setDescription('Ano do filme (em inglês) que deseja adicionar.')
      .setRequired(false)
    ),
  run: async (interaction: CommandInteraction) => {
    await interaction.deferReply()
    const title = interaction.options.data[0]?.value as string
    const year = interaction.options.data[1]?.value as string
    const movie: Movie = await getMovieInfo(title.trim(), year.trim())
    switch (movie.Response) {
      case 'True': {
        const movieEmbed = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle(movie.Title)
          .setURL(`https://www.imdb.com/title/${movie.imdbID}/`)
          .setDescription(movie.Plot)
          .addFields(
            { name: 'Atores', value: movie.Actors, inline: true },
            { name: 'Diretor', value: movie.Director, inline: true },
            { name: 'Roterista', value: movie.Writer, inline: true }
          )
          .addFields(
            { name: 'Gênero', value: movie.Genre, inline: true },
            { name: 'País', value: movie.Country, inline: true },
            { name: 'Ano', value: movie.Year, inline: true },
            { name: 'Nota', value: movie.Ratings[0].Value }
          )
          .setImage(movie.Poster)
          .setTimestamp()

        await interaction.editReply({
          embeds: [movieEmbed]
        })
        break
      }

      case 'False': {
        await interaction.editReply({
          content: 'Filme não encontrado.'
        })
        break
      }
    }
  }
}
