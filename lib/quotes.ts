export interface Quote {
  id: number
  date: string // ISO date (YYYY-MM-DD) of when Satoshi wrote it
  source: string // where the quote originated
  text: string
  backstory: string // short context for when/why Satoshi wrote it
}

// Satoshi Nakamoto's writings, ordered chronologically by when they were
// published (cryptography mailing list, the whitepaper, P2P Foundation,
// BitcoinTalk forum posts, the genesis block coinbase, etc.).
//
// Sources & dates verified against the Satoshi Nakamoto Institute archive
// (satoshi.nakamotoinstitute.org). Each entry is one typing level, played
// in order so the quotes "come through in order of data".
export const levels: Quote[] = [
  {
    id: 1,
    date: "2008-10-31",
    source: "Cryptography mailing list — Bitcoin P2P e-cash paper announcement",
    text: "I've been working on a new electronic cash system that's fully peer-to-peer, with no trusted third party.",
    backstory:
      "The opening line of Satoshi's announcement email to the cryptography mailing list, sent on Halloween 2008 with the Bitcoin whitepaper attached. It was the first time anyone outside Satoshi's small circle of correspondents heard of Bitcoin.",
  },
  {
    id: 2,
    date: "2008-10-31",
    source: "Bitcoin whitepaper — Abstract",
    text: "We propose a solution to the double-spending problem using a peer-to-peer network. The network timestamps transactions by hashing them into an ongoing chain of hash-based proof-of-work, forming a record that cannot be changed without redoing the proof-of-work. The longest chain not only serves as proof of the sequence of events witnessed, but proof that it came from the largest pool of CPU power. As long as a majority of CPU power is controlled by nodes that are not cooperating to attack the network, they'll generate the longest chain and outpace attackers.",
    backstory:
      "The abstract of \"Bitcoin: A Peer-to-Peer Electronic Cash System,\" the nine-page whitepaper Satoshi attached to the announcement email. It proposed solving double-spending with a peer-to-peer network of proof-of-work — the core idea that became the Bitcoin network.",
  },
  {
    id: 3,
    date: "2008-10-31",
    source: "Bitcoin whitepaper — Introduction",
    text: "Commerce on the Internet has come to rely almost exclusively on financial institutions serving as trusted third parties to process electronic payments. While the system works well enough for most transactions, it still suffers from the inherent weaknesses of the trust based model. Completely non-reversible transactions are not really possible, since financial institutions cannot avoid mediating disputes. The cost of mediation increases transaction costs, limiting the minimum practical transaction size.",
    backstory:
      "The opening of the whitepaper's introduction, framing the problem Satoshi set out to solve: online commerce's reliance on trusted financial institutions and the costs and friction that mediation introduces. It's the motivation for everything that follows in the paper.",
  },
  {
    id: 4,
    date: "2008-10-31",
    source: "Bitcoin whitepaper — Introduction",
    text: "What we need is an electronic payment system based on cryptographic proof instead of trust, allowing any two willing parties to transact directly with each other without the need for a trusted third party. Transactions that are computationally impractical to reverse would protect sellers from fraud, and routine escrow mechanisms could easily be implemented to protect buyers. In this paper, we propose a solution to the double-spending problem using a peer-to-peer distributed timestamp server to generate computational proof of the chronological order of transactions.",
    backstory:
      "The proposed-solution paragraph of the introduction — the thesis statement of the entire whitepaper. Having laid out the trust problem in the previous passage, Satoshi here names the replacement: cryptographic proof, computationally impractical to reverse, with no trusted third party.",
  },
  {
    id: 5,
    date: "2008-10-31",
    source: "Bitcoin whitepaper — Section 11: Calculations",
    text: "We consider the scenario of an attacker trying to generate an alternate chain faster than the honest chain. Even if this is accomplished, it does not throw the system open to arbitrary changes, such as creating value out of thin air or taking money that never belonged to the attacker. Nodes are not going to accept an invalid transaction as payment, and honest nodes will never accept a block containing them. An attacker can only try to change one of his own transactions to take back money he recently spent.",
    backstory:
      "Section 11, \"Calculations,\" modeled the probability of an attacker overtaking the honest chain. This passage reassured readers that even a successful attacker couldn't forge coins or steal others' funds — the worst they could do is double-spend their own recent transactions.",
  },
  {
    id: 6,
    date: "2008-11-07",
    source: "Cryptography mailing list — Re: Bitcoin P2P e-cash paper",
    text: "Yes, we will not find a solution to political problems in cryptography, but we can win a major battle in the arms race and gain a new territory of freedom for several years. Governments are good at cutting off the heads of a centrally controlled networks like Napster, but pure P2P networks like Gnutella and Tor seem to be holding their own.",
    backstory:
      "On the cryptography mailing list, James A. Donald voiced skepticism that any system could resist state force. Satoshi replied with this now-famous defense, arguing that decentralized P2P networks like Tor and Gnutella had survived where centralized ones (Napster) were decapitated — and that Bitcoin could buy \"a new territory of freedom for several years.\"",
  },
  {
    id: 7,
    date: "2008-11-08",
    source: "Cryptography mailing list — Re: Bitcoin P2P e-cash paper",
    text: "As computers get faster and the total computing power applied to creating bitcoins increases, the difficulty increases proportionally to keep the total new production constant. Thus, it is known in advance how many new bitcoins will be created every year in the future. Coins have to get initially distributed somehow, and a constant rate seems like the best formula.",
    backstory:
      "Replying to Ray Dillinger (\"bear\"), who worried that ever-faster computers would inflate the coin supply, Satoshi explained the difficulty adjustment — the mechanism that keeps Bitcoin's issuance schedule predictable regardless of how much hashing power joins the network.",
  },
  {
    id: 8,
    date: "2008-11-14",
    source: "Cryptography mailing list — Re: Bitcoin P2P e-cash paper",
    text: "It's very attractive to the libertarian viewpoint if we can explain it properly. I'm better with code than with words though.",
    backstory:
      "In a reply touching on the system's political appeal, Satoshi acknowledged the libertarian philosophy behind the design — and famously admitted he was \"better with code than with words.\" One of the few places he explicitly framed Bitcoin in ideological terms.",
  },
  {
    id: 9,
    date: "2009-01-03",
    source: "Bitcoin genesis block coinbase",
    text: "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks.",
    backstory:
      "Embedded in the coinbase transaction of block 0 — the genesis block, mined January 3, 2009. The headline from that day's Times of London is widely read as both a timestamp proof and a political statement about the banking crisis that motivated Bitcoin's creation.",
  },
  {
    id: 10,
    date: "2009-01-17",
    source: "Cryptography mailing list — Re: Bitcoin v0.1 released (to Dustin Trammell)",
    text: "It might make sense just to get some in case it catches on.",
    backstory:
      "In a reply to Dustin Trammell on the cryptography mailing list, nine days after releasing Bitcoin v0.1, Satoshi made this offhand suggestion that people acquire some bitcoin \"in case it catches on\" — a self-fulfilling-prophecy line that has aged remarkably well.",
  },
  {
    id: 11,
    date: "2009-02-11",
    source: "P2P Foundation — Bitcoin open source implementation of P2P currency",
    text: "The root problem with conventional currency is all the trust that's required to make it work. The central bank must be trusted not to debase the currency, but the history of fiat currencies is full of breaches of that trust. Banks must be trusted to hold our money and transfer it electronically, but they lend it out in waves of credit bubbles with barely a fraction in reserve. We have to trust them with our privacy, trust them not to let identity thieves drain our accounts.",
    backstory:
      "Satoshi's introductory post on the P2P Foundation forum, reaching a broader audience than the cryptography mailing list. This is the most-quoted statement of Bitcoin's raison d'être — the trust problem at the heart of fiat currency and fractional-reserve banking.",
  },
  {
    id: 12,
    date: "2009-02-11",
    source: "P2P Foundation — Bitcoin open source implementation of P2P currency",
    text: "With e-currency based on cryptographic proof, without the need to trust a third party middleman, money can be secure and transactions effortless.",
    backstory:
      "From the same P2P Foundation introductory post, distilling the whitepaper's thesis into a single sentence for a non-cryptographer audience: cryptographic proof replacing trusted middlemen, with security and effortless transactions as the payoff.",
  },
  {
    id: 13,
    date: "2009-02-15",
    source: "P2P Foundation — Bitcoin open source implementation of P2P currency",
    text: "A lot of people automatically dismiss e-currency as a lost cause because of all the companies that failed since the 1990's. I hope it's obvious it was only the centrally controlled nature of those systems that doomed them. I think this is the first time we're trying a decentralized, non-trust-based system.",
    backstory:
      "A reply on the P2P Foundation thread four days later, addressing the cynicism born of 1990s e-cash failures like DigiCash and e-gold. Satoshi argued those projects failed because they were centrally controlled — the one thing Bitcoin wasn't.",
  },
  {
    id: 14,
    date: "2009-11-25",
    source: "BitcoinTalk — Repost: How anonymous are bitcoins?",
    text: "The possibility to be anonymous or pseudonymous relies on you not revealing any identifying information about yourself in connection with the bitcoin addresses you use. If you post your bitcoin address on the web, then you're associating that address and any transactions with it with the name you posted under.",
    backstory:
      "On the newly-founded BitcoinTalk forum (launched November 22, 2009), Satoshi reposted an earlier explanation of Bitcoin's privacy model. This passage drew the crucial distinction between anonymity and pseudonymity — a warning that the later blockchain-analysis industry would vindicate.",
  },
  {
    id: 15,
    date: "2009-11-25",
    source: "BitcoinTalk — Repost: How anonymous are bitcoins?",
    text: "For greater privacy, it's best to use bitcoin addresses only once.",
    backstory:
      "From the same repost, the single-sentence privacy guidance that became Bitcoin's first best practice: use each address only once. Address reuse is now a well-documented privacy and security anti-pattern, vindicating Satoshi's early advice.",
  },
  {
    id: 16,
    date: "2010-02-14",
    source: "BitcoinTalk — Re: What's with this odd generation?",
    text: "I'm sure that in 20 years there will either be very large transaction volume or no volume.",
    backstory:
      "In a thread questioning the block reward schedule, Satoshi explained that transaction fees would eventually replace the declining block subsidy, then made this stark 20-year binary prediction about Bitcoin's future. Roughly sixteen years on, the \"very large volume\" branch looks correct.",
  },
  {
    id: 17,
    date: "2010-05-16",
    source: "BitcoinTalk — Re: Could the bitcoin network be destroyed by someone generating endless bitcoin addresses?",
    text: "When you generate a new bitcoin address, it only takes disk space on your own computer. It's like generating a new PGP private key, but less CPU intensive because it's ECC.",
    backstory:
      "A user worried that someone could attack the network by generating endless addresses. Satoshi explained that address generation is local, cheap, and harmless — comparing it to generating PGP keys, only lighter because Bitcoin uses elliptic-curve cryptography.",
  },
  {
    id: 18,
    date: "2010-06-14",
    source: "BitcoinTalk — Re: Dealing with SHA-256 Collisions",
    text: "SHA-256 is very strong. It's not like the incremental step from MD5 to SHA1. It can last several decades unless there's some massive breakthrough attack.",
    backstory:
      "When a forum user raised the hypothetical of SHA-256 being broken, Satoshi reassured them it was a far bigger leap from MD5 to SHA-1 than from SHA-1 to SHA-256, and would last decades. He then sketched a migration plan if it ever did fail. The hash function still secures Bitcoin today.",
  },
  {
    id: 19,
    date: "2010-06-17",
    source: "BitcoinTalk — Re: Transactions and Scripts: DUP HASH160 ... EQUALVERIFY CHECKSIG",
    text: "The nature of Bitcoin is such that once version 0.1 was released, the core design was set in stone for the rest of its lifetime.",
    backstory:
      "In a deep-dive on Bitcoin's scripting system, Satoshi explained why the core design was frozen at v0.1 — he had to anticipate every transaction type up front because the protocol couldn't safely be changed later. This is the origin of Bitcoin's conservatism around hard forks.",
  },
  {
    id: 20,
    date: "2010-06-21",
    source: "BitcoinTalk — Re: Dying bitcoins",
    text: "Lost coins only make everyone else's coins worth slightly more. Think of it as a donation to everyone.",
    backstory:
      "A user asked whether lost wallets would shrink the network over time. Satoshi reframed loss as a feature, not a bug: lost coins make everyone else's holdings slightly more scarce — \"a donation to everyone.\"",
  },
  {
    id: 21,
    date: "2010-07-05",
    source: "BitcoinTalk — Re: Slashdot Submission for 1.0",
    text: "Writing a description for this thing for general audiences is bloody hard. There's nothing to relate it to.",
    backstory:
      "When users wanted to submit Bitcoin to Slashdot for a big launch, Satoshi pushed back, admitting how hard Bitcoin is to explain to a general audience with nothing to compare it to. The Slashdot submission eventually happened and brought the first major wave of users.",
  },
  {
    id: 22,
    date: "2010-07-09",
    source: "BitcoinTalk — Re: BTC Vulnerability?",
    text: "When someone tries to buy all the world's supply of a scarce asset, the more they buy the higher the price goes. At some price it gets too expensive for them to buy any more.",
    backstory:
      "A newcomer worried someone could buy up all the bitcoin. Satoshi invoked the Hunt brothers' failed attempt to corner the silver market in 1979–80 to explain why cornering a genuinely scarce asset is self-defeating — the more you buy, the more expensive each remaining coin gets.",
  },
  {
    id: 23,
    date: "2010-07-29",
    source: "BitcoinTalk — Re: Scalability and transaction rate",
    text: "If you don't believe it or don't get it, I don't have the time to try to convince you, sorry.",
    backstory:
      "When a critic insisted 10-minute confirmations were too slow compared to a credit-card swipe, Satoshi pointed to his earlier snack-machine explanation and famously declined to argue further. The line became Bitcoin's most-quoted brush-off.",
  },
  {
    id: 24,
    date: "2010-08-07",
    source: "BitcoinTalk — Re: Bitcoin minting is thermodynamically perverse",
    text: "Proof-of-work has the nice property that it can be relayed through untrusted middlemen. We don't have to worry about a chain of custody of communication. It doesn't matter who tells you a longest chain, the proof-of-work speaks for itself.",
    backstory:
      "In a thread attacking proof-of-work as wasteful, Satoshi highlighted one of PoW's underappreciated properties: it can be relayed through untrusted middlemen because the work itself is the proof — no chain of custody needed. The argument reframed \"waste\" as the cost of trustless consensus.",
  },
  {
    id: 25,
    date: "2010-08-11",
    source: "BitcoinTalk — Re: Escrow",
    text: "Imagine if gold turned to lead when stolen. If the thief gives it back, it turns to gold again. It still seems to me the problem may be one of presenting it the right way. The money is never truly burned. You have the option to release it at any time forever. Imagine someone stole something from you. You can't get it back, but if you could, if it had a kill switch that could be remote triggered, would you do it?",
    backstory:
      "Sketching out an escrow transaction design, Satoshi introduced the \"kill switch\" thought experiment: what if stolen money could be rendered useless to the thief, yet reactivated if returned? It's one of his most philosophically rich posts, reframing escrow as game theory rather than punishment.",
  },
  {
    id: 26,
    date: "2010-08-27",
    source: "BitcoinTalk — Re: Bitcoins are most like shares of common stock",
    text: "Bitcoins have no dividend or potential future dividend, therefore not like a stock. More like a collectible or commodity.",
    backstory:
      "In a thread debating whether bitcoin was currency or stock, Satoshi weighed in that it was neither — more like a collectible or commodity, since it pays no dividend. The classification debate (currency? commodity? security?) continues to this day in courts and tax authorities worldwide.",
  },
  {
    id: 27,
    date: "2010-08-27",
    source: "BitcoinTalk — Re: Bitcoin does NOT violate Mises' Regression Theorem",
    text: "Most of the value comes from the value that others place in it. Gold, for instance, is pretty, non-corrosive and easily malleable, but most of its value is clearly not from that. Brass is shiny and similar in color. The vast majority of gold sits unused in vaults, owned by governments that could care less about its prettiness.",
    backstory:
      "In a debate over whether Bitcoin violates Austrian economics' regression theorem (that money must have prior commodity value), Satoshi argued most of gold's value comes from others' demand, not its industrial uses — and that the same network effect could bootstrap a digital scarce asset with no intrinsic use.",
  },
  {
    id: 28,
    date: "2010-09-19",
    source: "BitcoinTalk — Re: Bug? /usr/bin/bitcoind \"\"",
    text: "We're managing pretty well just using the forum. I'm more likely to see bugs posted in the forum, and I think other users are much more likely to help resolve and ask follow up questions here.",
    backstory:
      "When Jeff Garzik pushed for a formal bug tracker, Satoshi argued the forum was working fine and that he personally tracked every unresolved bug. It's a window into how hands-on Satoshi still was — single-handedly managing the project nine months in.",
  },
  {
    id: 29,
    date: "2010-09-23",
    source: "BitcoinTalk — Re: Porn",
    text: "Bitcoin would be convenient for people who don't have a credit card or don't want to use the cards they have, either don't want the spouse to see it on the bill or don't trust giving their number to \"porn guys\", or afraid of recurring billing.",
    backstory:
      "In a thread about adult-content payments, Satoshi noted Bitcoin's fit for people who can't or won't use credit cards — an early, candid acknowledgment of one of Bitcoin's most obvious early use cases: privacy-sensitive online purchases.",
  },
  {
    id: 30,
    date: "2010-10-03",
    source: "BitcoinTalk — Re: Version 0.3.13, please upgrade",
    text: "Sigh... why delete a wallet instead of moving it aside and keeping the old copy just in case? You should never delete a wallet.",
    backstory:
      "When a user reported losing coins after deleting a wallet file, Satoshi reacted with exasperation, urging users to never delete a wallet — keep the old copy aside instead. Practical advice that's still repeated to newcomers today.",
  },
  {
    id: 31,
    date: "2010-12-11",
    source: "BitcoinTalk — Re: WikiLeaks contact info?",
    text: "It would have been nice to get this attention in any other context. WikiLeaks has kicked the hornet's nest, and the swarm is headed towards us.",
    backstory:
      "After WikiLeaks was blockaded by Visa, MasterCard and PayPal, the community urged Bitcoin adoption. Satoshi warned them off — Bitcoin was too small to survive the resulting attention. This turned out to be his final public forum post; he disappeared within days, leaving behind one of the great mysteries of the internet age.",
  },
]

// Backwards-compatible flat list of quote texts (no longer used for random
// selection, but kept for any external consumers).
export const quotes: string[] = levels.map((l) => l.text)
