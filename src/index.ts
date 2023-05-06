import { Client, Events, GatewayIntentBits, type Interaction } from 'discord.js'
import { onInteraction } from './events/onIntercations'
import { onReady } from './events/onReady'
import { environment } from './environment'

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
})

client.once(Events.ClientReady, async () => { await onReady(client) })

client.on(Events.InteractionCreate,
  async (interaction: Interaction) => { await onInteraction(interaction) }
)

void client.login(environment.DISCORD_TOKEN)
