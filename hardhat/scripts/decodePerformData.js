const { ethers } = require('hardhat');

const performData =
  '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000006000000000000000000000000db50d48c60920236bd9ce938d6ac48134c449259000000000000000000000000000000000000000000000000005ebd312a02aaaa0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000db50d48c60920236bd9ce938d6ac48134c44925900000000000000000000000000000000000000000000000000209108e670eaaa0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000db50d48c60920236bd9ce938d6ac48134c449259000000000000000000000000000000000000000000000000000766c7d74835550000000000000000000000000000000000000000000000000000000000000002000000000000000000000000db50d48c60920236bd9ce938d6ac48134c449259000000000000000000000000000000000000000000000000000766c7d74835550000000000000000000000000000000000000000000000000000000000000003000000000000000000000000db50d48c60920236bd9ce938d6ac48134c449259000000000000000000000000000000000000000000000000000032af151231ee0000000000000000000000000000000000000000000000000000000000000004000000000000000000000000db50d48c60920236bd9ce938d6ac48134c449259000000000000000000000000000000000000000000000000000025f6260af4de0000000000000000000000000000000000000000000000000000000000000005';

const decodePerformData = () => {
  const decodedPerformData = ethers.utils.defaultAbiCoder.decode(
    ['tuple(address,uint256,uint256)[]'],
    performData,
  );

  // Output the result
  console.log(decodedPerformData[0].map((x) => Number(x[1])));
  console.log(decodedPerformData[0].reduce((acc, x) => acc + Number(x[1]), 0));
};

decodePerformData();