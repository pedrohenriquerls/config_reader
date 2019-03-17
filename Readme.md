## Config Reader
This lib is about to merge config files in JSON and YAML.
The name of the config file is important to separate the config data `${configName}.${extension}` or `${configName}_${siteId}.${extension}`.

The siteID usually 3-6 letter identifier, for example:

- `forms_customer.yml` it's just for the default config
- `forms_customer_bkit.yml` will be the `forms_customer` for config name to the site `bkit`

### How to use
Before to fetch the configs is necessary to load the config data for this you need to call the function `loadAllConfigsInFolder`.

If you do not pass the folder of configs as a parameter to `loadAllConfigsInFolder` the files will be found in the path configured in the env `READER_CONFIG_FOLDER`, this function returns a promise.

To fetch the configs you want you must call the `getConfig` function, this function receives three parameters `config name`, `siteId` and `environment`, the production key is used as default.

The data need to be load just one time.

##### Example:

```
loadAllConfigsInFolder('./config_files_folder').then(() => {
  console.log(getConfig('forms_customer', 'bkit', 'staging'));
});
```

### Deep merge hash
Every hash will be deep merged and the preference always will be the siteID config.

The production keys is used to fill the empty keys for other environments config, for example:

##### production config:
```
"klarna": {
            "ordersName": "klarna_checkout",
            "active": false,
            "merchantId": "2468",
            "sharedSecret": "ryckZqFxB75WQ3o",
            "baseUri": "https://checkout.klarna.com",
            "contentType": "application/vnd.klarna.checkout.aggregated-order-v2+json",
            "fetchUri": "/checkout/orders/",
            "confirmationUri": "/checkout/klarna/confirmation.html",
            "pushUri": "/checkout/klarna/confirm/klarnacheckout?klarna_order={checkout.order.uri}"
        }
```
##### development config:
```
"development": {
        "klarna": {
            "baseUri": "https://checkout.testdrive.klarna.com"
        }
    }
```
##### result config:
```
"klarna": {
            "ordersName": "klarna_checkout",
            "active": false,
            "merchantId": "2468",
            "sharedSecret": "ryckZqFxB75WQ3o",
            "baseUri": "https://checkout.testdrive.klarna.com",
            "contentType": "application/vnd.klarna.checkout.aggregated-order-v2+json",
            "fetchUri": "/checkout/orders/",
            "confirmationUri": "/checkout/klarna/confirmation.html",
            "pushUri": "/checkout/klarna/confirm/klarnacheckout?klarna_order={checkout.order.uri}"
        }
```

### Deep merge array
For configs in an array the objects will be merged with the more similar config found in the array, for example:

##### default config:

```
    customerData:
      - type: gender
        name: gender
        label: form_label_gender
        required: true
        tabIndex: 1

      - type: text
        name: firstName
        label: form_label_first_name
        required: true
        tabIndex: 2
        constraints:
          - type: Length
            min: 2
            minMessage: form_firstname_error
```

##### Site config:

```
    customerData:
      - type: gender
        name: gender
        label: form_label_gender

      - type: text
        name: firstName
        label: form_label_first_name
        required: false
        tabIndex: 2
        constraints:
          - type: Pattern
            pattern: '^[A-Z]{2,20}$'
            message: test
```

##### The result will be:

```
    customerData:
      - type: gender
        name: gender
        label: form_label_gender
        required: true
        tabIndex: 1

      - type: text
        name: firstName
        label: form_label_first_name
        required: false
        tabIndex: 2
        constraints:
          - type: Pattern
            pattern: '^[A-Z]{2,20}$'
            message: test
         - type: Length
            min: 2
            minMessage: form_firstname_error
```