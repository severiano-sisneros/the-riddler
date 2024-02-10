import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { PuzzleCreated } from "../generated/schema"
import { PuzzleCreated as PuzzleCreatedEvent } from "../generated/PuzzleGame/PuzzleGame"
import { handlePuzzleCreated } from "../src/puzzle-game"
import { createPuzzleCreatedEvent } from "./puzzle-game-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let puzzleDigest = BigInt.fromI32(234)
    let puzzleType = BigInt.fromI32(234)
    let data = "Example string value"
    let author = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let solutionCommitment = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let maxSolvers = BigInt.fromI32(234)
    let newPuzzleCreatedEvent = createPuzzleCreatedEvent(
      puzzleDigest,
      puzzleType,
      data,
      author,
      solutionCommitment,
      maxSolvers
    )
    handlePuzzleCreated(newPuzzleCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("PuzzleCreated created and stored", () => {
    assert.entityCount("PuzzleCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "PuzzleCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "puzzleDigest",
      "234"
    )
    assert.fieldEquals(
      "PuzzleCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "puzzleType",
      "234"
    )
    assert.fieldEquals(
      "PuzzleCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "data",
      "Example string value"
    )
    assert.fieldEquals(
      "PuzzleCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "author",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "PuzzleCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "solutionCommitment",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "PuzzleCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "maxSolvers",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
