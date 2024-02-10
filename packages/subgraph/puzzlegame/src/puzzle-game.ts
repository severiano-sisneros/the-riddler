import {
  PuzzleCreated as PuzzleCreatedEvent,
  PuzzleSolved as PuzzleSolvedEvent
} from "../generated/PuzzleGame/PuzzleGame"
import { PuzzleCreated, PuzzleSolved } from "../generated/schema"

export function handlePuzzleCreated(event: PuzzleCreatedEvent): void {
  let entity = new PuzzleCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.puzzleDigest = event.params.puzzleDigest
  entity.puzzleType = event.params.puzzleType
  entity.data = event.params.data
  entity.author = event.params.author
  entity.solutionCommitment = event.params.solutionCommitment
  entity.maxSolvers = event.params.maxSolvers

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePuzzleSolved(event: PuzzleSolvedEvent): void {
  let entity = new PuzzleSolved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.puzzleDigest = event.params.puzzleDigest
  entity.solver = event.params.solver

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
