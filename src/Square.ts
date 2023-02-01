import {
  Field, // native "number" type if snarky
  SmartContract,
  state, // referenced to state onchain *decorator*
  State, // create state onchain
  method, // create onchain methods *decorator*
  //DeployArgs,     // args passed to the new Smart Contract
  //Permissions,    // methods for manipulating zkApps
} from 'snarkyjs';

export class Square extends SmartContract {
  @state(Field) num = State<Field>();

  init() {
    super.init();
    this.num.set(Field(3));
  }

  @method update(square: Field) {
    const currentState = this.num.get();
    this.num.assertEquals(currentState);

    square.assertEquals(currentState.mul(currentState));
    this.num.set(square);
  }
}
