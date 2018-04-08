# Example implementation in Python

## 1] Architecture

- Homebridge server is : `192.168.1.22`
- Raspberry Pi controlling the lightbulb : `192.168.1.55`

## 1] Homebridge accessory configuration

Here is the accessory I need to add:

``` json
"accessories": [
    {
        "name": "Kitchen Lightbulb",
        "accessory": "MinimalisticHttpLightbulbBrightness",

        "get_on_off_url": "http://127.0.0.1:9000/get/on_off/",
        "set_on_off_url": "http://127.0.0.1:9000/set/on_off/%on_off%",
        "get_brightness_url": "http://127.0.0.1:9000/get/brightness/",
        "set_brightness_url": "http://127.0.0.1:9000/set/brightness/%brightness%
    }

]
```

Here is a reminder of the default values the accessory use if you don't write them explicitely:
```json
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
```

## 2] What the Homebridge server expects

As you can see, the Raspberry Pi will need to host an HTTP server providing three routes:
- `GET /get/on_off/` that responds `200 OK` with the current on/off state of the lightbulbs
- `POST /set/on_off/%on_off%/` that responds `204 NO CONTENT` to Homebridge
- `GET /get/brightness/` that responds `200 OK` with the current brightness of the lightbulbs
- `POST /set/brightness/%brightness%/` that responds `204 NO CONTENT` to Homebridge

## 3] Example implementation in python

This example implementation uses Flask, a very simple and easy to use HTTP serving API. 

```python
from flask import Flask
app = Flask(__name__)

on_off = False
brightness = 0


@app.route('/get/on_off/', methods=['GET'])
def get_on_off():
    global on_off
    #print('get on_off:', '1' if on_off else '0')
    return '1' if on_off else '0', 200


@app.route('/set/on_off/<int:arg>', methods=['POST'])
def set_on_off(arg):
    global on_off
    on_off = arg == 1
    print('set on_off:', on_off)
    return '', 204


@app.route('/get/brightness/', methods=['GET'])
def get_brightness():
    global brightness
    #print('get brightness', brightness)
    return str(brightness), 200


@app.route('/set/brightness/<int:arg>', methods=['POST'])
def set_brightness(arg):
    global brightness
    brightness = arg
    print('set brightness:', brightness)
    return '', 204


app.run(host='0.0.0.0', port=9000)
```

