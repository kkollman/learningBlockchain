const cryptoHash = require('./crypto-hash');

describe('cryptoHash()', () => {

  it('generates a SHA-256 hashed output', () => {
    expect(cryptoHash('edbob'))
      .toEqual('874de9a9f3f5414e49791e4bdf8452eedaae7d83c4d5fc6809379b1f27fd0e3f');
  });

  it('produces the same hash with the same input arguments in any order', () => {
    expect(cryptoHash('one', 'two', 'three'))
      .toEqual(cryptoHash('three', 'two', 'one'));
  });
});