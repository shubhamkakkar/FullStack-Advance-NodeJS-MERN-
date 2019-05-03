const credentials = require("../credentials")

module.exports = {
  googleClientID: credentials.client_id,
  googleClientSecret: credentials.clientSecret,
  mongoURI: `mongodb+srv://shubhamkakkar:${credentials.password}@cluster0-ws4ql.mongodb.net/test?retryWrites=true`,
  cookieKey: '123123123'
};
