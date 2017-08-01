import React from 'react';
import { render } from 'react-dom';

const io = require('socket.io-client');
const socket = io();

const styles = {
  widget: {
    border: '1px solid #000',
    bottom: '10px',
    position: 'fixed',
    right: '10px',
    width: '400px'
  },

  header: {
    background: '#000',
    color: '#fff',
    padding: '10px'
  },

  msgWrapper: {
    background: '#f4f4f4',
    fontFamily: 'monospace',
    height: '250px',
    listStyle: 'none',
    margin: '0',
    padding: '10px'
  },

  myMsg: {
    background: '#ccc',
    border: '1px solid #ccc',
    display: 'block',
    float: 'right',
    margin: '0 0 4px',
    padding: '5px',
    width: '300px'
  },

  otherMsg: {
    border: '1px solid #ccc',
    display: 'block',
    float: 'left',
    margin: '0 0 4px',
    padding: '5px',
    width: '300px'
  },

  form: {
    margin: '0',
    width: '100%'
  },

  inputText: {
    border: '1px solid #333',
    height: '30px',
    width: '80%'
  },

  btnSubmit: {
    background: '#333',
    border: 'none',
    color: '#fff',
    height: '30px',
    width: '20%'
  },

  templateWrapper: {
    background: '#fff',
    border: '1px solid #ccc',
    float: 'left',
    margin: '0 20px 4px',
    padding: '10px',
    width: '310px'
  },

  templateBtn: {
    background: 'green',
    border: '1px solid green',
    color: '#fff',
    margin: '0 2px',
    padding: '10px',
    textTransform: 'uppercase',
    width: '150px'
  }
};

class App extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      userId: '',
      msg: []
    };

    this.sendMsg = this.sendMsg.bind(this);
    this.renderTemplate = this.renderTemplate.bind(this);
    this.selectOption = this.selectOption.bind(this);
  }

  componentDidMount () {
    let self = this;

    socket.on('connect', () => {
      this.setState({
        userId: socket.id
      });
    });

    socket.on('chat message', (data) => {
      let arrMsg = [];
      let msg = self.state.msg;

      msg.push(data);
      self.setState({
        msg: msg
      });
    });
  }

  selectOption (e) {
    socket.emit('chat message', e.target.value);
  }

  renderTemplate (i) {
    let self = this;

    let ret = i.map((arr) => {
      return (
        <button
          key={arr.text}
          onClick={self.selectOption.bind(this)}
          style={styles.templateBtn}
          value={arr.text}>{arr.text}</button>
      );
    });

    return ret;
  }

  renderMsg () {
    let self = this,
      msg = self.state.msg,
      arrMsg = [];

    for (let i = 0; i < msg.length; i++) {
      if (msg[i].type === 'template') {
        arrMsg.push(
          <li style={styles.templateWrapper} key={i}>
            {self.renderTemplate(msg[i].items)}
          </li>
        );
      } else {
        arrMsg.push(
          <li style={msg[i].sender === self.state.userId ? styles.myMsg : styles.otherMsg} key={i}>
            {msg[i].sender}: {msg[i].content}
          </li>
        );
      }
    }

    return arrMsg;
  }

  sendMsg (e) {
    e.preventDefault();
    let $elmTxt = document.getElementById('txt');
    socket.emit('chat message', $elmTxt.value);

    $elmTxt.value = '';

    return false;
  }

  render () {
    let self = this;

    return (
      <div style={styles.widget}>
        <div style={styles.header}>Your ID is: {self.state.userId}</div>

        <ul style={styles.msgWrapper}>
          {self.renderMsg()}
        </ul>

        <form style={styles.form} onSubmit={self.sendMsg}>
          <input type="text" id="txt" autoComplete="off" style={styles.inputText}/>
          <button type="submit" style={styles.btnSubmit}>Send</button>
        </form>
      </div>
    );
  }
}

render(<App/>, document.getElementById('app'));
