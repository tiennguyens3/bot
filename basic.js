const {Wit, log, interactive} = require('node-wit');

require('dotenv').config();
const accessToken = process.env.WIT_AI_ACCESS_TOKEN;

const logger = new log.Logger(log.DEBUG);
const client = new Wit({accessToken, logger});

const firstEntity = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;

  if (!val) {
    return null;
  }

  return val;
}


const handleMessage = ({entities}) => {
  const greetings = firstEntity(entities, "greetings");
  const thanks = firstEntity(entities, "thanks");

  if (greetings) {
    console.log("Hello, I am a job interview bot, glad to see you");
  } else if (thanks) {
    console.log("Bye, see you later");
  } else {
    console.log(entities);
  }
}

interactive(client, handleMessage);