const passport = require('passport');
const { WebAppStrategy } = require('ibmcloud-appid');

function configurePassport() {
    passport.serializeUser((user, cb) => cb(null, user));
    passport.deserializeUser((obj, cb) => cb(null, obj));

    passport.use(new WebAppStrategy({
        tenantId: process.env.APPID_TENANT_ID,
        clientId: process.env.APPID_CLIENT_ID,
        secret: process.env.APPID_SECRET,
        oauthServerUrl: process.env.APPID_OAUTH_SERVER_URL,
        redirectUri: process.env.REDIRECT_URI,
    }));
}

module.exports = { configurePassport };
