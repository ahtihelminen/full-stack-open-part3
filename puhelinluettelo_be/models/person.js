const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
console.log(url)

console.log('connecting to MongoDB...')
mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB successfully!')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: true
    },
    number: {
        type: String,
        minlength: 8,
        validate: {
            validator: function(number) {
                const parts = number.split('-')
                const a = parts[0]
                if (a.length === 2 || a.length === 3) {
                    return true
                } else {
                    return false
                }
            },
            message: props => 'number has to be either format 00-000000 or 000-00000'
        },
        required: [true, 'number required']
    },
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)