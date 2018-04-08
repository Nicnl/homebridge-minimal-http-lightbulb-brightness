# homebridge-minimal-http-lightbulb-brightness

### What is it?

**homebridge-minimal-http-lightbulb-brightness** is a minimalistic HTTP lightbulb brightness management plugin for homebridge.

The features:
- You can control your own lightbulb's brightness with four minimalistic HTTP requests.
- The control is not a simple binary on/off: **it support percentages**. You can turn on your lightbulb at 50% or 65% for instance.
- Your lightbulb can still be manually operated. As long at the `get_brightness_url` returns the right value, this plugin will update iOS Home app in real time.

### Who is it for?

Anyone who, just like me, don't know much about homebridge
but still want a straightforward way to communicate with your own home-made Raspberry Pi or Arduino lightbulb brightness thingamagic.

### How to use it

#### 1] Install it into your homebridge instance

The installation instructions differs depending on how you installed homebridge.

Usually, it's something like _"add this to your homebridge's `install.sh`"_
````bash
npm install -g homebridge-minimal-http-lightbulb-brightness
````

#### 2] Minimal configuration

Here is an homebridge's `config.json` with the minimal valid configuration:

````json
{
    "bridge": {
        "name": "DemoMinimalisticHttpLightbulbBrightness",
        "username": "AA:BB:CC:DD:EE:FF",
        "port": 51826,
        "pin": "123-45-678"
    },
  
    "description": "DEV NODEJS MACBOOK",
  
    "accessories": [
        {
            "name": "Kitchen Lightbulb",
            "accessory": "MinimalisticHttpLightbulbBrightness",

            "get_on_off_url": "http://127.0.0.1:9000/get/on_off/",
            "set_on_off_url": "http://127.0.0.1:9000/set/on_off/%on_off%",
            "get_brightness_url": "http://127.0.0.1:9000/get/brightness/",
            "set_brightness_url": "http://127.0.0.1:9000/set/brightness/%brightness%
        }
  
    ],
  
    "platforms": []
}
````

Beware, I'm a lazy ass!  
These three parameters are not checked!  
(`get_brightness_url`, `set_brightness_url`, `get_on_off_url`, `set_on_off_url`)  
If you forgot to write them in your accessory, the module will crash.

Also, in the:
- `set_brightness_url` parameter, the placeholder `%brightness%` will be replaced by the brightness selected in the iPhone's Home App. (between 0 and 100)
- `set_on_off_url` parameter, the placeholder `%on_off%` will be replaced by the on/off state selected in the iPhone's Home App. (either 0 or 1)

#### 3] More configuration

There are more configuration options.  
The names are self-descriptive.  
Here are them all with their default values.

````
{
    "get_on_off_expected_response_code": "GET",
    "set_on_off_expected_response_code": "POST",
    "get_brightness_expected_response_code": "GET",
    "set_brightness_expected_response_code": "POST",
    
    "get_on_off_expected_response_code": "200",
    "set_on_off_expected_response_code": "204",
    "get_brightness_expected_response_code": "200",
    "set_brightness_expected_response_code": "204",
    
    "get_on_off_polling_millis": "500",
    "get_brightness_polling_millis": "500"
}
````

#### 4] Protocol requirements

The three URLs specified in the accessory configuration must have the following data formats:

##### 4.1] `get_on_off_url`

This URL must return the on/off status of the lightbulb, **in plaintext**.  
It must be either `0 or `1.
(0 being off and 1 on)

##### 4.2] `set_on_off_url`

This URL must trigger the lightbulb on/off switch.  
(That's the part you've done with your Raspberry Pi or Arduino)  
This value is, once again, an integer being either 1 or 0.
Please note that is passed **directly in the URL**. (It's the `%on_off%` placeholder)  

Yep, that's it.  
Not a single trace of json.  
Are we barbarians or are we not?    


##### 4.3] `get_brightness_url`

This URL must return the current brightness of the lightbulb, **in plaintext** once again.  
It must be between `0` and `100`.

Please note that **EVEN IF YOUR LIGHTBULB IS TURNED OFF**, this URL must return the last brightness of your lightbulb.  
This way, if you turn off your lightbulb from your iPhone using siri, the brightness value will be kept when you turn it on again.


##### 4.4] `set_brightness_url`

This URL must change the lightbulb brightness.  
(That's the part you've done with your Raspberry Pi or Arduino)  
This value is, once again, an integer between 0 and 11.
Please note that is passed **directly in the URL**. (It's the `%brightness%` placeholder)  

________________________________________

[Click here](EXAMPLE.md) to see an example implementation of this HTTP server.

# That's all

## Enjoy

