require('dotenv').config();
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Wit, log } = require('node-wit');

const logger = new log.Logger(log.DEBUG);
const client = new Wit({
  accessToken: process.env.WIT_AI_ACCESS_TOKEN,
  logger
});

let talkToAdmin = false;
let conversation = [];
let session = {};

const responses = {
  greetings: [
    "Hi", 
    "Hello"
  ],

  welcome: [
    'Hi',
    'Hello'
  ],

  bye: [
    'Bye',
    'See ya'
  ],

  thanks: ["Thank you", "Thanks"],

  about: [
    'I am a bot.',
    'My name is bot.'
  ],

  strength: [
    'Learning new concepts and tools quickly.',
    'Communicating clearly with others.',
    'Focusing on goals and outcomes.',
    'Making customers happy.'
  ],

  weakness: [
    'Proficiency with X tool or program.',
    'Giving feedback to colleagues or manager(s).',
    'Multi-tasking under pressure.'
  ],

  hobby: [
    'Chat with you',
    'Talk to you',
    'Facebook'
  ],

  portfolio: [
    'This is my portfolio, http://google.com',
    'Here is my portfolio, http://google.com'
  ],

  resume: [
    'This is my resume, http://google.com',
    'Here is my resume, http://google.com'
  ],

  answers: {
    yes: 'Please wait a few seconds.',
    no: 'Okey.',
    ok: 'Ok',
    okey: 'Okey'
  }

};

const firstEntityValue = (entities, entity) => {
  const val =
    entities &&
    entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value;

  if (!val) {
    talkToAdmin = true;
    return null;
  }

  talkToAdmin = false;
  return val;
};

const getIntentValue = (entities) => {
  return entities['intent'][0].value;
}

const getSportsValue = (entities) => {
  if (entities['sports']) {
    return entities['sports'][0].value;
  }

  return;
}

const getAnswer = (entities) => {
  return entities['answers'][0].value;
}

const getConfidence = (entities, entity) => {

}

const handleMessage = ({ entities }) => {
  // Default intent
  // Will check confidence
  // 
  let intent = {
    confidence: 0
  };

  for (const key in entities) {
    let object = entities[key];
    if (object[0].confidence > intent.confidence) {
      intent = Object.assign({}, object[0], {name: key});
    }
  }

  const { name, value } = intent;

  // To limit effect of greetings.
  if (name === 'greetings' && intent.confidence < 0.9) {
    return 'I do not understand your message. Do you want to talk to admin?';
  }

  if (name === 'intent') {
    const sport = getSportsValue(entities);
    if (value === 'hobby' && sport) {
      return 'Yes, I like ' + sport;
    }

    const response = responses[value][
      Math.floor(Math.random() * responses[value].length)
    ];

    return response;
  }

  if (name === 'answers') {
    const answer = getAnswer(entities);
    if ('yes' === answer && talkToAdmin) {
      return 'Please wait a few seconds.';
    }
    
    if (responses.answers[answer]) {
      return responses.answers[answer];
    }
  }

  if (name === 'bye') {
    const response = responses.bye[
      Math.floor(Math.random() * responses.bye.length)
    ];

    return response;
  }

  if (name === 'thanks') {
    const response = responses.thanks[
      Math.floor(Math.random() * responses.thanks.length)
    ];

    return response;
  }

  if (name === 'greetings') {
    const response = responses.greetings[
      Math.floor(Math.random() * responses.greetings.length)
    ];

    return response;
  }

  return 'I do not understand your message. Do you want to talk to admin?';
};

const app = express();

app.set('view engine','jade');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/clear', (req, res) => {
  conversation = [];
  return res.send(conversation);
});

app.get('/conversation', (req, res) => {
  const {userName} = req.query;
  res.send(session[userName]);
});

app.post('/chat', (req, res) => {
  const { message, userName } = req.body;

  const data = {
    text: message,
    user: 'user'
  }

  session[userName].push(data);

  client
    .message(message)
    .then(data => {
      const message = handleMessage(data);

      const obj = {
        text: message,
        user: 'ai'
      }

      session[userName].push(obj);

      res.send(message);
    })
    .catch(error => console.log(error));

});

app.get('/admin', (req, res) => {
  res.render('admin', { list: session });
});

app.post('/new-session', (req, res) => {
  console.log(req.body);
  const { user } = req.body;

  console.log(user);
  session[user] = [];

  console.log(session);
});

const http = require("http");
const server = http.createServer(app);

const socketIo = require("socket.io");
const io = socketIo(server);

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('chat message1', (msg) => {
    io.emit('chat message1', msg);
  });
});

const port = process.env.PORT || 7777;
server.listen(port, () => {
  console.log('listening on *' + port);
});