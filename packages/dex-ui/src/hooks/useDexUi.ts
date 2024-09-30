import { useContext } from "react";
import { DexUiContext } from "../contexts/dex-ui-provider";

export function useDexUi() {
  return useContext(DexUiContext);
}