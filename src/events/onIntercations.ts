import { type Interaction } from 'discord.js'
import { CommandList } from '../commands/_commandList'
import { environment } from '../environment'

export async function onInteraction (interaction: Interaction): Promise<void> {
  if (interaction.isCommand() && interaction.guild?.id === environment.DISCORD_GUILD_ID) {
    for (const Command of CommandList) {
      if (interaction.commandName === Command.data.name) {
        await Command.run(interaction)
        break
      }
    }
  }
}
