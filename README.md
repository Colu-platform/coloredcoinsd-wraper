# coloredcoinsd-wraper
[![Build Status](https://travis-ci.org/Colu-platform/coloredcoinsd-wraper.svg?branch=master)](https://travis-ci.org/Colu-platform/coloredcoinsd-wraper) [![Coverage Status](https://coveralls.io/repos/Colu-platform/coloredcoinsd-wraper/badge.svg?branch=master)](https://coveralls.io/r/Colu-platform/coloredcoinsd-wraper?branch=master) [![npm version](https://badge.fury.io/js/coloredcoinsd-wraper.svg)](http://badge.fury.io/js/coloredcoinsd-wraper) [![npm version](http://slack.coloredcoins.org/badge.svg)](http://slack.coloredcoins.org)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

### Installation

```sh
$ npm i coloredcoinsd-wraper
```

### Constructor

```js
var ColoredCoins = require('coloredcoinsd-wraper')

var cc = new ColoredCoins({
    coloredCoinsHost: 'optional'
})
```

### API's

```js
Coloredcoinsd.prototype.getIssueAssetTx(args, cb)
Coloredcoinsd.prototype.getSendAssetTx(args, cb)
Coloredcoinsd.prototype.broadcastTx(args, cb)
Coloredcoinsd.prototype.getAddressInfo(address, cb)
Coloredcoinsd.prototype.getStakeHolders(assetId, numConfirmations, cb)
Coloredcoinsd.prototype.getAssetMetadata(assetId, utxo, cb)
Coloredcoinsd.prototype.getAssetData(args, cb)
Coloredcoinsd.signTx(unsignedTx, privateKey)
```

### Testing

```sh
$ mocha
```
