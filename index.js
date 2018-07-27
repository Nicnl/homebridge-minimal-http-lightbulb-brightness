var request = require('request');
var Service, Characteristic;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory('homebridge-minimal-http-lightbulb-brightness', 'MinimalisticHttpLightbulbBrightness', MinimalisticHttpLightbulbBrightness);
    console.log('Loading MinimalisticHttpLightbulbBrightness accessories...');
};

function MinimalisticHttpLightbulbBrightness(log, config) {
    this.log = log;

    // Required parameters
    this.get_on_off_url = config.get_on_off_url;
    this.set_on_off_url  = config.set_on_off_url;

    this.get_brightness_url = config.get_brightness_url;
    this.set_brightness_url  = config.set_brightness_url;

    // Optional parameters: lightbulb properties
    this.is_dimmable = config.is_dimmable != "false";

    // Optional parameters: HTTP methods
    this.get_on_off_method = config.get_on_off_method || 'GET';
    this.set_on_off_method  = config.set_on_off_method  || 'POST';

    this.get_brightness_method = config.get_brightness_method || 'GET';
    this.set_brightness_method  = config.set_brightness_method  || 'POST';

    // Optional parameters: expected HTTP response codes
    this.get_on_off_expected_response_code = parseInt(config.get_on_off_expected_response_code) || 200;
    this.set_on_off_expected_response_code  = parseInt(config.set_on_off_expected_response_code)  || 204;

    this.get_brightness_expected_response_code = parseInt(config.get_brightness_expected_response_code) || 200;
    this.set_brightness_expected_response_code  = parseInt(config.set_brightness_expected_response_code)  || 204;

    // Optional parameters: polling times
    this.get_on_off_polling_millis = parseInt(config.get_on_off_polling_millis) || 500;
    this.get_brightness_polling_millis = parseInt(config.get_brightness_polling_millis) || 500;

    // Internal fields
    this.on_off = undefined;
    this.brightness = undefined;

    this.get_on_off_callbacks = [];
    this.get_brightness_callbacks = [];

    // Initializing things
    if (this.is_dimmable) {
        this.start_brightness_polling();
    }
    this.start_on_off_polling();
    this.init_service();
}

MinimalisticHttpLightbulbBrightness.prototype.init_service = function() {
    this.service = new Service.Lightbulb(this.name);

    this.service.getCharacteristic(Characteristic.On).on('get', function(callback) {
        this.get_on_off_callbacks.push(callback);
    }.bind(this));
    this.service.getCharacteristic(Characteristic.On).on('set', this.set_on_off.bind(this));

    if (this.is_dimmable) {
        this.service.getCharacteristic(Characteristic.Brightness).on('get', function(callback) {
	        this.get_brightness_callbacks.push(callback);
	    }.bind(this));
	    this.service.getCharacteristic(Characteristic.Brightness).on('set', this.set_brightness.bind(this));
    }
};

MinimalisticHttpLightbulbBrightness.prototype.start_on_off_polling = function() {
    setTimeout(this.update_on_off.bind(this), this.get_on_off_polling_millis);
};

MinimalisticHttpLightbulbBrightness.prototype.start_brightness_polling = function() {
    setTimeout(this.update_brightness.bind(this), this.get_brightness_polling_millis);
};

MinimalisticHttpLightbulbBrightness.prototype.update_brightness = function() {
    request({
        url: this.get_brightness_url,
        method: this.get_brightness_method,
        timeout: 5000
    }, function(error, response, body) {
        if (error) {
            this.log('Error when polling current brightness.');
            this.log(error);
            this.start_brightness_polling();
            return;
        }
        else if (response.statusCode != this.get_brightness_expected_response_code) {
            this.log('Unexpected HTTP status code when polling current brightness. Got: ' + response.statusCode + ', expected:' + this.get_brightness_expected_response_code);
            this.start_brightness_polling();
            return;
        }

        var new_brightness = parseInt(body);

        if (this.get_brightness_callbacks.length > 0) {
            this.get_brightness_callbacks.forEach(function (callback) {
                this.log('calling callback with brightness: ' + new_brightness);
                callback(null, new_brightness);
            }.bind(this));
            this.log('Responded to ' + this.get_brightness_callbacks.length + ' Brightness callbacks!');
            this.get_brightness_callbacks = [];
        }
        else if (new_brightness !== this.brightness) {
            this.service.getCharacteristic(Characteristic.Brightness).setValue(new_brightness);
            this.log('Updated Brightness to value ' + new_brightness);
        }

        this.brightness = new_brightness;
        this.start_brightness_polling();
    }.bind(this));
};

MinimalisticHttpLightbulbBrightness.prototype.update_on_off = function() {
    request({
        url: this.get_on_off_url,
        method: this.get_on_off_method,
        timeout: 5000
    }, function(error, response, body) {
        if (error) {
            this.log('Error when polling current on_off.');
            this.log(error);
            this.start_on_off_polling();
            return;
        }
        else if (response.statusCode != this.get_on_off_expected_response_code) {
            this.log('Unexpected HTTP status code when polling current on_off. Got: ' + response.statusCode + ', expected:' + this.get_on_off_expected_response_code);
            this.start_on_off_polling();
            return;
        }

        var new_on_off = parseInt(body) === 1 ? 1 : 0;

        if (this.get_on_off_callbacks.length > 0) {
            this.get_on_off_callbacks.forEach(function (callback) {
                this.log('calling callback with on_off: ' + new_on_off);
                callback(null, new_on_off);
            }.bind(this));
            this.log('Responded to ' + this.get_on_off_callbacks.length + ' On callbacks!');
            this.get_on_off_callbacks = [];
        }
        else if (new_on_off !== this.on_off) {
            this.service.getCharacteristic(Characteristic.On).setValue(new_on_off);
            this.log('Updated On to value ' + new_on_off);
        }

        this.on_off = new_on_off;
        this.start_on_off_polling();
    }.bind(this));
};


MinimalisticHttpLightbulbBrightness.prototype.set_brightness = function(brightness, callback) {
    this.log('Setting new target brightness: ' + brightness + ' => ' + this.set_brightness_url.replace('%brightness%', brightness));
    request({
        url: this.set_brightness_url.replace('%brightness%', brightness),
        method: this.set_brightness_method
    }, function(error, response, body) {
        if (error || response.statusCode != this.set_brightness_expected_response_code) {
            this.log('Error when setting new target brightness: ' + body);
            return;
        }
        this.log('Target brightness set to ' + brightness);
        callback(null)
    }.bind(this));
};

MinimalisticHttpLightbulbBrightness.prototype.set_on_off = function(on_off, callback) {
    this.log('Setting new target on_off: ' + on_off + ' => ' + this.set_on_off_url.replace('%on_off%', on_off));
    request({
        url: this.set_on_off_url.replace('%on_off%', on_off),
        method: this.set_on_off_method
    }, function(error, response, body) {
        if (error || response.statusCode != this.set_on_off_expected_response_code) {
            this.log('Error when setting new target on_off: ' + body);
            return;
        }
        this.log('Target on_off set to ' + on_off);
        callback(null)
    }.bind(this));
};

MinimalisticHttpLightbulbBrightness.prototype.getServices = function() {
    return [this.service];
};
