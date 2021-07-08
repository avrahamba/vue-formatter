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

class TokenStream {
  __tokens: any
  __tokens_length: any
  __position: any
  __parent_token: any
  constructor(parent_token?: any) {
    // private
    this.__tokens = [];
    this.__tokens_length = this.__tokens.length;
    this.__position = 0;
    this.__parent_token = parent_token;
  }

  restart() {
    this.__position = 0;
  };

  isEmpty() {
    return this.__tokens_length === 0;
  };

  hasNext() {
    return this.__position < this.__tokens_length;
  };

  next() {
    var val = null;
    if (this.hasNext()) {
      val = this.__tokens[this.__position];
      this.__position += 1;
    }
    return val;
  };

  peek(index: any) {
    var val = null;
    index = index || 0;
    index += this.__position;
    if (index >= 0 && index < this.__tokens_length) {
      val = this.__tokens[index];
    }
    return val;
  };

  add(token: any) {
    if (this.__parent_token) {
      token.parent = this.__parent_token;
    }
    this.__tokens.push(token);
    this.__tokens_length += 1;
  };
}

export default TokenStream
