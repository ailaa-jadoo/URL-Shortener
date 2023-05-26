if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose')
const ShortUrl = require('./models/shortUrl')
const app = express();


const uri = process.env.DB_URI || 'mongodb://localhost/urlShortener';
mongoose.connect(uri);
// mongoose.connect('mongodb://localhost/urlShortener')

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))



const port = process.env.PORT || 3000;
app.listen(port, () => { console.log(`Serving on the port ${port}`); })


app.get('/', async (req, res) => {
    const shortUrls = await ShortUrl.find()
    res.render('index', { shortUrls: shortUrls })
})

app.post('/shortUrls', async (req, res) => {
    await ShortUrl.create({ full: req.body.fullUrl })

    res.redirect('/')
})

app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
    if (shortUrl == null)
        return res.sendStatus(404)

    shortUrl.clicks++
    shortUrl.save()

    res.redirect(shortUrl.full)
})