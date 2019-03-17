const { parseFilename, loadAllConfigsInFolder, getConfig } = require('../reader.js');

describe('.parseFilename', () => {
  it('must return the config name and the siteid', () => {
    expect(parseFilename('configName_siteId.json')).toEqual({
      name: 'configName',
      siteId: 'siteId'
    });
  });

  it('siteid must have 3~6 chars', () => {
    expect(parseFilename('configName_notAnSiteId.json')).toEqual({
      name: 'configName_notAnSiteId'
    });
  });

  it('siteId must have the last word in the filename', () => {
    expect(parseFilename('abc_cde_wacqweqwe.json')).toEqual({
      name: 'abc_cde_wacqweqwe',
    });
  });

  it('siteId must have the last word in the filename', () => {
    expect(parseFilename('abc_cde_wac.json')).toEqual({
      name: 'abc_cde',
      siteId: 'wac'
    });
  });

  it('must have only the config name', () => {
    expect(parseFilename('config.yml')).toEqual({
      name: 'config'
    });
  });
});

describe('.loadAllConfigsInFolder', () => {
  it('must load all the config files', async () => {
    const data = await loadAllConfigsInFolder('./tests/fixtures');
    expect(data).toMatchSnapshot();
  });
});

describe('.getConfig', () => {
  beforeAll(async () => {
    await loadAllConfigsInFolder('./tests/fixtures');
  });

  describe('config.yml and config_bkbe.yml', () => {
    it('must return an empty object when have no parameters', () => {
      const data = getConfig();
      expect(data).toBeNull();
    });

    it('must return the default config by name', () => {
      const data = getConfig('config');
      expect(data).toMatchSnapshot();
      expect(Object.keys(data)[0]).toEqual('checkout2');
    });

    it('must return the bkbe config merged with the default config', () => {
      const data = getConfig('config', 'bkbe', 'production');
      expect(data).toMatchSnapshot();
    });

    it('must return null if use an invalid environment', () => {
      const data = getConfig('config', 'bkbe', 'invalid');
      expect(data).toBeNull();
    });

    it('must return empty when theres no env key', () => {
      const data = getConfig('config', 'bkbe', 'staging');
      expect(data).toBeEmpty();
    });
  });

  describe('checkout.json and checkout_bkbe.json', () => {
    it('must return the default config by name', () => {
      const data = getConfig('checkout');
      expect(data).toMatchSnapshot();
    });

    it('must return the merge staging and production checkout bkbe', () => {
      const data = getConfig('checkout', 'bkbe', 'staging');
      expect(data).toMatchSnapshot();
    });

    it('must return the site bkbe merged with the default checkout', () => {
      const data = getConfig('checkout', 'bkbe', 'production');
      expect(data).toMatchSnapshot();
    });
  });

  describe('forms_customer.yml and forms_customer_bkit.yml', () => {
    it('must return the default config by name', () => {
      const data = getConfig('forms_customer');
      expect(data).toMatchSnapshot();
    });

    it('must return the production checkout bkit', () => {
      const data = getConfig('forms_customer', 'bkit');
      expect(data).toMatchSnapshot();
    });
  });

  describe('allenv.json and allenv_test.json', () => {
    it('must return the same data to all environments', () => {
      expect(getConfig('allenv', null, 'production')).toMatchSnapshot();
      expect(getConfig('allenv', null, 'staging')).toMatchSnapshot();
      expect(getConfig('allenv', null, 'development')).toMatchSnapshot();
    });

    it('must return the production allenv test', () => {
      const data = getConfig('allenv', 'test');
      expect(data).toMatchSnapshot();
    });

    it('must return the staging allenv test', () => {
      const data = getConfig('allenv', 'test', 'staging');
      expect(data).toMatchSnapshot();
    });
  });
});
