import { useState } from "react";
import server from "./server";
import * as secp from "@noble/secp256k1";
import {utf8ToBytes} from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

function Transfer({ address, setBalance, privateKey }) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  function onChangeAmount(evt) {
    const amount = evt.target.value;
    setAmount(amount);
  }

  function onChangeRecipient(evt) {
    const rec = evt.target.value;
    setRecipient(rec);
  }

  async function transfer(evt) {
    evt.preventDefault();

    const data = { sender: address, recipient, amount: parseInt(amount)};
    const bytes = utf8ToBytes(JSON.stringify(data));   
    const hash = keccak256(bytes);
    const signature = await secp.sign(hash, privateKey, {recovered: true});
    var sig = Array.from(signature[0]);

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {...data, signature: sig, recoveryBit: signature[1]});
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={amount}
          onChange={onChangeAmount}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={onChangeRecipient}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
