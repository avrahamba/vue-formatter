/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

import Pattern from './pattern';

class WhitespacePattern extends Pattern{
  _line_regexp:any
  newline_count:any
  whitespace_before_token:any
  _match_pattern:any
  _newline_regexp:any
  _input:any
  constructor(input_scanner:any, parent?:any) {
    super(input_scanner, parent);
    if (parent) {
      this._line_regexp = this._input.get_regexp(parent._line_regexp);
    } else {
      this.__set_whitespace_patterns('', '');
    }
  
    this.newline_count = 0;
    this.whitespace_before_token = '';
  }
__set_whitespace_patterns(whitespace_chars:any, newline_chars:any) {
  whitespace_chars += '\\t ';
  newline_chars += '\\n\\r';

  this._match_pattern = this._input.get_regexp(
    '[' + whitespace_chars + newline_chars + ']+', true);
  this._newline_regexp = this._input.get_regexp(
    '\\r\\n|[' + newline_chars + ']');
};

read() {
  this.newline_count = 0;
  this.whitespace_before_token = '';

  var resulting_string = this._input.read(this._match_pattern);
  if (resulting_string === ' ') {
    this.whitespace_before_token = ' ';
  } else if (resulting_string) {
    var matches = this.__split(this._newline_regexp, resulting_string);
    this.newline_count = matches.length - 1;
    this.whitespace_before_token = matches[this.newline_count];
  }

  return resulting_string;
};

matching(whitespace_chars:any, newline_chars?:any) {
  var result = this._create();
  result.__set_whitespace_patterns(whitespace_chars, newline_chars);
  result._update();
  return result;
};

_create() {
  return new WhitespacePattern(this._input, this);
};

__split(regexp:any, input_string:any) {
  regexp.lastIndex = 0;
  var start_index = 0;
  var result = [];
  var next_match = regexp.exec(input_string);
  while (next_match) {
    result.push(input_string.substring(start_index, next_match.index));
    start_index = next_match.index + next_match[0].length;
    next_match = regexp.exec(input_string);
  }

  if (start_index < input_string.length) {
    result.push(input_string.substring(start_index, input_string.length));
  } else {
    result.push('');
  }

  return result;
};
}

export default WhitespacePattern
