import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import { PuzzleCreated, PuzzleSolved } from "../generated/PuzzleGame/PuzzleGame"

export function createPuzzleCreatedEvent(
  puzzleDigest: BigInt,
  puzzleType: BigInt,
  data: string,
  author: Address,
  solutionCommitment: Address,
  maxSolvers: BigInt
): PuzzleCreated {
  let puzzleCreatedEvent = changetype<PuzzleCreated>(newMockEvent())

  puzzleCreatedEvent.parameters = new Array()

  puzzleCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "puzzleDigest",
      ethereum.Value.fromUnsignedBigInt(puzzleDigest)
    )
  )
  puzzleCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "puzzleType",
      ethereum.Value.fromUnsignedBigInt(puzzleType)
    )
  )
  puzzleCreatedEvent.parameters.push(
    new ethereum.EventParam("data", ethereum.Value.fromString(data))
  )
  puzzleCreatedEvent.parameters.push(
    new ethereum.EventParam("author", ethereum.Value.fromAddress(author))
  )
  puzzleCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "solutionCommitment",
      ethereum.Value.fromAddress(solutionCommitment)
    )
  )
  puzzleCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "maxSolvers",
      ethereum.Value.fromUnsignedBigInt(maxSolvers)
    )
  )

  return puzzleCreatedEvent
}

export function createPuzzleSolvedEvent(
  puzzleDigest: BigInt,
  solver: Address
): PuzzleSolved {
  let puzzleSolvedEvent = changetype<PuzzleSolved>(newMockEvent())

  puzzleSolvedEvent.parameters = new Array()

  puzzleSolvedEvent.parameters.push(
    new ethereum.EventParam(
      "puzzleDigest",
      ethereum.Value.fromUnsignedBigInt(puzzleDigest)
    )
  )
  puzzleSolvedEvent.parameters.push(
    new ethereum.EventParam("solver", ethereum.Value.fromAddress(solver))
  )

  return puzzleSolvedEvent
}
