const express = require("express");
const secp = require("@noble/secp256k1");
const {toHex, utf8ToBytes} = require ("ethereum-cryptography/utils");
const { keccak256 } = require ("ethereum-cryptography/keccak");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0462ed381bbf383ad0e0d511223ecac5b46c9e72bc6d09ac54e1c4d7712e541d3eb1c054db9413426a68d79ed3cfd3ff8b1d97c1d5a700b02132a19a99ae64385d": 100,
  "0449110081e24a97518b8bc72f442d3186204f66a3fe3cab2db408dda0957ca5405a1b2348788885953fbbe0a3a450a1d0b45a941b4ee6945cfc7ddb74fb7f9a37": 50,
  "04925be284e1e6c7cf469a9ee76a2b348830e5ddc981959c20cf20038558d784320a9879aee63a0f95c198bf1e9d60705d85d79de87925a13938a06094479a62f2": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature, recoveryBit } = req.body;

  if(!signature) res.status(404).send({ message: "signature dont was provide" });
  if(!recoveryBit) res.status(400).send({ message: "recovery dont was provide" });

  try {

    const bytes = utf8ToBytes(JSON.stringify({ sender, recipient, amount }));
    const hash = keccak256(bytes);
    const sig = new Uint8Array(signature);

    const publicKey = secp.recoverPublicKey(hash, sig, recoveryBit);

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
  } catch(error) {
    console.log(error.message);
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
