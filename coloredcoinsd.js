var request = require('request')
var bitcoin = require('bitcoinjs-lib')
var coloredCoinsHost = 'http://api.coloredcoins.org/v2'

var Coloredcoinsd = function (settings) {
  this.coloredCoinsHost = settings.coloredCoinsHost || coloredCoinsHost
}

var handleResponse = function (cb) {
  return function (err, response, body) {
    if (err) return cb(err)
    if (response.statusCode !== 200) return cb(body)
    cb(null, JSON.parse(body))
  }
}

Coloredcoinsd.prototype.getIssueAssetTx = function (args, cb) {
  request.post(this.coloredCoinsHost + '/issue', {form: args}, handleResponse(cb))
}

Coloredcoinsd.prototype.getSendAssetTx = function (args, cb) {
  request.post(this.coloredCoinsHost + '/sendasset', {form: args}, handleResponse(cb))
}

Coloredcoinsd.prototype.broadcastTx = function (args, cb) {
  request.post(this.coloredCoinsHost + '/broadcast', {form: args}, handleResponse(cb))
}

Coloredcoinsd.prototype.getAddressInfo = function (address, cb) {
  request.get(this.coloredCoinsHost + '/addressinfo/' + address, handleResponse(cb))
}

Coloredcoinsd.prototype.getStakeHolders = function (assetId, numConfirmations, cb) {
  if (typeof numConfirmations === 'function') {
    cb = numConfirmations
    numConfirmations = 0
  }
  request.get(this.coloredCoinsHost + '/stakeholders/' + assetId + '/' + numConfirmations, handleResponse(cb))
}

Coloredcoinsd.prototype.getAssetMetadata = function (assetId, utxo, cb) {
  if (typeof utxo === 'function') {
    cb = utxo
    utxo = 0
  }
  request.get(this.coloredCoinsHost + '/assetmetadata/' + assetId + '/' + utxo, handleResponse(cb))
}

Coloredcoinsd.signTx = function (unsignedTx, privateKey) {
  var tx = bitcoin.Transaction.fromHex(unsignedTx)
  var insLength = tx.ins.length
  for (var i = 0; i < insLength; i++) {
    if (Array.isArray(privateKey)) {
      tx.sign(i, privateKey[i])
    } else {
      tx.sign(i, privateKey)
    }
  }
  return tx.toHex()
}

module.exports = Coloredcoinsd
