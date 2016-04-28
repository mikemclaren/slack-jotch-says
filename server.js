require('babel-polyfill');
import {
  RtmClient,
  MemoryDataStore,
  CLIENT_EVENTS,
  RTM_EVENTS,
  WebClient
} from '@slack/client';

const sourceToken = process.env.SOURCE_SLACK_API_TOKEN;
const destinationToken = process.env.DESTINATION_SLACK_API_TOKEN;

const rtm = new RtmClient(sourceToken, {
  logLevel: 'error',
  dataStore: new MemoryDataStore()
});
const web = new WebClient(destinationToken);

rtm.start();

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (startData) => {
  console.log(`Logged in as ${startData.self.name} of team ${startData.team.name}, but not connected to a channel yet`);
});

rtm.on(RTM_EVENTS.MESSAGE, (message) => {
  if(message.channel === process.env.SOURCE_SLACK_CHANNEL) {
    const user = rtm.dataStore.getUserById(message.user);

    let text = message.text;
    const attachments = message.attachments;

    text = user.name + '\n' + text;
    web.chat.postMessage(process.env.DESTINATION_SLACK_CHANNEL, text, {
      username: 'Jotch Bot',
      attachments
    }, () => {});
  }
});
