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

var regexp_has_sticky = RegExp.prototype.hasOwnProperty('sticky');

class InputScanner {
  __input:any
  __input_length:any
  __position:any
  constructor(input_string: any) {
    this.__input = input_string || '';
    this.__input_length = this.__input.length;
    this.__position = 0;
  }
  restart() {
    this.__position = 0;
  };

  back() {
    if (this.__position > 0) {
      this.__position -= 1;
    }
  };

  hasNext() {
    return this.__position < this.__input_length;
  };

  next() {
    var val = null;
    if (this.hasNext()) {
      val = this.__input.charAt(this.__position);
      this.__position += 1;
    }
    return val;
  };

  peek(index: any) {
    var val = null;
    index = index || 0;
    index += this.__position;
    if (index >= 0 && index < this.__input_length) {
      val = this.__input.charAt(index);
    }
    return val;
  };

  // This is a JavaScript only helper function (not in python)
  // Javascript doesn't have a match method
  // and not all implementation support "sticky" flag.
  // If they do not support sticky then both this.match() and this.test() method
  // must get the match and check the index of the match.
  // If sticky is supported and set, this method will use it.
  // Otherwise it will check that global is set, and fall back to the slower method.
  __match(pattern: any, index: any) {
    pattern.lastIndex = index;
    var pattern_match = pattern.exec(this.__input);

    if (pattern_match && !(regexp_has_sticky && pattern.sticky)) {
      if (pattern_match.index !== index) {
        pattern_match = null;
      }
    }

    return pattern_match;
  };

  test(pattern: any, index: any) {
    index = index || 0;
    index += this.__position;

    if (index >= 0 && index < this.__input_length) {
      return !!this.__match(pattern, index);
    } else {
      return false;
    }
  };

  testChar(pattern: any, index: any) {
    // test one character regex match
    var val = this.peek(index);
    pattern.lastIndex = 0;
    return val !== null && pattern.test(val);
  };

  match(pattern: any) {
    var pattern_match = this.__match(pattern, this.__position);
    if (pattern_match) {
      this.__position += pattern_match[0].length;
    } else {
      pattern_match = null;
    }
    return pattern_match;
  };

  read(starting_pattern: any, until_pattern: any, until_after: any) {
    var val = '';
    var match;
    if (starting_pattern) {
      match = this.match(starting_pattern);
      if (match) {
        val += match[0];
      }
    }
    if (until_pattern && (match || !starting_pattern)) {
      val += this.readUntil(until_pattern, until_after);
    }
    return val;
  };

  readUntil(pattern: any, until_after: any) {
    var val = '';
    var match_index = this.__position;
    pattern.lastIndex = this.__position;
    var pattern_match = pattern.exec(this.__input);
    if (pattern_match) {
      match_index = pattern_match.index;
      if (until_after) {
        match_index += pattern_match[0].length;
      }
    } else {
      match_index = this.__input_length;
    }

    val = this.__input.substring(this.__position, match_index);
    this.__position = match_index;
    return val;
  };

  readUntilAfter(pattern: any) {
    return this.readUntil(pattern, true);
  };

  get_regexp(pattern: any, match_from: any) {
    var result = null;
    var flags = 'g';
    if (match_from && regexp_has_sticky) {
      flags = 'y';
    }
    // strings are converted to regexp
    if (typeof pattern === "string" && pattern !== '') {
      // result = new RegExp(pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), flags);
      result = new RegExp(pattern, flags);
    } else if (pattern) {
      result = new RegExp(pattern.source, flags);
    }
    return result;
  };

  get_literal_regexp(literal_string: any) {
    return RegExp(literal_string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
  };

  /* css beautifier legacy helpers */
  peekUntilAfter(pattern: any) {
    var start = this.__position;
    var val = this.readUntilAfter(pattern);
    this.__position = start;
    return val;
  };

  lookBack(testVal: any) {
    var start = this.__position - 1;
    return start >= testVal.length && this.__input.substring(start - testVal.length, start)
      .toLowerCase() === testVal;
  };
}

export default InputScanner