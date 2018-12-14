#Add a bitlash generator to blockly for Arduino projects

Try it at https://podemosaprender.github.io/blockly-bitlash/demo-bitlash.html

Google's Blockly is a web-based, visual programming editor.  Users can drag
blocks together to build programs.  All code is free and open source.

**The project page is https://developers.google.com/blockly/**

Blockly has an active [developer forum](https://groups.google.com/forum/#!forum/blockly). Please drop by and say hello. Show us your prototypes early; collectively we have a lot of experience and can offer hints which will save you time.

[Bitlash](http://bitlash.net/) is an open source interpreted language shell and embedded programming environment for the popular and useful Arduino.

## To try and contribute

npm install # once, install required modules ```

python build.py generators # each time you edit sources in generators/bitlash 

open demo-bitlash.html in your browser to try it

##TODO: Next Steps

* edit generators/bitlash to generate the language

* add more blocks to the demo?

* write unit tests for this generator
