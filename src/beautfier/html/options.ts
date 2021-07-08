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
// import BaseOptions from '../core/options';


function _mergeOpts(allOptions: any, childFieldName: any) {
  var finalOpts: any = {};
  allOptions = _normalizeOpts(allOptions);
  var name: string;

  for (name in allOptions) {
    if (name !== childFieldName) {
      finalOpts[name] = allOptions[name];
    }
  }

  //merge in the per type settings for the childFieldName
  if (childFieldName && allOptions[childFieldName]) {
    for (name in allOptions[childFieldName]) {
      finalOpts[name] = allOptions[childFieldName][name];
    }
  }
  return finalOpts;
}

function _normalizeOpts(options: any) {
  var convertedOpts: any = {};
  var key;

  for (key in options) {
    var newKey = key.replace(/-/g, "_");
    convertedOpts[newKey] = options[key];
  }
  return convertedOpts;
}


class Options {
  templating: any
  indent_inner_html: any
  indent_body_inner_html: any
  indent_head_inner_html: any
  indent_handlebars: any
  wrap_attributes: any
  wrap_attributes_indent_size: any
  extra_liners: any
  inline: any
  void_elements: any
  unformatted: any
  content_unformatted: any
  unformatted_content_delimiter: any
  indent_scripts: any
  raw_options: any
  disabled: any
  eol: any
  end_with_newline: any
  indent_size: any
  indent_char: any
  indent_level: any
  preserve_newlines: any
  max_preserve_newlines: any
  indent_with_tabs: any
  wrap_line_length: any
  indent_empty_lines: any
  constructor(options: any) {



    this.raw_options = _mergeOpts(options, 'html');

    // Support passing the source text back with no change
    this.disabled = this._get_boolean('disabled');

    this.eol = this._get_characters('eol', 'auto');
    this.end_with_newline = this._get_boolean('end_with_newline');
    this.indent_size = this._get_number('indent_size', 4);
    this.indent_char = this._get_characters('indent_char', ' ');
    this.indent_level = this._get_number('indent_level');

    this.preserve_newlines = this._get_boolean('preserve_newlines', true);
    this.max_preserve_newlines = this._get_number('max_preserve_newlines', 32786);
    if (!this.preserve_newlines) {
      this.max_preserve_newlines = 0;
    }

    this.indent_with_tabs = this._get_boolean('indent_with_tabs', this.indent_char === '\t');
    if (this.indent_with_tabs) {
      this.indent_char = '\t';

      // indent_size behavior changed after 1.8.6
      // It used to be that indent_size would be
      // set to 1 for indent_with_tabs. That is no longer needed and
      // actually doesn't make sense - why not use spaces? Further,
      // that might produce unexpected behavior - tabs being used
      // for single-column alignment. So, when indent_with_tabs is true
      // and indent_size is 1, reset indent_size to 4.
      if (this.indent_size === 1) {
        this.indent_size = 4;
      }
    }

    // Backwards compat with 1.3.x
    this.wrap_line_length = this._get_number('wrap_line_length', this._get_number('max_char'));

    this.indent_empty_lines = this._get_boolean('indent_empty_lines');

    // valid templating languages ['django', 'erb', 'handlebars', 'php', 'smarty']
    // For now, 'auto' = all off for javascript, all on for html (and inline javascript).
    // other values ignored
    this.templating = this._get_selection_list('templating', ['auto', 'none', 'django', 'erb', 'handlebars', 'php', 'smarty'], ['auto']);

    if (this.templating.length === 1 && this.templating[0] === 'auto') {
      this.templating = ['django', 'erb', 'handlebars', 'php'];
    }

    this.indent_inner_html = this._get_boolean('indent_inner_html');
    this.indent_body_inner_html = this._get_boolean('indent_body_inner_html', true);
    this.indent_head_inner_html = this._get_boolean('indent_head_inner_html', true);

    this.indent_handlebars = this._get_boolean('indent_handlebars', true);
    this.wrap_attributes = this._get_selection('wrap_attributes', ['auto', 'force', 'force-aligned', 'force-expand-multiline', 'aligned-multiple', 'preserve', 'preserve-aligned']);
    this.wrap_attributes_indent_size = this._get_number('wrap_attributes_indent_size', this.indent_size);
    this.extra_liners = this._get_array('extra_liners', ['head', 'body', '/html']);

    // Block vs inline elements
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Inline_elements
    // https://www.w3.org/TR/html5/dom.html#phrasing-content
    this.inline = this._get_array('inline', [
      'a', 'abbr', 'area', 'audio', 'b', 'bdi', 'bdo', 'br', 'button', 'canvas', 'cite',
      'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img',
      'input', 'ins', 'kbd', 'keygen', 'label', 'map', 'mark', 'math', 'meter', 'noscript',
      'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', /* 'script', */ 'select', 'small',
      'span', 'strong', 'sub', 'sup', 'svg', 'template', 'textarea', 'time', 'u', 'var',
      'video', 'wbr', 'text',
      // obsolete inline tags
      'acronym', 'big', 'strike', 'tt'
    ]);
    this.void_elements = this._get_array('void_elements', [
      // HTLM void elements - aka self-closing tags - aka singletons
      // https://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen',
      'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr',
      // NOTE: Optional tags are too complex for a simple list
      // they are hard coded in _do_optional_end_element

      // Doctype and xml elements
      '!doctype', '?xml',

      // obsolete tags
      // basefont: https://www.computerhope.com/jargon/h/html-basefont-tag.htm
      // isndex: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/isindex
      'basefont', 'isindex'
    ]);
    this.unformatted = this._get_array('unformatted', []);
    this.content_unformatted = this._get_array('content_unformatted', [
      'pre', 'textarea'
    ]);
    this.unformatted_content_delimiter = this._get_characters('unformatted_content_delimiter');
    this.indent_scripts = this._get_selection('indent_scripts', ['normal', 'keep', 'separate']);

  }
  _get_array(name: string, default_value: any) {
    var option_value = this.raw_options[name];
    var result = default_value || [];
    if (typeof option_value === 'object') {
      if (option_value !== null && typeof option_value.concat === 'function') {
        result = option_value.concat();
      }
    } else if (typeof option_value === 'string') {
      result = option_value.split(/[^a-zA-Z0-9_\/\-]+/);
    }
    return result;
  };

  _get_boolean(name: string, default_value?: any) {
    var option_value = this.raw_options[name];
    var result = option_value === undefined ? !!default_value : !!option_value;
    return result;
  };

  _get_characters(name: string, default_value?: any) {
    var option_value = this.raw_options[name];
    var result = default_value || '';
    if (typeof option_value === 'string') {
      result = option_value.replace(/\\r/, '\r').replace(/\\n/, '\n').replace(/\\t/, '\t');
    }
    return result;
  };

  _get_number(name: string, default_value?: any) {
    var option_value = this.raw_options[name];
    default_value = parseInt(default_value, 10);
    if (isNaN(default_value)) {
      default_value = 0;
    }
    var result = parseInt(option_value, 10);
    if (isNaN(result)) {
      result = default_value;
    }
    return result;
  };

  _get_selection(name: string, selection_list: any[], default_value?: any) {
    var result = this._get_selection_list(name, selection_list, default_value);
    if (result.length !== 1) {
      throw new Error(
        "Invalid Option Value: The option '" + name + "' can only be one of the following values:\n" +
        selection_list + "\nYou passed in: '" + this.raw_options[name] + "'");
    }

    return result[0];
  };

  _get_selection_list(name: string, selection_list: any[], default_value: any) {
    if (!selection_list || selection_list.length === 0) {
      throw new Error("Selection list cannot be empty.");
    }

    default_value = default_value || [selection_list[0]];
    if (!this._is_valid_selection(default_value, selection_list)) {
      throw new Error("Invalid Default Value!");
    }

    var result = this._get_array(name, default_value);
    if (!this._is_valid_selection(result, selection_list)) {
      throw new Error(
        "Invalid Option Value: The option '" + name + "' can contain only the following values:\n" +
        selection_list + "\nYou passed in: '" + this.raw_options[name] + "'");
    }

    return result;
  };

  _is_valid_selection(result: any, selection_list: any[]) {
    return result.length && selection_list.length &&
      !result.some(function (item: any) { return selection_list.indexOf(item) === -1; });
  };

}



export default Options 
