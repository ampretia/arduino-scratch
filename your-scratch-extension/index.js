const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');


class Scratch3YourExtension {

    constructor (runtime) {
        import('syllable')
        .then((syllableModule) => {
          this.syllable = syllableModule.syllable;
        });
    }

    /**
     * Returns the metadata about your extension.
     */
    getInfo () {
        return {
            // unique ID for your extension
            id: 'yourScratchExtension',

            // name that will be displayed in the Scratch UI
            name: 'Demo',

            // colours to use for your extension blocks
            color1: '#000099',
            color2: '#660066',

            // icons to display
            blockIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAFCAAAAACyOJm3AAAAFklEQVQYV2P4DwMMEMgAI/+DEUIMBgAEWB7i7uidhAAAAABJRU5ErkJggg==',
            menuIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAFCAAAAACyOJm3AAAAFklEQVQYV2P4DwMMEMgAI/+DEUIMBgAEWB7i7uidhAAAAABJRU5ErkJggg==',

            // your Scratch blocks
            blocks: [
                {
                    // name of the function where your block code lives
                    opcode: 'myFirstBlock',

                    // type of block - choose from:
                    //   BlockType.REPORTER - returns a value, like "direction"
                    //   BlockType.BOOLEAN - same as REPORTER but returns a true/false value
                    //   BlockType.COMMAND - a normal command block, like "move {} steps"
                    //   BlockType.HAT - starts a stack if its value changes from false to true ("edge triggered")
                    blockType: BlockType.REPORTER,

                    // label to display on the block
                    text: 'Title for ISBN book [BOOK_NUMBER]',

                    // true if this block should end a stack
                    terminal: false,

                    // arguments used in the block
                    arguments: {
                        BOOK_NUMBER: {
                        defaultValue: 1718500564,
            
                        // type/shape of the parameter
                        type: ArgumentType.NUMBER
                        }
                    }
                },
                {
                  // function where your code logic lives
                  opcode: 'mySecondBlock',
          
                  // type of block
                  blockType: BlockType.REPORTER,
          
                  // label to display on the block
                  text: 'Syllables in [MY_TEXT]',
          
                  // true if this block should end a stack
                  terminal: false,
          
                  // arguments used in the block
                  arguments: {
                    MY_TEXT: {
                      defaultValue: 'Hello World',
          
                      // type/shape of the parameter
                      type: ArgumentType.STRING
                    }
                  }
                }
            ]
        };
    }


    myFirstBlock ({ BOOK_NUMBER }) {
        return fetch('https://openlibrary.org/isbn/' + BOOK_NUMBER + '.json')
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            else {
              return { title: 'Unknown' };
            }
          })
          .then((bookinfo) => {
            return bookinfo.title;
          });
      }

      mySecondBlock ({ MY_TEXT }) {
        return this.syllable(MY_TEXT);
      }
}

module.exports = Scratch3YourExtension;
