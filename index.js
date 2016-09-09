'use strict'

const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Twit = require('twit')
const EventEmitter = require('events')
const debugBot = require('debug')('bot')
const debugServer = require('debug')('server')
const config = require('./config')

// Server
const events = new EventEmitter()
const app = express()
const server = http.createServer(app)
app.use(express.static('public'))

const io = socketio(server)

io.on('connection', (socket) => {
  events.on('retweet', (message) => {
    socket.emit('retweet', message)
  })
})

server.listen(3000, () => {
  debugServer('Server listening!')
})

const client = new Twit(config)

const stream = client.stream('statuses/filter', {
  track: [ 'javascript', 'nodeschool' ]
})

stream.on('tweet', (tweet) => {
  debugBot('received a tweet')
  if (tweet.text.match(/@christsantiris/i)) {
    debugBot('retweeted %s', tweet.text)
    client.post('statuses/retweet/:id', { id: tweet.id_str })
    events.emit('retweet', {
      by: tweet.user.screen_name,
      text: tweet.text
    })
  }

  if (tweet.text.match(/@suncoastjs/)) {
    client.post('favorites/create', { id: tweet.id_str })
  }
})
