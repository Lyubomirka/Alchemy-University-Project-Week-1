const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "04d9ca9e8a6095fdaf081faefe45155da851751c12910f314859a940f1f812e0c000e42ec83a15660c095d1042256b9e0e1d6fe703ef4030b5a0dc95d82cb1413c": 100,
  "04183253b7d8ada2bcc6e14d0d401576c5ca04f624188c6e0dac88dfa6667266a9c273d836eb9fcafc40547f8aff752ea47156a2036678bce8d68c9a04cf3566ce": 50,
  "0494514a4851efa7f870aef35d010de35890e355808228556894307b38787ee67dc71e22ed9af91dd90755fef4ebc856e10e5db6b08630b50ce85653dbbdb6030d": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { sender, recipient, amount, signature, recovery } = req.body;

  const bytes = utf8ToBytes(JSON.stringify({ sender, recipient, amount }));
  const hash = keccak256(bytes);
  const sig = new Uint8Array(signature);

  const publicKey = await secp.recoverPublicKey(hash, sig, recovery);

  if(toHex(publicKey) !== sender){
    res.status(400).send({ message: "signature is not valid" });
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
