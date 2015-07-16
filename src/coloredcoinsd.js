var request = require('request')
var bitcoin = require('bitcoinjs-lib')

var coloredCoinsHost = 'http://api.coloredcoins.org/v2'

var Coloredcoinsd = function (settings) {
	var self = this

	self.coloredCoinsHost = settings.coloredCoinsHost || coloredCoinsHost
}

Coloredcoinsd.prototype.issue = function (args, callback) {
  var self = this

  request.post(self.coloredCoinsHost + '/issue',
    {form: args},
    function (err, response, body) {
    	if (err) return callback(err)
    	if (response.statusCode != 200) return callback(body)
    	callback(null, JSON.parse(body))
    }
  )
}

Coloredcoinsd.prototype.sendasset = function (args, callback) {
  var self = this

  request.post(self.coloredCoinsHost + '/sendasset',
    {form: args},
    function (err, response, body) {
    	if (err) return callback(err)
    	if (response.statusCode != 200) return callback(body)
    	callback(null, JSON.parse(body))
    }
  )
}

Coloredcoinsd.prototype.broadcast = function (args, callback) {
  var self = this

  request.post(self.coloredCoinsHost + '/broadcast',
    {form: args},
    function (err, response, body) {
    	if (err) return callback(err)
    	if (response.statusCode != 200) return callback(body)
    	callback(null, JSON.parse(body))
    }
  )
}

Coloredcoinsd.prototype.addressinfo = function (address, callback) {
  var self = this

  request.get(self.coloredCoinsHost + '/addressinfo/'+address,
    function (err, response, body) {
    	if (err) return callback(err)
    	if (response.statusCode != 200) return callback(body)
    	callback(null, JSON.parse(body))
    }
  )
}

Coloredcoinsd.prototype.stakeholders = function (assetId, numConfirmations, callback) {
  var self = this

  if (typeof numConfirmations == 'function') {
  	callback = numConfirmations
  	numConfirmations = 0
  }

  request.get(self.coloredCoinsHost + '/stakeholders/'+assetId+'/'+numConfirmations,
    function (err, response, body) {
    	if (err) return callback(err)
    	if (response.statusCode != 200) return callback(body)
    	callback(null, JSON.parse(body))
    }
  )
}

Coloredcoinsd.prototype.assetmetadata = function (assetId, utxo, callback) {
  var self = this

  if (typeof utxo == 'function') {
  	callback = utxo
  	utxo = 0
  }

  request.get(self.coloredCoinsHost + '/assetmetadata/'+assetId+'/'+utxo,
    function (err, response, body) {
    	if (err) return callback(err)
    	if (response.statusCode != 200) return callback(body)
    	callback(null, JSON.parse(body))
    }
  )
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