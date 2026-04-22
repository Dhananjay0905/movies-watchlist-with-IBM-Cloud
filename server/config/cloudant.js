const { CloudantV1 } = require('@ibm-cloud/cloudant');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');

const cloudant = CloudantV1.newInstance({
    authenticator: new IamAuthenticator({
        apikey: process.env.CLOUDANT_APIKEY,
    }),
    serviceUrl: process.env.CLOUDANT_URL,
});

const DB_NAME = 'watchlist';

module.exports = { cloudant, DB_NAME };
