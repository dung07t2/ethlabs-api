const firebase = require('firebase')
const admin = require('firebase-admin')
require('firebase/firestore')
const serviceAccount = require('./serviceAccountKey.json')
const { firebaseConfig } = require('./config')

if (!firebase.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    })
    firebase.initializeApp(firebaseConfig)
} else {
    firebase.app()
}

const db = firebase.firestore()

module.exports = { firebase, db, admin }
