var request = require('request')
var bitcoin = require('bitcoinjs-lib')
var coloredCoinsHost = 'http://api.coloredcoins.org/v2'

var Coloredcoinsd = function (settings) {
  settings = settings || {}
  this.coloredCoinsHost = settings.coloredCoinsHost || coloredCoinsHost
}

var handleResponse = function (cb) {
  return function (err, response, body) {
    if (err) return cb(err)
    if (response.statusCode !== 200) return cb(body)
    cb(null, JSON.parse(body))
  }
}

Coloredcoinsd.prototype.issue = function (args, cb) {
  request.post(this.coloredCoinsHost + '/issue', {form: args}, handleResponse(cb))
}

Coloredcoinsd.prototype.sendasset = function (args, cb) {
  request.post(this.coloredCoinsHost + '/sendasset', {form: args}, handleResponse(cb))
}

Coloredcoinsd.prototype.broadcast = function (args, cb) {
  request.post(this.coloredCoinsHost + '/broadcast', {form: args}, handleResponse(cb))
}

Coloredcoinsd.prototype.addressinfo = function (address, cb) {
  request.get(this.coloredCoinsHost + '/addressinfo/' + address, handleResponse(cb))
}

Coloredcoinsd.prototype.stakeholders = function (assetId, numConfirmations, cb) {
  if (typeof numConfirmations === 'function') {
    cb = numConfirmations
    numConfirmations = 0
  }
  request.get(this.coloredCoinsHost + '/stakeholders/' + assetId + '/' + numConfirmations, handleResponse(cb))
}

Coloredcoinsd.prototype.assetmetadata = function (assetId, utxo, cb) {
  if (typeof utxo === 'function') {
    cb = utxo
    utxo = 0
  }
  request.get(this.coloredCoinsHost + '/assetmetadata/' + assetId + '/' + utxo, handleResponse(cb))
}

Coloredcoinsd.signTx = function (unsignedTx, privateKey) {
  var tx = bitcoin.Transaction.fromHex(unsignedTx)
  var txb = bitcoin.TransactionBuilder.fromTransaction(tx)
  var insLength = tx.ins.length
  for (var i = 0; i < insLength; i++) {
    if (Array.isArray(privateKey)) {
      txb.sign(i, privateKey[i])
    } else {
      txb.sign(i, privateKey)
    }
  }
  tx = txb.build()
  return tx.toHex()
}

module.exports = Coloredcoinsd
