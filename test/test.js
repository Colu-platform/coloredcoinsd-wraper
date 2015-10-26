var CC = require(__dirname + '/../coloredcoinsd.js')
var assert = require('assert')
var expect = require('chai').expect
var bitcoin = require('bitcoinjs-lib')

describe('Test coloredcoinsd', function () {
  var cc = new CC({
    network: 'testnet'
  })

  var fromAddress = 'mxNTyQ3WdFMQE7SGVpSQGXnSDevGMLq7dg'
  var expectedAddress = 'mm9j6Pxp2LqAqVHqj7DBit724A6P8sk5yA'
  var toAddress = 'mgNcWJp4hPd7MN6ets2P8HcB5k99aCs8cy'
  var assetId = 'U8TTNqWAeTzVbUsEToyFECxm45AZg6u4W7XFL'
  var utxo = 'c0d67e1b9de56508a30d22e8776b06aaff74eedd9f516ce2bd425841738bb1f3:0'
  var unsigntx = '0100000001d542409c9006cf73af5a09fa6814156b635b57a7c8929c7ad6d514254bb6d108020000001976a9143dccfff7d33c163957d94949789baf660bed5a6c88acffffffff0358020000000000001976a9140964477fbc5bcce8c2ddbd8b4c705ef60c5a91e788ac00000000000000000a6a084343010501000110207a0100000000001976a9143dccfff7d33c163957d94949789baf660bed5a6c88ac00000000'
  var expectedsigntx = '0100000001d542409c9006cf73af5a09fa6814156b635b57a7c8929c7ad6d514254bb6d108020000006a47304402207b67c24b1602aef5e9da57685a1bf19ad4267f331ef061cfeace70ba7ab119b302206928a96dc9a86c443190759fddf2e372aed450305954a2db9deb36dc2a6115fd01210240042f2cfb410b4fab76a33dd36376fc752b03ee6f14708da6cd4d306670068bffffffff0358020000000000001976a9140964477fbc5bcce8c2ddbd8b4c705ef60c5a91e788ac00000000000000000a6a084343010501000110207a0100000000001976a9143dccfff7d33c163957d94949789baf660bed5a6c88ac00000000'
  var errorMsg = 'Bitcoind: Status code was Error: transaction already in block chain'
  var privateKey = bitcoin.ECKey.fromWIF('cQ176k8LDck5aNJTQcXd7G4rCqGM3jhJyZ7MNawyzAfaWuVpP5Xb')

  it('Should create issue tx.', function (done) {
    this.timeout(60000)
    var args = {
      issueAddress: fromAddress,
      amount: 1,
      divisibility: 0,
      fee: 1000,
      reissueable: false,
      transfer: [
        {
          address: toAddress,
          amount: 1
        }
      ],
      flags: {
        injectPreviousOutput: true
      }
    }
    cc.getIssueAssetTx(args, function (err, ans) {
      assert.ifError(err)
      expect(ans.txHex).to.be.a('string')
      expect(ans.txHex).to.have.length.above(0)
      expect(ans.assetId).to.be.a('string')
      expect(ans.assetId).to.have.length.above(0)
      done()
    })
  })

  it('Should create send tx.', function (done) {
    this.timeout(15000)
    var args = {
      from: [fromAddress],
      amount: 1,
      fee: 1000,
      to: [
        {
          address: toAddress,
          amount: 1,
          assetId: assetId
        }
      ]
    }
    cc.getSendAssetTx(args, function (err, ans) {
      assert.ifError(err)
      expect(ans.txHex).to.be.a('string')
      expect(ans.txHex).to.have.length.above(0)
      done()
    })
  })

  it('Should broadcast a tx.', function (done) {
    this.timeout(5000)
    var args = {
      txHex: expectedsigntx
    }
    cc.broadcastTx(args, function (err, ans) {
      assert(err)
      console.log('err', err)
      assert(err.error === errorMsg)
      done()
    })
  })

  it('Should get address info.', function (done) {
    this.timeout(5000)

    cc.getAddressInfo(fromAddress, function (err, ans) {
      assert.ifError(err)
      assert(ans.address === fromAddress)
      expect(ans.utxos).to.have.length.above(0)
      done()
    })
  })

  it('Should get stakeholders.', function (done) {
    this.timeout(5000)

    cc.getStakeHolders(assetId, function (err, ans) {
      assert.ifError(err)
      assert(ans.assetId === assetId)
      expect(ans.holders).to.have.length.above(0)
      done()
    })
  })

  it('Should get assetmetadata.', function (done) {
    this.timeout(5000)

    cc.getAssetMetadata(assetId, utxo, function (err, ans) {
      assert.ifError(err)
      assert(ans.assetId === assetId)
      expect(ans.issuanceTxid).to.be.a('string')
      expect(ans.issuanceTxid).to.have.length.above(0)
      done()
    })
  })

  it('Should sign a tx.', function (done) {
    var signtx = CC.signTx(unsigntx, privateKey)
    assert(signtx === expectedsigntx)
    done()
  })

  it('Should find a tx addresses to sign.', function (done) {
    var addresses = CC.getInputAddresses(unsigntx, cc.network)
    expect(addresses).to.be.a('array')
    assert.equal(addresses.length, 1, 'Addresses array should contain only one address.')
    assert.equal(addresses[0], expectedAddress, 'Addresses array should contain the expected address.')
    done()
  })

  it('Should get assetdata.', function (done) {
    this.timeout(10000)

    var args = {
      assetId: assetId,
      addresses: [fromAddress],
      numConfirmations: 0
    }
    cc.getAssetData(args, function (err, ans) {
      assert.ifError(err)
      expect(ans).to.have.property('assetAmount')
      expect(ans).to.have.property('assetTotalAmount')
      expect(ans).to.have.property('assetData')
      done()
    })
  })

})
