//3.12 done

const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]
const nameConst = process.argv[3]
const numberConst = process.argv[4]


const url = `mongodb+srv://fullstack_ahti:${password}@cluster0.cflhlkh.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
    name: nameConst,
    number: numberConst,
})

if (nameConst) {
    person.save().then(result => {
        console.log(`added ${nameConst} number ${numberConst} to phonebook`)
        mongoose.connection.close()
    })
}
else {
   Person.find({}).then(result => {
    console.log('\nphonebook:')
    result.forEach(person => {
        console.log(person.name, person.number)
    })
    mongoose.connection.close()
   }) 
}