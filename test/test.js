var CC = require(__dirname + '/../src/coloredcoinsd.js')
var assert = require('assert')
var expect = require('chai').expect
var bitcoin = require('bitcoinjs-lib')

var testnetApi = 'https://testnet.api.coloredcoins.org'

describe('Test coloredcoinsd', function () {
	var cc = new CC({coloredCoinsHost: testnetApi})

	var fromAddress = 'mxNTyQ3WdFMQE7SGVpSQGXnSDevGMLq7dg'
	var toAddress = 'mgNcWJp4hPd7MN6ets2P8HcB5k99aCs8cy'
	var assetId = 'UeqXdjE86VRj4USYSn7hR95c9xqhmjb4Dv'
	// var assetId = 'U65kcsfBLBodSaBi9185FPzWf7SimUDiNyCxR'
	var utxo = 'c0d67e1b9de56508a30d22e8776b06aaff74eedd9f516ce2bd425841738bb1f3:0'
	var unsigntx = '010000000185f536693cf2455b947962e831767276de378864d6fff79e754b4328ec25a2d60100000000ffffffff0358020000000000001976a9140964477fbc5bcce8c2ddbd8b4c705ef60c5a91e788ac00000000000000000a6a08434301050100011060800100000000001976a9143dccfff7d33c163957d94949789baf660bed5a6c88ac00000000'
	var expectedsigntx = '010000000185f536693cf2455b947962e831767276de378864d6fff79e754b4328ec25a2d6010000006a47304402205aafb3f798d5dd82e6973e5828b62d96607a09651f9499c472457cea97b7d8e9022046f86612ad908d80915245bc74346c8477d6b47006d1ced7efd757b13b79e2be01210240042f2cfb410b4fab76a33dd36376fc752b03ee6f14708da6cd4d306670068bffffffff0358020000000000001976a9140964477fbc5bcce8c2ddbd8b4c705ef60c5a91e788ac00000000000000000a6a08434301050100011060800100000000001976a9143dccfff7d33c163957d94949789baf660bed5a6c88ac00000000'
	var errorMsg = 'Bitcoind: Status code was Error: transaction already in block chain'
	var privateKey = bitcoin.ECKey.fromWIF('cQ176k8LDck5aNJTQcXd7G4rCqGM3jhJyZ7MNawyzAfaWuVpP5Xb')

	it('Should create issue tx.', function (done) {
		this.timeout(5000)
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
	  }
		cc.issue(args, function (err, ans) {
			if (err) console.error(err)
			assert(!err)
			expect(ans.txHex).to.be.a('string')
      expect(ans.txHex).to.have.length.above(0)
			expect(ans.assetId).to.be.a('string')
      expect(ans.assetId).to.have.length.above(0)
			done()
		})
	})

	it('Should create send tx.', function (done) {
		this.timeout(5000)
		var args = {
	    from: fromAddress,
	    amount: 1,
	    fee: 1000,
	    to: [
	      {
	        address: toAddress,
	        amount: 1,
	        assetId: assetId
	      }
	    ],
	  }
		cc.sendasset(args, function (err, ans) {
			if (err) console.error(err)
			assert(!err)
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
		cc.broadcast(args, function (err, ans) {
			assert(err)
			assert(JSON.parse(err).error == errorMsg)
			done()
		})
	})

	it('Should get address info.', function (done) {
		this.timeout(5000)
		
		cc.addressinfo(fromAddress, function (err, ans) {
			if (err) console.error(err)
			assert(!err)
			assert(ans.address == fromAddress)
      expect(ans.utxos).to.have.length.above(0)
			done()
		})
	})

	it('Should get stakeholders.', function (done) {
		this.timeout(5000)
		
		cc.stakeholders(assetId, function (err, ans) {
			if (err) console.error(err)
			assert(!err)
			assert(ans.assetId == assetId)
      expect(ans.holders).to.have.length.above(0)
			done()
		})
	})

	it('Should get assetmetadata.', function (done) {
		this.timeout(5000)
		
		cc.assetmetadata(assetId, utxo, function (err, ans) {
			if (err) console.error(err)
			assert(!err)
			assert(ans.assetId == assetId)
			expect(ans.issuanceTxid).to.be.a('string')
      expect(ans.issuanceTxid).to.have.length.above(0)
			done()
		})
	})

	it('Should sign a tx.', function (done) {
		
		var signtx = CC.signTx(unsigntx, privateKey)
		assert(signtx == expectedsigntx)
		done()
	})

})
