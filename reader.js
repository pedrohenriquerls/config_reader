const util = require('util');
const fs = require('fs');
const yaml = require('js-yaml');
const merge = require('./merge');

const readdir = util.promisify(fs.readdir);
const validEnvironments = ['staging', 'development', 'production'];

function validSiteId(word) {
  if (word && word.length <= 6 && word.length >= 3) {
    return word;
  }

  return null;
}

function parseFilename(filename) {
  // Extract the necessary data from the filename
  // - `${configName}.${extension}`
  // - `${configName}_${siteId}.${extension}`
  // SiteIds: usually 3-6 letter identifier (or `default` for defaults).
  const extension = filename.match(/\.[^/.]+$/g)[0];
  const config = {};
  const filenameWithoutExtension = filename.replace(extension, '');
  const configArray = filenameWithoutExtension.split('_');

  const lastWord = configArray[configArray.length - 1];
  const siteId = validSiteId(lastWord);
  if (validSiteId(lastWord) && configArray.length > 1) {
    config.siteId = siteId;
  }
  config.name = filenameWithoutExtension.replace(`_${siteId}`, '');
  return config;
}

const defaultConfigFolder = process.env.READER_CONFIG_FOLDER || './config_files';

function loadConfig(path) {
  const extension = path.match(/\.[^/.]+$/g)[0];
  if (extension !== '.json' && extension !== '.yml') {
    throw 'Invalid type of config file found';
  }

  const file = fs.readFileSync(path, 'utf8');
  if (extension === '.yml' || extension === '.yaml') {
    return yaml.safeLoad(file);
  }
  return JSON.parse(file);
}

function hasEnvConfig(configData) {
  return validEnvironments.find(env => configData.hasOwnProperty(env));
}

function extractConfigData(configData, key) {
  const keys = Object.keys(configData);
  switch (keys.join()) {
    case key:
      return configData[key];
    case 'default':
      return configData.default;
    default:
      if (hasEnvConfig(configData)) {
        return configData;
      }
      return {
        production: configData,
        staging: configData,
        development: configData,
      };
  }
}

const data = {};
function mergeData(configData, { name, siteId }) {
  const currentConfig = data[name] || {};
  if (siteId) {
    const siteIdConfig = extractConfigData(configData, siteId);
    return data[name] = merge(currentConfig, { [siteId]: siteIdConfig });
  }

  const defaults = extractConfigData(configData, name);
  return data[name] = merge(currentConfig, { defaults });
}

async function loadAllConfigsInFolder(configFolder) {
  const filenames = await readdir(configFolder || defaultConfigFolder);
  filenames.forEach((filename) => {
    const config = parseFilename(filename);
    if (!config.name) {
      return;
    }
    const path = `${configFolder}/${filename}`;
    const configData = loadConfig(path);
    mergeData(configData, config);
  });

  return data;
}

function getConfig(configName, siteId, environment) {
  const configByName = data[configName];
  if (!configByName) {
    return null;
  }

  const currentEnvironment = environment || 'production';
  if (!validEnvironments.includes(currentEnvironment)) {
    return null;
  }

  const defaultsConfig = configByName.defaults || {};
  const siteConfig = configByName[siteId] || {};
  const mergedConfig = merge(defaultsConfig, siteConfig);

  if (!mergedConfig[currentEnvironment]) {
    return {};
  }

  return merge(mergedConfig.production, mergedConfig[currentEnvironment]) || {};
}

module.exports = { getConfig, parseFilename, loadAllConfigsInFolder };
