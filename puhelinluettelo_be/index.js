
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')
const { response } = require('express')
const note = require('../notes_be/models/note')

app.use(express.json())
app.use(express.static('build'))
app.use(cors())

app.use(morgan(function (tokens, request, response) {
    const message = [
        tokens.method(request, response),
        tokens.url(request, response),
        tokens.status(request, response),
        tokens.res(request, response, 'content-length'), '-',
        tokens['response-time'](request, response), 'ms'
    ].join(' ')

    if (tokens.method(request, response)==='POST') {
        return message + ` ${JSON.stringify(request.body)}`
    }

    return message
})
)


app.get("/api/persons", (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get("/info", (request, response) => {
    Person.find({}).then(persons => {
        amountOfPersons = persons.length
        response.send(
            `Phonebook has info for ${amountOfPersons} people <br></br> ${new Date()}`
    )
    })
})

app.get("/api/persons/:id", (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person){
                response.json(person)
        }   else {
                response.status(404).end
        } 
        })
        .catch(error => next(error))
})

app.delete("/api/persons/:id", (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put("/api/persons/:id", (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    Person.find({}).then(results => {
        if (!results.some(person => body.name === person.name)) {
            return response.status(404).json({
                error: 'person not found from the server'
            })
        }
    })

    Person.findByIdAndUpdate(request.params.id, person, {new: true})
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})


app.post("/api/persons", (request, response) => {

    const body = request.body
    const person = new Person({
        name: body.name,
        number: body.number
    })

    if (!body.name) {
        return response.status(400).json({
            error: "name missing"
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: "number missing"
        })
    }


    person.save().then(result => {
        console.log(`New person ${person.name} (${person.number}) added to phonebook!`)
    })
    return response.json(person)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'Unknown enpoint'})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.message === 'CastError') {
        response.status(400).send({error: 'malformatted id'})
    }
    else {
        response.status(404).end()
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})