import React from 'react';
import ReactDOM from 'react-dom';

import './style.css';

import io from 'socket.io-client';
const socket = io('http://localhost:7777');

var urlParams = new URLSearchParams(window.location.search);
const isAdmin = urlParams.has('admin');
const userName = urlParams.get('user') || 'user1';

const ChatBubble = (text, i, className) => {
  const classes = `${className} chat-bubble`;
  return (
    <div key={`${className}-${i}`} className={classes}>
      <span className="chat-content">{text}</span>
    </div>
  );
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userMessage: '',
      conversation: [],
      flag: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    socket.on('chat message', (msg) => {
      this.setState({
        conversation: [...this.state.conversation, msg],
        flag: true
      });
    });
  }

  handleChange(event) {
    this.setState({ userMessage: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ userMessage: '' });

    const msg = {
      text: this.state.userMessage,
      user: 'user',
    };

    if (isAdmin) {
      msg.user = 'ai';
      socket.emit('chat message', userName, msg);
      return;
    }

    if (this.state.flag) {
      socket.emit('chat message', msg);
      return;
    }

    this.setState({
      conversation: [...this.state.conversation, msg],
    });

    fetch('http://localhost:7777/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: this.state.userMessage,
        userName: userName
      }),
    })
    .then(response => response.text())
    .then(data => {
      const msg = {
        text: data,
        user: 'ai'
      }

      this.setState({
        conversation: [...this.state.conversation, msg]
      });
    });
  }

  componentDidMount() {
    if (isAdmin) {
      fetch('http://localhost:7777/conversation?userName=' + userName)
        .then(response => response.json())
        .then(data => {
          this.setState({
            conversation: data
          })
        });
    } else {
      fetch('http://localhost:7777/new-session', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          user: userName
        })
      })
    }
  }

  render() {
    const chat = this.state.conversation.map((e, index) =>
      ChatBubble(e.text, index, e.user)
    );

    return (
      <>
        <h1>Web chat</h1>
        <div className="chat-window">
          <div className="conversation-view">{chat}</div>
          <div className="message-box">
            <form onSubmit={this.handleSubmit}>
              <input
                value={this.state.userMessage}
                onChange={this.handleChange}
                className="text-input"
                type="text"
                placeholder="Type your message and hit Enter to send"
              />
            </form>
          </div>
        </div>
      </>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));