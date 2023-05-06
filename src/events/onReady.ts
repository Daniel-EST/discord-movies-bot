import { type Client, REST, Routes } from 'discord.js'
import { CommandList } from '../commands/_commandList'
import { environment } from '../environment'
import { MoviesTable } from '../db/models'

export const onReady = async (client: Client): Promise<void> => {
  const rest = new REST({ version: '9' }).setToken(
    environment.DISCORD_TOKEN
  )

  const commandData = CommandList.map((command) => command.data.toJSON())
  await rest.put(
    Routes.applicationGuildCommands(
      client.user?.id ?? 'missing id',
      environment.DISCORD_GUILD_ID
    ),
    { body: commandData }
  )

  await MoviesTable.sync()

  console.log('TCI Filmes is ready!')
}
