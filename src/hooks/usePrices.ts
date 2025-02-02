import { BigNumber } from "@ethersproject/bignumber";
import { useQuery } from "react-query";
import { NetworkId } from "src/constants";
import { OHM_DAI_RESERVE_CONTRACT_DECIMALS, STAKING_CONTRACT_DECIMALS } from "src/constants/decimals";
import { parseBigNumber } from "src/helpers";
import { ohm_dai } from "src/helpers/AllBonds";
import { queryAssertion } from "src/helpers/react-query/queryAssertion";
import { assert } from "src/helpers/types/assert";
import { nonNullable } from "src/helpers/types/nonNullable";

import { useStaticPairContract } from "./useContract";
import { useCurrentIndex } from "./useCurrentIndex";

export const ohmPriceQueryKey = () => ["useOhmPrice"];

/**
 * Returns the market price of OHM.
 */
export const useOhmPrice = () => {
  const address = ohm_dai.getAddressForReserve(NetworkId.MAINNET);
  assert(address, "Contract should exist for NetworkId.MAINNET");

  const reserveContract = useStaticPairContract(address, NetworkId.MAINNET);

  return useQuery<number, Error>(ohmPriceQueryKey(), async () => {
    const [ohm, dai] = await reserveContract.getReserves();

    return parseBigNumber(dai.div(ohm), OHM_DAI_RESERVE_CONTRACT_DECIMALS);
  });
};

export const gohmPriceQueryKey = (marketPrice?: number, currentIndex?: BigNumber) =>
  ["useGOHMPrice", marketPrice, currentIndex].filter(nonNullable);

/**
 * Returns the calculated price of gOHM.
 */
export const useGohmPrice = () => {
  const { data: ohmPrice } = useOhmPrice();
  const { data: currentIndex } = useCurrentIndex();

  return useQuery<number, Error>(
    gohmPriceQueryKey(ohmPrice, currentIndex),
    async () => {
      queryAssertion(ohmPrice && currentIndex, gohmPriceQueryKey(ohmPrice, currentIndex));

      return parseBigNumber(currentIndex, STAKING_CONTRACT_DECIMALS) * ohmPrice;
    },
    { enabled: !!ohmPrice && !!currentIndex },
  );
};
