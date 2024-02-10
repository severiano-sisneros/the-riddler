// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt,
} from "@graphprotocol/graph-ts";

export class PuzzleCreated extends ethereum.Event {
  get params(): PuzzleCreated__Params {
    return new PuzzleCreated__Params(this);
  }
}

export class PuzzleCreated__Params {
  _event: PuzzleCreated;

  constructor(event: PuzzleCreated) {
    this._event = event;
  }

  get puzzleDigest(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get puzzleType(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get data(): string {
    return this._event.parameters[2].value.toString();
  }

  get author(): Address {
    return this._event.parameters[3].value.toAddress();
  }

  get solutionCommitment(): Address {
    return this._event.parameters[4].value.toAddress();
  }

  get maxSolvers(): BigInt {
    return this._event.parameters[5].value.toBigInt();
  }
}

export class PuzzleSolved extends ethereum.Event {
  get params(): PuzzleSolved__Params {
    return new PuzzleSolved__Params(this);
  }
}

export class PuzzleSolved__Params {
  _event: PuzzleSolved;

  constructor(event: PuzzleSolved) {
    this._event = event;
  }

  get puzzleDigest(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get solver(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class PuzzleGame__checkIfSolverHasSolvedResult {
  value0: BigInt;
  value1: boolean;

  constructor(value0: BigInt, value1: boolean) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromBoolean(this.value1));
    return map;
  }

  getValue0(): BigInt {
    return this.value0;
  }

  getValue1(): boolean {
    return this.value1;
  }
}

export class PuzzleGame__getPuzzleResultValue0Struct extends ethereum.Tuple {
  get puzzleDigest(): BigInt {
    return this[0].toBigInt();
  }

  get numSolvers(): BigInt {
    return this[1].toBigInt();
  }
}

export class PuzzleGame__puzzlesResult {
  value0: BigInt;
  value1: BigInt;

  constructor(value0: BigInt, value1: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    return map;
  }

  getPuzzleDigest(): BigInt {
    return this.value0;
  }

  getNumSolvers(): BigInt {
    return this.value1;
  }
}

export class PuzzleGame extends ethereum.SmartContract {
  static bind(address: Address): PuzzleGame {
    return new PuzzleGame("PuzzleGame", address);
  }

  calculatePuzzleDigest(
    puzzleType: BigInt,
    data: string,
    author: Address,
    solutionCommitment: Address,
    maxSolvers: BigInt,
  ): BigInt {
    let result = super.call(
      "calculatePuzzleDigest",
      "calculatePuzzleDigest(uint256,string,address,address,uint256):(uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(puzzleType),
        ethereum.Value.fromString(data),
        ethereum.Value.fromAddress(author),
        ethereum.Value.fromAddress(solutionCommitment),
        ethereum.Value.fromUnsignedBigInt(maxSolvers),
      ],
    );

    return result[0].toBigInt();
  }

  try_calculatePuzzleDigest(
    puzzleType: BigInt,
    data: string,
    author: Address,
    solutionCommitment: Address,
    maxSolvers: BigInt,
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "calculatePuzzleDigest",
      "calculatePuzzleDigest(uint256,string,address,address,uint256):(uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(puzzleType),
        ethereum.Value.fromString(data),
        ethereum.Value.fromAddress(author),
        ethereum.Value.fromAddress(solutionCommitment),
        ethereum.Value.fromUnsignedBigInt(maxSolvers),
      ],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  checkIfSolverHasSolved(
    id: BigInt,
    solverAddress: Address,
  ): PuzzleGame__checkIfSolverHasSolvedResult {
    let result = super.call(
      "checkIfSolverHasSolved",
      "checkIfSolverHasSolved(uint256,address):(uint256,bool)",
      [
        ethereum.Value.fromUnsignedBigInt(id),
        ethereum.Value.fromAddress(solverAddress),
      ],
    );

    return new PuzzleGame__checkIfSolverHasSolvedResult(
      result[0].toBigInt(),
      result[1].toBoolean(),
    );
  }

  try_checkIfSolverHasSolved(
    id: BigInt,
    solverAddress: Address,
  ): ethereum.CallResult<PuzzleGame__checkIfSolverHasSolvedResult> {
    let result = super.tryCall(
      "checkIfSolverHasSolved",
      "checkIfSolverHasSolved(uint256,address):(uint256,bool)",
      [
        ethereum.Value.fromUnsignedBigInt(id),
        ethereum.Value.fromAddress(solverAddress),
      ],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new PuzzleGame__checkIfSolverHasSolvedResult(
        value[0].toBigInt(),
        value[1].toBoolean(),
      ),
    );
  }

  getPuzzle(id: BigInt): PuzzleGame__getPuzzleResultValue0Struct {
    let result = super.call(
      "getPuzzle",
      "getPuzzle(uint256):((uint256,uint256))",
      [ethereum.Value.fromUnsignedBigInt(id)],
    );

    return changetype<PuzzleGame__getPuzzleResultValue0Struct>(
      result[0].toTuple(),
    );
  }

  try_getPuzzle(
    id: BigInt,
  ): ethereum.CallResult<PuzzleGame__getPuzzleResultValue0Struct> {
    let result = super.tryCall(
      "getPuzzle",
      "getPuzzle(uint256):((uint256,uint256))",
      [ethereum.Value.fromUnsignedBigInt(id)],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      changetype<PuzzleGame__getPuzzleResultValue0Struct>(value[0].toTuple()),
    );
  }

  proofUsed(param0: BigInt): boolean {
    let result = super.call("proofUsed", "proofUsed(uint256):(bool)", [
      ethereum.Value.fromUnsignedBigInt(param0),
    ]);

    return result[0].toBoolean();
  }

  try_proofUsed(param0: BigInt): ethereum.CallResult<boolean> {
    let result = super.tryCall("proofUsed", "proofUsed(uint256):(bool)", [
      ethereum.Value.fromUnsignedBigInt(param0),
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  puzzleSolved(param0: BigInt): boolean {
    let result = super.call("puzzleSolved", "puzzleSolved(uint256):(bool)", [
      ethereum.Value.fromUnsignedBigInt(param0),
    ]);

    return result[0].toBoolean();
  }

  try_puzzleSolved(param0: BigInt): ethereum.CallResult<boolean> {
    let result = super.tryCall("puzzleSolved", "puzzleSolved(uint256):(bool)", [
      ethereum.Value.fromUnsignedBigInt(param0),
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  puzzles(param0: BigInt): PuzzleGame__puzzlesResult {
    let result = super.call("puzzles", "puzzles(uint256):(uint256,uint256)", [
      ethereum.Value.fromUnsignedBigInt(param0),
    ]);

    return new PuzzleGame__puzzlesResult(
      result[0].toBigInt(),
      result[1].toBigInt(),
    );
  }

  try_puzzles(param0: BigInt): ethereum.CallResult<PuzzleGame__puzzlesResult> {
    let result = super.tryCall(
      "puzzles",
      "puzzles(uint256):(uint256,uint256)",
      [ethereum.Value.fromUnsignedBigInt(param0)],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new PuzzleGame__puzzlesResult(value[0].toBigInt(), value[1].toBigInt()),
    );
  }

  verify_signature(
    solver_message: Address,
    signature: Array<BigInt>,
    signer_address: Address,
  ): boolean {
    let result = super.call(
      "verify_signature",
      "verify_signature(address,uint256[3],address):(bool)",
      [
        ethereum.Value.fromAddress(solver_message),
        ethereum.Value.fromUnsignedBigIntArray(signature),
        ethereum.Value.fromAddress(signer_address),
      ],
    );

    return result[0].toBoolean();
  }

  try_verify_signature(
    solver_message: Address,
    signature: Array<BigInt>,
    signer_address: Address,
  ): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "verify_signature",
      "verify_signature(address,uint256[3],address):(bool)",
      [
        ethereum.Value.fromAddress(solver_message),
        ethereum.Value.fromUnsignedBigIntArray(signature),
        ethereum.Value.fromAddress(signer_address),
      ],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }
}

export class CreatePuzzleCall extends ethereum.Call {
  get inputs(): CreatePuzzleCall__Inputs {
    return new CreatePuzzleCall__Inputs(this);
  }

  get outputs(): CreatePuzzleCall__Outputs {
    return new CreatePuzzleCall__Outputs(this);
  }
}

export class CreatePuzzleCall__Inputs {
  _call: CreatePuzzleCall;

  constructor(call: CreatePuzzleCall) {
    this._call = call;
  }

  get puzzleType(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get data(): string {
    return this._call.inputValues[1].value.toString();
  }

  get solutionCommitment(): Address {
    return this._call.inputValues[2].value.toAddress();
  }

  get maxSolvers(): BigInt {
    return this._call.inputValues[3].value.toBigInt();
  }
}

export class CreatePuzzleCall__Outputs {
  _call: CreatePuzzleCall;

  constructor(call: CreatePuzzleCall) {
    this._call = call;
  }
}

export class SubmitProofCall extends ethereum.Call {
  get inputs(): SubmitProofCall__Inputs {
    return new SubmitProofCall__Inputs(this);
  }

  get outputs(): SubmitProofCall__Outputs {
    return new SubmitProofCall__Outputs(this);
  }
}

export class SubmitProofCall__Inputs {
  _call: SubmitProofCall;

  constructor(call: SubmitProofCall) {
    this._call = call;
  }

  get author(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get puzzleType(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get data(): string {
    return this._call.inputValues[2].value.toString();
  }

  get solutionCommitment(): Address {
    return this._call.inputValues[3].value.toAddress();
  }

  get maxSolvers(): BigInt {
    return this._call.inputValues[4].value.toBigInt();
  }

  get proof(): Array<BigInt> {
    return this._call.inputValues[5].value.toBigIntArray();
  }

  get m_s(): Address {
    return this._call.inputValues[6].value.toAddress();
  }
}

export class SubmitProofCall__Outputs {
  _call: SubmitProofCall;

  constructor(call: SubmitProofCall) {
    this._call = call;
  }
}
