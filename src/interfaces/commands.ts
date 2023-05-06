import {
  type CommandInteraction,
  type SlashCommandBuilder,
  type SlashCommandSubcommandsOnlyBuilder
} from 'discord.js'

export interface Command {
  data: Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'> | SlashCommandSubcommandsOnlyBuilder
  run: (interaction: CommandInteraction) => Promise<void>
}
