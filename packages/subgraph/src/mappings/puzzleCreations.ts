import { Address } from "@graphprotocol/graph-ts";

import { PuzzleCreation as PuzzleCreationEvent } from "../types/PuzzleGame/PuzzleGame";
import { PuzzleCreation } from "../types/schema";


export function handleTransfer(event: TransferEvent): void {
  let transactionHash: string = event.transaction.hash.toHex();
  let transfer = new Transfer(transactionHash);
  transfer.from = event.params.from.toHex();
  transfer.to = event.params.to.toHex();
  transfer.value = event.params.value;
  transfer.save();

  let to: Address | null = event.transaction.to;
  if (to) {
    addToken(to.toHex());
  }
}
