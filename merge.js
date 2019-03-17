const deepmerge = require('deepmerge');
const arrayUnion = require('arr-union');

const cloneArray = array => array.slice();

function countSimilarities(objA, objB) {
  return Object.keys(objA).reduce((count, key) => {
    if (objB[key] === objA[key]) {
      count += 1;
    }

    return count;
  }, 0);
}

const initialAggregator = { similarObj: null, count: 0 };
function toObjectLike(item) {
  return (aggregator, sourceItem) => {
    const count = countSimilarities(item, sourceItem);

    if (count > aggregator.count) {
      return { similarObj: sourceItem, count };
    }

    return aggregator;
  };
}

function deepMergeArray(destinationArray, sourceArray) {
  let newSourceArray = sourceArray;

  const newDestinatioArray = destinationArray.map((item) => {
    const result = newSourceArray.reduce(toObjectLike(item),
      initialAggregator);
    const sourceObject = result.similarObj;

    if (!sourceObject) {
      return item;
    }
    newSourceArray = newSourceArray.filter(sourceItem => sourceObject !== sourceItem);
    return deepmerge(item, sourceObject, { arrayMerge });
  });

  return arrayUnion(newDestinatioArray, newSourceArray);
}

function arrayMerge(destinationArray, sourceArray) {
  const result = arrayUnion(cloneArray(destinationArray), sourceArray);
  if (result.every(item => typeof item === 'object')) {
    if (sourceArray.length === 0) {
      return destinationArray;
    }

    return deepMergeArray(destinationArray, sourceArray);
  }

  return result;
}

function merge(target, obj) {
  return deepmerge(target, obj, { arrayMerge });
}

module.exports = merge;
