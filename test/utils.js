const divider = ethers.utils.bigNumberify('1000000');
const WAD = ethers.utils.bigNumberify('1000000000000000000');

function getDaiToTrib(v, tr, sp) {
  const fee = v.div(10);
  const totalTokens = calculateReserveToTokens(v, tr, sp);
  const taxedTokens = calculateReserveToTokens(fee, tr, sp);
  return totalTokens.sub(taxedTokens);
}

function calculateReserveToTokens(rd, tr, sp) {
  const reserveDelta = rd;
  const totalReserve = tr;
  const supply = sp;

  const newReserve = totalReserve.add(reserveDelta);
  // s = sqrt(2 * r / m)
  const newSupply = sqrt(
    newReserve
      .mul(ethers.utils.bigNumberify('2'))
      .mul(divider) // inverse the opration (divider instead of multiplier)
      .mul(WAD) // compensation for the squared unit
  );

  return newSupply.sub(supply);
}

function getTribToDai(sd, sp, tr) {
  const daiValue = calculateTokensToReserve(sd, sp, tr);
  return daiValue.sub(daiValue.div(10));
}

function calculateTokensToReserve(sd, sp, tr) {
  const supplyDelta = sd;
  const supply = sp;
  const totalReserve = tr;

  const newSupply = supply.sub(supplyDelta);
  // r = s^2 * m / 2
  let newReserve = newSupply
    .mul(newSupply)
    .div(divider) // inverse the operation (divider instead of multipler)
    .div(2);

  newReserve = roundedDiv(newReserve, WAD); // correction of the squared unit
  return totalReserve.sub(newReserve);
}

function sqrt(x) {
  let z = x.add(1).div(2);
  let y = x;
  while (z.lt(y)) {
    y = z;
    z = x.div(z).add(z).div(2);
  }
  return y;
}

function roundedDiv(a, b) {
  let halfB = b.mod(2) === 0 ? b.div(2) : b.div(2).add(1);
  return a.mod(b) >= halfB ? a.div(b).add(1) : a.div(b);
}

module.exports = {
  calculateReserveToTokens,
  calculateTokensToReserve,
  getDaiToTrib,
  getTribToDai,
};
