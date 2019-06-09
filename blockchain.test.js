const Blockchain = require('./blockchain');
const Block = require('./block');
const cryptoHash = require('./crypto-hash')


describe('Blockchain', () => {
  let blockchain, newChain, originalChain;

  beforeEach(() => {
    blockchain = new Blockchain();
    newChain = new Blockchain();
    originalChain = blockchain.chain;
  })

  it('contains a `chain` Array instance', () => {
    expect(blockchain.chain instanceof Array).toBe(true);
  });

  it('starts with the genesis block', () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis());
  });

  it('adds a new block to the chain', () => {
    const newData = 'ed calls bob';
    blockchain.addBlock({ data: newData});

    expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
  });

  describe('isValidChain()', () => {
    describe('when the chain does not start with the genesis block', () => {
      it('returns false', () => {
        blockchain.chain[0] = { data: 'fake-genesis'}

        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
      });
    });

    describe('when the chain starts with the genesis block and has multiple blocks', () => {
      beforeEach(() => {
        blockchain.addBlock({data: 'ed'})
        blockchain.addBlock({data: 'bob'})
        blockchain.addBlock({data: 'goats'})
      })

      describe('and a lastHash reference has changed', () => {
        it('returns false', () => {
          blockchain.chain[1].lastHash = 'broken-hash'

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
        });
      });

      describe('and the chain contains a block with an invalid field', () => {
        it('returns false', () => {
          blockchain.chain[1].data = 'leopold-zelig'

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
        });
      });

      describe('and the chain contains a block with a jumped difficulty', () => {
        it('returns false', () => {
          const lastBlock = blockchain.chain[blockchain.chain.length -1];

          const lastHash = lastBlock.hash;

          const timestamp = Date.now();

          const nonce = 0;

          const data = [];

          const difficulty = lastBlock.difficulty - 3;

          const hash = cryptoHash(timestamp, lastBlock, data, difficulty, nonce);

          const badBlock = new Block({timestamp, lastHash, hash, nonce, difficulty, data});

          blockchain.chain.push(badBlock);

          expect(Blockchain.isValidChain(blockchain)).toBe(false);
        });
      });

      describe('and the chain does not contain any ivalid blocks', () => {
        it('returns true', () => {
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true)
        });
      });
    });
  });

  describe('replaceChain()', () => {
    let invalidBlockConsoleLog, chainLengthConsoleError;

    beforeEach(() => {
      invalidBlockConsoleLog = jest.fn()
      chainLengthConsoleError = jest.fn()

      global.console.error = chainLengthConsoleError;
      global.console.log = invalidBlockConsoleLog;

    });

    describe('when the coming chain is not longer', () => {

      beforeEach(() => {
        newChain.chain[0] = {new: 'chain'};
        blockchain.replaceChain(newChain.chain);
      });

      it('does not replace the chain', () => {
        expect(blockchain.chain).toEqual(originalChain);
      });

      it('logs the error', () => {
        expect(chainLengthConsoleError).toHaveBeenCalled();
      })
    });

    describe('when the coming chain is longer', () => {
      beforeEach(() => {
        newChain.addBlock({data: 'ed'})
        newChain.addBlock({data: 'bob'})
        newChain.addBlock({data: 'goats'})
      })

      describe('and the data is not valid', () => {
        beforeEach(() => {
          newChain.chain[2].hash = 'this is fake'
          blockchain.replaceChain(newChain.chain);
        });

        it('does not replace the chain', () => {
          expect(blockchain.chain).toEqual(originalChain);
        });

        it('logs the error', () => {
          expect(invalidBlockConsoleLog).toHaveBeenCalled();
        })
      });

      describe('and the data is valid', () => {
        it('replaces the chain', () => {
          blockchain.replaceChain(newChain.chain);

          expect(blockchain.chain).toEqual(newChain.chain);
        });
      });
    });
  });
});