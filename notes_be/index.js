//set env variable url with:
//fly secrets set MONGODB_URI='mongodb+srv://fullstack:<password>@cluster0.o1opl.mongodb.net/noteApp?retryWrites=true&w=majority'


require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const Note = require('./models/note')

app.use(express.json())
app.use(express.static('build'))
app.use(cors())

const requestLogger = (request, response, next) => {
  console.log('Method: ', request.method)
  console.log('Path: ', request.path)
  console.log('Body: ', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)



let notes =  [
    {
      id: 1,
      content: "HTML is easy",
      date: "2022-01-10T17:30:31.098Z",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only Javascript",
      date: "2022-01-10T18:39:34.091Z",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      date: "2022-01-10T19:20:14.298Z",
      important: true
    }
  ]

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0
  return maxId + 1
}


//routes start
app.get('/', (req, res) => {
    res.send(
        '<h1>Hello world</h1>'
    )
})

app.get('/api/notes', (req, res) => {
    Note.find({}).then(notes => {
      res.json(notes)
    })
})

app.get('/api/notes/:id', (req, res, next) => {
    Note.findById(req.params.id)
      .then(note => {
        if (note){
          res.json(note)
        } else {
          res.status(404).end()
        }
      })
      .catch(error => next(error))
  })

app.delete('/api/notes/:id', (req,res) => {
    Note.findByIdAndDelete(req.params.id)
      .then(result => res.status(204).end())
      .catch(error => next(error))
})

app.put('/api/notes/:id', (req,res) => {

  const body = req.body

  const note = {
    content: body.content,
    important: body.important
  }

  Note.findByIdAndUpdate(req.params.id, note, {new: true})
    .then(updatedNote => {
      res.json(updatedNote)
    })
    .catch(error => {
      next(error)
    })
})

app.post('/api/notes', (req,res) => {
  
  const body = req.body

  if (!body.content) {
    return res.status(400).json({
      error: 'Content missing'
    })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })

  note.save().then(savedNote => {
    res.json(savedNote)
  })
})

//routes end

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: "Unknown endpoint"})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) =>{
  console.error(error.message)

  if (error.message === 'CastError') {
    response.status(400).send({error: 'malformatted id'})
  }

  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})