/* eslint-disable indent */
import { Coordinate } from "./Coordinate";

import LibLogger from "@/logger";

const logger = LibLogger.get("Definition");

export interface Definition<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> {
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>;
}

export const createDefinition = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
>(
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
): Definition<S, L1, L2, L3, L4, L5> => {

  logger.debug("createDefinition", { coordinate });

  return {
    coordinate,
  };
}
