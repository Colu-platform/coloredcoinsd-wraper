var request = require('request')
var bitcoin = require('bitcoinjs-lib')
var async = require('async')

var mainnetColuHost = 'https://engine.colu.co'
var testnetColuHost = 'https://testnet.engine.colu.co'

var Coloredcoinsd = function (settings) {
  settings = settings || {}

  if (settings.network === 'testnet') {
    this.coluHost = settings.coluHost || testnetColuHost
    this.network = bitcoin.networks.testnet
  } else {
    this.coluHost = settings.coluHost || mainnetColuHost
    this.network = bitcoin.networks.bitcoin
  }
}

var handleResponse = function (cb) {
  return function (err, response, body) {
    if (err) return cb(err)
    if (body && typeof body === 'string') {
      body = JSON.parse(body)
    } else {
      body = body || {}
    }
    if (response.statusCode !== 200) {
      body.statusCode = response.statusCode
      return cb(body)
    }
    cb(null, body)
  }
}

Coloredcoinsd.prototype.getIssueAssetTx = function (args, cb) {
  var params = {
    func: 'issue',
    params: args
  }
  request.post(this.coluHost + '/coloredcoins', {json: params}, handleResponse(cb))
}

Coloredcoinsd.prototype.getSendAssetTx = function (args, cb) {
  var params = {
    func: 'sendasset',
    params: args
  }
  request.post(this.coluHost + '/coloredcoins', {json: params}, handleResponse(cb))
}

Coloredcoinsd.prototype.broadcastTx = function (args, cb) {
  var params = {
    func: 'broadcast',
    params: args
  }
  request.post(this.coluHost + '/coloredcoins', {json: params}, handleResponse(cb))
}

Coloredcoinsd.prototype.getAddressInfo = function (address, cb) {
  request.get(this.coluHost + '/coloredcoins?func=addressinfo&address=' + address, handleResponse(cb))
}

Coloredcoinsd.prototype.getStakeHolders = function (assetId, numConfirmations, cb) {
  if (typeof numConfirmations === 'function') {
    cb = numConfirmations
    numConfirmations = 0
  }
  request.get(this.coluHost + '/coloredcoins?func=stakeholders&assetId=' + assetId + '&numConfirmations=' + numConfirmations, handleResponse(cb))
}

Coloredcoinsd.prototype.getAssetMetadata = function (assetId, utxo, cb) {
  if (typeof utxo === 'function') {
    cb = utxo
    utxo = 0
  }
  request.get(this.coluHost + '/coloredcoins?func=assetmetadata&assetId=' + assetId + '&utxo=' + utxo, handleResponse(cb))
}

Coloredcoinsd.prototype.getAssetData = function (args, cb) {
  var self = this

  var assetId = args.assetId || null
  if (assetId == null) return cb('Needs assetId')
  var addresses = args.addresses || null
  var numConfirmations = args.numConfirmations || 0
  var ans = {
    assetId: assetId,
    assetAmount: 0,
    assetTotalAmount: 0,
    assetData: []
  }
  var assetAddresses = []

  async.waterfall([
    function (callback) {
      self.getStakeHolders(assetId, numConfirmations, callback)
    },
    function (holders, callback) {
      holders.holders.forEach(function (holder) {
        ans.assetTotalAmount += holder.amount
        if (!addresses || addresses.indexOf(holder.address) !== -1) {
          ans.assetAmount += holder.amount
          if (assetAddresses.indexOf(holder.address) === -1) {
            assetAddresses.push(holder.address)
          }
        }
      })
      async.each(assetAddresses, function (assetAddress, callback) {
        self.getAddressInfo(assetAddress, function (err, addressInfo) {
          if (err) return callback(err)
          async.each(addressInfo.utxos, function (utxo, callback) {
            var txid = utxo.txid
            var index = utxo.index
            var utxoIndex = txid + ':' + index
            async.each(utxo.assets, function (asset, callback) {
              if (!asset.assetId || asset.assetId !== assetId) return callback()
              self.getAssetMetadata(assetId, utxoIndex, function (err, meta) {
                if (err) return callback(err)
                var amount = 0
                if (asset.amount) {
                  amount = asset.amount
                }
                ans.assetData.push({
                  address: assetAddress,
                  amount: amount,
                  utxo: utxoIndex,
                  metadata: meta
                })
                callback()
              })
            }, callback)
          }, callback)
        })
      }, callback)
    }
  ],
  function (err) {
    if (err) return cb(err)
    cb(null, ans)
  })
}

Coloredcoinsd.signTx = function (unsignedTx, privateKey) {
  var tx = bitcoin.Transaction.fromHex(unsignedTx)
  var txb = bitcoin.TransactionBuilder.fromTransaction(tx)
  var insLength = tx.ins.length
  for (var i = 0; i < insLength; i++) {
    txb.inputs[i].scriptType = null
    if (Array.isArray(privateKey)) {
      txb.sign(i, privateKey[i])
    } else {
      txb.sign(i, privateKey)
    }
  }
  tx = txb.build()
  return tx.toHex()
}

Coloredcoinsd.getInputAddresses = function (txHex, network) {
  network = network || bitcoin.networks.bitcoin
  var addresses = []
  var tx
  try {
    tx = bitcoin.Transaction.fromHex(txHex)
  } catch (err) {
    console.error('Coloredcoinsd.getInputAddresses: ', txHex)
    console.error(err)
    return null
  }
  tx.ins.forEach(function (input) {
    if (!input.script) return addresses.push(null)
    if (bitcoin.scripts.isPubKeyHashOutput(input.script)) return addresses.push(new bitcoin.Address(input.script.chunks[2], network.pubKeyHash).toString())
    if (bitcoin.scripts.isScriptHashOutput(input.script)) return addresses.push(new bitcoin.Address(input.script.chunks[1], network.scriptHash).toString())
    return addresses.push(null)
  })
  return addresses
}

module.exports = Coloredcoinsd
