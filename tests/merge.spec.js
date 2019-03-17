const merge = require('../merge.js');

describe('.merge', () => {
  it('must merge objects in array', () => {
    const data = {
      test: 'test',
      list: [{
        name: 'fruit',
        value: 'water melon',
        flavours: [
          { flavor: 'aqua' },
          { flavor: 'sour' },
        ]
      },
      {
        name: 'animal',
        value: 'cat',
      }]
    };

    const defaults = {
      test: 'test',
      list: [{
        name: 'fruit',
        value: 'blueberry',
        flavours: [
          { flavor: 'sweet' },
          { flavor: 'sour', intesity: 10 },
        ]
      },
      {
        name: 'animal',
        value: 'dog',
        skill: 'hunt'
      },
      {
        name: 'cake',
        type: 'red velvet',
        flavours: [
          { flavor: 'sweet' },
          { flavor: 'taste' },
        ]
      }]
    };

    expect(merge(defaults, data)).toEqual({
      test: 'test',
      list: [{
        name: 'fruit',
        value: 'water melon',
        flavours: [
          { flavor: 'sweet' },
          { flavor: 'sour', intesity: 10 },
          { flavor: 'aqua' },
        ]
      },
      {
        name: 'animal',
        value: 'cat',
        skill: 'hunt'
      },
      {
        name: 'cake',
        type: 'red velvet',
        flavours: [
          { flavor: 'sweet' },
          { flavor: 'taste' },
        ]
      }]
    });
  });
});
