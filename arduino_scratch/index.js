const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');

const baudRate = 57600; // Default Firmata baudrate
const reportVersionTimeout = 1000; // Time to wait before requesting version/firmware info

const Firmata = require('firmata-web');


/**
 * Enum for tilt axis menu options.
 * @readonly
 * @enum {string}
 */
const ModeValues = {
    OUTPUT: 'output',
    INPUT: 'input',
    PULSE: 'pulse',
    ANALOG: 'analog'
};

const DigitalPinAlias = {
    D2: 'D2',
    D3: 'D3',
    D4: 'D4',
    D5: 'D5',
    D6: 'D6',
    D7: 'D7',
    D8: 'D8'
}

const AnalogPinAlias = {
    A0: 'A0',
    A1: 'A1',
    A2: 'A2',
    A3: 'A3'
};

const mapPin = (pin) => {
    return parseInt(pin.slice(1));
}

class ArduinoScratch {

    constructor(runtime) {

        this._board().then(() => {
            console.log("Constructor done and connected")
        }).catch(e => {
            console.log("Constructor failed => " + e)
        });

    }

    portOpen = false;

    _port() {
        console.log("_port: getting port")
        return new Promise((resolve, reject) => {
            if (this.portOpen) {
                console.log("_port: already open")
                resolve(this.port)
            } else {
                console.log("_port: requesting port from user")
                navigator.serial.requestPort().then(port => {
                    this.port = port
                    console.log(this.port.getInfo());
                    return this.port.open({ baudRate })
                }).then(() => {
                    this.portOpen = true;
                    console.log("_port: >>>> Opened port");
                    resolve(this.port);
                }).catch(e => reject(e))
            }
        })
    }

    _board() {
        return new Promise((resolve, reject) => {

            const boardCallback = () => {
                console.log("_board: >>>> Ready");
                console.log(this.board.version)
                console.log(this.board.pins)
                console.log(this._getPWMPins());
                this.ready = true;
                resolve(this.board);
            }

            if (this.ready) {
                console.log("_board: return direct");
                resolve(this.board);
            } else {
                if (this.board) {
                    console.log("_board: reseting");
                    this.ready=false;
                    this.board.reset();
                    
                }
                if (this.port) {
                    console.log("_port: close");
                    this.portOpen = false;
                    this.transport.write.close();
                    this.port.close();
                }

                console.log("_board: getting port")
                // get the port
                this._port().then(port => {
                    // Create transport
                    this.transport = new Firmata.WebSerialTransport(port);
                    // Log transport
                    this.transport.on('write', d => console.log('OUT', d))
                    this.transport.on('data', d => console.log('IN', d))

                    // Crate board
                    this.ready = false;
                    this.board = new Firmata.Firmata(transport, {reportVersionTimeout} );
                    this.board.on("ready", boardCallback)
                }).catch(e => reject(e))

            }
        })
    }


    _getPWMPins() {
        
        if (this.board){
            const pwmPins = []
            this.board.pins.forEach((pin, index) => {
                hasPWM = (e) => e === this.board.MODES.PWM
                if (pin.supportedModes.some(hasPWM)) {
                    pwmPins.push(`D${index}`)
                }
            })
            return pwmPins;
        } else {
            return ["none"];
        }
        
        
    }

    /**
     * Returns the metadata about your extension.
     */
    getInfo() {
        return {
            // unique ID for your extension
            id: 'arduinoScratch',

            // name that will be displayed in the Scratch UI
            name: 'Arduino',

            // colours to use for your extension blocks
            color1: '#339690',
            color2: '#46c7be',

            // icons to display
            blockIconURI: '',//'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAFCAAAAACyOJm3AAAAFklEQVQYV2P4DwMMEMgAI/+DEUIMBgAEWB7i7uidhAAAAABJRU5ErkJggg==',
            menuIconURI: '',//'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAFCAAAAACyOJm3AAAAFklEQVQYV2P4DwMMEMgAI/+DEUIMBgAEWB7i7uidhAAAAABJRU5ErkJggg==',

            // your Scratch blocks
            blocks: [
                {
                    // name of the function where your block code lives
                    opcode: 'setdigital',

                    // type of block - choose from:
                    //   BlockType.REPORTER - returns a value, like "direction"
                    //   BlockType.BOOLEAN - same as REPORTER but returns a true/false value
                    //   BlockType.COMMAND - a normal command block, like "move {} steps"
                    //   BlockType.HAT - starts a stack if its value changes from false to true ("edge triggered")
                    blockType: BlockType.COMMAND,

                    // label to display on the block
                    text: 'Sets Digital Pin [DIGITAL_PIN] to [STATE]',

                    // true if this block should end a stack
                    terminal: false,

                    // arguments used in the block
                    arguments: {
                        DIGITAL_PIN: {
                            type: ArgumentType.STRING,
                            menu: 'digitalPins',
                            defaultValue: DigitalPinAlias.D2
                        },
                        STATE: {
                            type: ArgumentType.BOOLEAN,
                            defaultValue: true
                        }
                    }
                },
                {
                    // name of the function where your block code lives
                    opcode: 'getdigital',
                    blockType: BlockType.BOOLEAN,

                    // label to display on the block
                    text: 'Gets Digital Pin [DIGITAL_PIN]',

                    // true if this block should end a stack
                    terminal: false,

                    // arguments used in the block
                    arguments: {
                        DIGITAL_PIN: {
                            type: ArgumentType.STRING,
                            menu: 'digitalPins',
                            defaultValue: DigitalPinAlias.D2
                        }
                    }
                },
                {
                    // name of the function where your block code lives
                    opcode: 'getanalog',
                    blockType: BlockType.REPORTER,

                    // label to display on the block
                    text: 'Gets Analog value [PIN]',

                    // true if this block should end a stack
                    terminal: false,

                    // arguments used in the block
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'analogPins',
                            defaultValue: AnalogPinAlias.A0
                        }
                    }
                },

                {
                    // name of the function where your block code lives
                    opcode: 'pulse',
                    blockType: BlockType.COMMAND,
                    text: 'Sets Digital Pin [DIGITAL_PIN] pulse at [PWM]',
                    terminal: false,
                    arguments: {
                        DIGITAL_PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pwmPins'
                        },
                        PWM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 128
                        }
                    }
                },
                {
                    opcode: 'digitalon',
                    blockType: BlockType.BOOLEAN,
                    text: 'ON',
                    terminal: false,
                    arguments: {}
                },
                {
                    opcode: 'digitaloff',
                    blockType: BlockType.BOOLEAN,
                    text: 'OFF',
                    terminal: false,
                    arguments: {}
                },
                {
                    opcode: 'modeoutput',
                    blockType: BlockType.COMMAND,
                    text: 'Make pin [PIN] suitable for [MODE]',
                    terminal: false,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'digitalPins',
                            defaultValue: DigitalPinAlias.D2
                        },
                        MODE: {
                            type: ArgumentType.STRING,
                            menu: 'modeOptions',
                            defaultValue: ModeValues.OUTPUT
                        }
                    }
                }
            ],
            menus: {
                modeOptions: {
                    acceptReporters: true,
                    items: [ModeValues.INPUT, ModeValues.OUTPUT, ModeValues.PULSE, ModeValues.ANALOG]
                },
                analogPins: {
                    acceptReporters: true,
                    items: [AnalogPinAlias.A0, AnalogPinAlias.A1, AnalogPinAlias.A2, AnalogPinAlias.A3]
                },
                digitalPins: {
                    acceptReports: true,
                    items: [DigitalPinAlias.D2, DigitalPinAlias.D3, DigitalPinAlias.D4, DigitalPinAlias.D5, DigitalPinAlias.D6, DigitalPinAlias.D7, DigitalPinAlias.D8]
                },
                pwmPins: {
                    acceptReports: true,
                    items: '_getPWMPins'
                }
            }
        };
    }

    modeoutput({ PIN, MODE }) {
        if (typeof MODE !== 'undefined') {
            switch (MODE) {
                case ModeValues.ANALOG:
                    this.board.pinMode(mapPin(PIN), this.board.MODES.ANALOG);
                    break;
                case ModeValues.PULSE:
                    this.board.pinMode(mapPin(PIN), this.board.MODES.PWM);
                    break;
                case ModeValues.INPUT:
                    this.board.pinMode(mapPin(PIN), this.board.MODES.INPUT);
                    break;
                case ModeValues.OUTPUT:
                    this.board.pinMode(mapPin(PIN), this.board.MODES.OUTPUT);
                    break;
                default:
                    console.log(`Never heard of pin ${PIN}  Mode ${MODE}`);
                    break;
            }
        }
    }

    digitalon() {
        return true;
    }

    digitaloff() {
        return false;
    }

    getanalog({ PIN }) {
        return new Promise((resolve) => {
            this._board().then(board => {

                board.pinMode(mapPin(PIN), this.board.MODES.ANALOG);

                board.analogRead(mapPin(PIN), (a) => {
                    resolve(a);
                })
            })
        })
    }

    pulse({ DIGITAL_PIN, PWM }) {
        return this._board().then((board) => {
            if (typeof PWM !== undefined) {
                board.pwmWrite(mapPin(DIGITAL_PIN), PWM);
            }

        })
    }

    setdigital({ DIGITAL_PIN, STATE }) {
        return this._board().then((board) => {
            if (typeof STATE !== 'undefined') {
                console.log(`Setting pin ${DIGITAL_PIN} to ${STATE}`)
                board.digitalWrite(mapPin(DIGITAL_PIN), STATE ? 1 : 0);
            }
        })

    }

    getdigital({ DIGITAL_PIN }) {
        return new Promise((resolve) => {
            this._board().then((board) => {
                board.digitalRead(mapPin(DIGITAL_PIN), (a) => {
                    console.log(`Read pin ${DIGITAL_PIN} to ${a}`)
                    resolve(a);
                })
            })
        })

    }

}

module.exports = ArduinoScratch;
