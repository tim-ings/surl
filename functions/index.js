const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Hashids = require('hashids/cjs');
const { v4: uuid } = require('uuid');
const cors = require('cors')({
    origin: /^([^.]*\.)?tim-ings\.com$/,
});

admin.initializeApp();
const firestore = admin.firestore();
const collection = firestore.collection('surls');

const SLUG_LEN = 11;

const formatUrl = (slug) => `https://surl.tim-ings.com/${slug}`;

const generateSlug = () => {
    const hashids = new Hashids(uuid(), SLUG_LEN);
    return hashids.encode(2020);
}

const insertUrl = async (slug, url, res) => {
    functions.logger.info(`Encoding URL "${slug}" -> "${url}"`);
    await collection.doc(slug).set({ url });
    return res.status(200).send({
        url: formatUrl(slug),
    });
}

const fetchUrl = async (slug) => {
    const doc = await collection.doc(slug).get();
    if (doc.exists) {
        return doc.data().url;
    }
    return null;
}

const createUrl = async (req, res) => {
    const { url, slug } = req.body;
    if (!url) {
        return res.status(400).send({
            message: 'Url missing',
        });
    }

    if (slug) {
        // check if the slug already exists in the database
        const doc = await collection.doc(slug).get();
        if (doc.exists) {
            return res.status(400).send({
                message: 'Slug already in use',
            });
        }
    }

    return insertUrl(slug || generateSlug(), url, res);
}

const decodeUrl = async (req, res) => {
    functions.logger.info(`Decoding "${req.url}"`);
    const slug = req.url.slice(1);
    if (slug.length <= 0) {
        return res.status(404).send({
            message: 'Not found',
        });
    }
    const url = await fetchUrl(slug);
    if (url !== null) {
        return res.redirect(url);
    }
    return res.status(404).send({
        message: 'Not found',
    });
}

exports.run = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        if (req.method === 'POST') {
            return createUrl(req, res);
        } else if (req.method === 'GET') {
            return decodeUrl(req, res);
        } else {
            return res.status(403).send({
                message: 'Forbidden: Invalid request method',
            });
        }
    });
});
