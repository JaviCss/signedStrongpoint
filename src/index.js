const express = require('express')
const OAuth = require('./oauth-1.0a')
const CryptoJS = require('./crypto-js')
const PORT = process.env.PORT || 4000
const app = express()
//config
app.set('port', PORT)
//midelware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
//routes
app.get('/sign', (req, res) => {
  res.send('hello')
  //res.json()
})
app.post('/sign.js', (req, res) => {
  const { domainBase, account_id, path, pathEncoded } = req.body
  const { consumeri, consumers, tokeni, tokens } = req.headers
  console.log(account_id)
  console.log('consumeri: ', consumeri)
  console.log('consumers: ', consumers)
  console.log('tokeni: ', tokeni)
  console.log('tokens: ', tokens)
  let dataSign = serviceNestsuite(domainBase, account_id, consumeri, consumers, tokeni, tokens, path, pathEncoded)
    res.json(dataSign) 
    console.log(pathEncoded)
    console.log(dataSign)

})
//start
app.listen(app.get('port'), () => {})

function serviceNestsuite(
  domainBase,
  account_id,
  consumer_key,
  consumer_secret,
  token_id,
  token_secret,
  path,
  pathEncoded
) {
 
  var restUrl = domainBase + path
  //OPTIONS CREATION
  var headerWithRealm = generateTbaHeader(
    restUrl,
    account_id,
    consumer_key,
    consumer_secret,
    token_id,
    token_secret
  )
  let urln = domainBase + pathEncoded
  let options = {
    url: urln,
    type: 'GET',
    headers: headerWithRealm,
    cors: false,
    contentType: 'application/json',
  }
  return options 
  
  function generateTbaHeader(
    domainBase,
    accountId,
    consumerKey,
    consumerSecret,
    tokenId,
    tokenSecret,
    httpMethod
  ) {

    httpMethod = httpMethod == undefined || httpMethod == null ? 'GET' : httpMethod
    var base_url = domainBase.split('?')[0]
    var query_params = domainBase.split('?')[1]
    var params = query_params.split('&')
    var parameters = {}
    for (var i = 0; i < params.length; i++) {
      parameters[params[i].split('=')[0]] = params[i].split('=')[1]
    }
    var token = {
      key: tokenId,
      secret: tokenSecret,
    }
    var oauth = new OAuth({
      consumer: {
        key: consumerKey,
        secret: consumerSecret,
      },
      signature_method: 'HMAC-SHA256',
      hash_function: function (base_string, key) {
        return CryptoJS.HmacSHA256(base_string, key).toString(
          CryptoJS.enc.Base64
        )
      },
    })
    var request_data = {
      url: base_url,
      method: httpMethod,
      data: parameters,
    }
    
    var headerWithRealm = oauth.toHeader(oauth.authorize(request_data, token))
    headerWithRealm.Authorization += ',realm="' + accountId + '"'
    return headerWithRealm
  }
}



