const Service = require('./service.js');

const token = {
  addr: '0xe469c4473af82217b30cf17b10bcdb6c8c796e75',
  decimals: 18,
};

const user = {
  addr: '',
  pk: '',
};

const config = {
  addressEtherDelta: '0x8d12a197cb00d4747a1fe03395095ce2a5cc6819',
  provider: 'https://mainnet.infura.io/Ky03pelFIxoZdAUsr82w',
  socketURL: 'https://socket04.etherdelta.com',
  gasLimit: 150000,
  gasPrice: 4000000000,
};

const service = new Service();
service.init(config)
.then(() => service.waitForMarket(token, user))
.then(() => {
  service.printOrderBook();
  service.printTrades();
  return Promise.all([
    service.getBalance('ETH', user),
    service.getBalance(token, user),
    service.getEtherDeltaBalance('ETH', user),
    service.getEtherDeltaBalance(token, user),
  ]);
})
.then((results) => {
  const [walletETH, walletToken, EtherDeltaETH, EtherDeltaToken] = results;
  console.log(`Balance (wallet, ETH): ${service.toEth(walletETH, 18).toNumber().toFixed(3)}`);
  console.log(`Balance (ED, ETH): ${service.toEth(EtherDeltaETH, 18).toNumber().toFixed(3)}`);
  console.log(`Balance (wallet, token): ${service.toEth(walletToken, token.decimals).toNumber().toFixed(3)}`);
  console.log(`Balance (ED, token): ${service.toEth(EtherDeltaToken, token.decimals).toNumber().toFixed(3)}`);
  const order = service.state.orders.sells[0];
  console.log(`Best available: Sell ${order.ethAvailableVolume.toFixed(3)} @ ${order.price.toFixed(9)}`);
  const desiredAmountBase = 0.001;
  const fraction = Math.min(desiredAmountBase / order.ethAvailableVolumeBase, 1);
  return service.takeOrder(user, order, fraction, config.gasPrice, config.gasLimit);
})
.then((result) => {
  console.log('Result: '+result);
  process.exit();
})
.catch((err) => {
  console.log(err);
  process.exit();
});
