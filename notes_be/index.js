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

  const {content, important} = req.body

  Note.findByIdAndUpdate(
    req.params.id,
    {content, important},
    {new: true, runValidators: true, constext: 'query'}
  )
    .then(updatedNote => {
      res.json(updatedNote)
    })
    .catch(error => {
      next(error)
    })
})

app.post('/api/notes', (req,res, next) => {
  
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

  note.save()
    .then(savedNote => {
      res.json(savedNote)
    })
    .catch(error => next(error))
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
  } else if (error.message === 'ValidationError') {
    response.status(400).send({error: error.message})
  }

  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})