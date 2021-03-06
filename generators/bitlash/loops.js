/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating Bitlash for loop blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Bitlash.loops');

goog.require('Blockly.Bitlash');


Blockly.Bitlash['controls_repeat_ext'] = function(block) {
  // Repeat n times.
  if (block.getField('TIMES')) {
    // Internal number.
    var repeats = String(Number(block.getFieldValue('TIMES')));
  } else {
    // External number.
    var repeats = Blockly.Bitlash.valueToCode(block, 'TIMES',
        Blockly.Bitlash.ORDER_ASSIGNMENT) || '0';
  }
  var branch = Blockly.Bitlash.statementToCode(block, 'DO');
  branch = Blockly.Bitlash.addLoopTrap(branch, block.id);
  var code = '';
  var loopVar = Blockly.Bitlash.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  var endVar = repeats;
  if (!repeats.match(/^\w+$/) && !Blockly.isNumber(repeats)) {
    var endVar = Blockly.Bitlash.variableDB_.getDistinctName(
        'repeat_end', Blockly.Variables.NAME_TYPE);
    code += endVar + ' = ' + repeats + '; ';
  }
  code += loopVar + ' = 0; ' +
      'while ('+ loopVar + ' < ' + endVar + ') '+
      '{' + branch + '; '+ loopVar +'++} ';
  return code;
};

Blockly.Bitlash['controls_repeat'] =
    Blockly.Bitlash['controls_repeat_ext'];

Blockly.Bitlash['controls_whileUntil'] = function(block) {
  // Do while/until loop.
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Blockly.Bitlash.valueToCode(block, 'BOOL',
      until ? Blockly.Bitlash.ORDER_LOGICAL_NOT :
      Blockly.Bitlash.ORDER_NONE) || 'false';
  var branch = Blockly.Bitlash.statementToCode(block, 'DO');
  branch = Blockly.Bitlash.addLoopTrap(branch, block.id);
  if (until) {
    argument0 = '!' + argument0;
  }
  return 'while (' + argument0 + ') {\n' + branch + '}\n';
};

Blockly.Bitlash['controls_for'] = function(block) {
  // For loop.
  var variable0 = Blockly.Bitlash.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Bitlash.valueToCode(block, 'FROM',
      Blockly.Bitlash.ORDER_ASSIGNMENT) || '0';
  var argument1 = Blockly.Bitlash.valueToCode(block, 'TO',
      Blockly.Bitlash.ORDER_ASSIGNMENT) || '0';
  var increment = Blockly.Bitlash.valueToCode(block, 'BY',
      Blockly.Bitlash.ORDER_ASSIGNMENT) || '1';
  var branch = Blockly.Bitlash.statementToCode(block, 'DO');
  branch = Blockly.Bitlash.addLoopTrap(branch, block.id);
  var code;
  if (Blockly.isNumber(argument0) && Blockly.isNumber(argument1) &&
      Blockly.isNumber(increment)) {
    // All arguments are simple numbers.
    var up = parseFloat(argument0) <= parseFloat(argument1);
    code = variable0 + ' = ' + argument0 + '; ' +
       'while ('+ variable0 + (up ? ' <= ' : ' >= ') + argument1 + ') '; 
    code += ') {' + branch + '; ';
    code += variable0;
    var step = Math.abs(parseFloat(increment));
    if (step == 1) {
      code += up ? '++' : '--';
    } else {
      code += (up ? ' += ' : ' -= ') + step;
    }
		code += "}";
  } else {
    code = '';
    // Cache non-trivial values to variables to prevent repeated look-ups.
    var startVar = argument0;
    if (!argument0.match(/^\w+$/) && !Blockly.isNumber(argument0)) {
      startVar = Blockly.Bitlash.variableDB_.getDistinctName(
          variable0 + '_start', Blockly.Variables.NAME_TYPE);
      code += startVar + ' = ' + argument0 + '; ';
    }
    var endVar = argument1;
    if (!argument1.match(/^\w+$/) && !Blockly.isNumber(argument1)) {
      var endVar = Blockly.Bitlash.variableDB_.getDistinctName(
          variable0 + '_end', Blockly.Variables.NAME_TYPE);
      code += endVar + ' = ' + argument1 + '; ';
    }
    // Determine loop direction at start, in case one of the bounds
    // changes during loop execution.
    var incVar = Blockly.Bitlash.variableDB_.getDistinctName(
        variable0 + '_inc', Blockly.Variables.NAME_TYPE);
    code += incVar + ' = ';
    if (Blockly.isNumber(increment)) {
      code += Math.abs(increment) + ';\n';
    } else {
      code += 'Math.abs(' + increment + ');\n';
    }
    code += 'if (' + startVar + ' > ' + endVar + ') { ';
    code += incVar + ' = -' + incVar + ';';
    code += '} ';
    code += variable0 + ' = ' + startVar + '; ' +
        'while ('+incVar + ' >= 0 ? ' +
        variable0 + ' <= ' + endVar + ' : ' +
        variable0 + ' >= ' + endVar + '; ' +
        ') { ' +
        branch + '; ' +
			 	variable0 + ' += ' + incVar +	'}';
  }
  return code;
};

Blockly.Bitlash['controls_forEach'] = function(block) {
  // For each loop.
  var variable0 = Blockly.Bitlash.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Bitlash.valueToCode(block, 'LIST',
      Blockly.Bitlash.ORDER_ASSIGNMENT) || '[]';
  var branch = Blockly.Bitlash.statementToCode(block, 'DO');
  branch = Blockly.Bitlash.addLoopTrap(branch, block.id);
  var code = '';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  var listVar = argument0;
  if (!argument0.match(/^\w+$/)) {
    listVar = Blockly.Bitlash.variableDB_.getDistinctName(
        variable0 + '_list', Blockly.Variables.NAME_TYPE);
    code += 'var ' + listVar + ' = ' + argument0 + ';\n';
  }
  var indexVar = Blockly.Bitlash.variableDB_.getDistinctName(
      variable0 + '_index', Blockly.Variables.NAME_TYPE);
  branch = Blockly.Bitlash.INDENT + variable0 + ' = ' +
      listVar + '[' + indexVar + '];\n' + branch;
  code += 'for (var ' + indexVar + ' in ' + listVar + ') {\n' + branch + '}\n';
  return code;
};

Blockly.Bitlash['controls_flow_statements'] = function(block) {
  // Flow statements: continue, break.
  switch (block.getFieldValue('FLOW')) {
    case 'BREAK':
      return 'break;\n';
    case 'CONTINUE':
      return 'continue;\n';
  }
  throw Error('Unknown flow statement.');
};
