import * as anchor from "@coral-xyz/anchor";
import { Idl, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import { Tweetbet } from "../target/types/tweetbet";

describe("tweetbet", () => {
  // 1) Standard Anchor provider setup
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // 2) Read the on-disk IDL JSON
  const idlPath = path.resolve(__dirname, "../target/idl/tweetbet.json");
  const rawIdl = fs.readFileSync(idlPath, "utf-8");
  const parsed = JSON.parse(rawIdl);

  // 3) Build the Program ID & patch full metadata
  const PROGRAM_ID = new PublicKey("2B2svDpRkLgqvvMGbRqMsPqMJAXSvW9JW3HsUXrtDw8Q");
  const fullIdl = {
    // start with everything the generated IDL had
    ...parsed,
    // overwrite or add the metadata block Anchor needs
    metadata: {
      address: PROGRAM_ID.toString(),
      name: parsed.name,
      version: parsed.version,
    },
  } as Idl;

  // 4) Instantiate the Program with our patched IDL
  const program = new Program<Tweetbet>(fullIdl, PROGRAM_ID, provider);

  it("Initializes a new pool", async () => {
    const tweetId = 1234567890;
    const threshold = 100;
    const [poolPda, poolBump] = await PublicKey.findProgramAddress(
      [Buffer.from("pool"), new anchor.BN(tweetId).toArrayLike(Buffer, "le", 8)],
      PROGRAM_ID
    );

    // invoke initializePool
    await program.methods
      .initializePool(new anchor.BN(tweetId), new anchor.BN(threshold), poolBump)
      .accounts({
        pool: poolPda,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // fetch and assert
    const poolAccount = await program.account.pool.fetch(poolPda);
    expect(poolAccount.tweetId.toNumber()).to.equal(tweetId);
    expect(poolAccount.threshold.toNumber()).to.equal(threshold);
    expect(poolAccount.totalOver.toNumber()).to.equal(0);
    expect(poolAccount.totalUnder.toNumber()).to.equal(0);
    expect(poolAccount.isSettled).to.be.false;
  });
});
