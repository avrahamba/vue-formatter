/* eslint-disable */
import * as beautify from 'js-beautify';

interface Iex {
    htmlIndentRoot: boolean
    breakAttrLimit: number
    attrEndWithGt: boolean
    formatNeed: string[],
    jsBeautify: beautify.JSBeautifyOptions,
    pugBeautify: {
        fill_tab: boolean
    }
    indentSize: string
    css: any
    js: any
    html: any

}

const ex: Iex = {
    htmlIndentRoot: false,
    breakAttrLimit: -1,
    attrEndWithGt: true,
    formatNeed: ['html', 'js', 'css'],
    jsBeautify: {
        indent_char: ' ',
        indent_with_tabs: false,
        space_after_anon_function: true,
        brace_style: 'preserve-inline',
    },
    indentSize: 'editor.tabSize',
    css: {},
    js: {},
    html: {
        force_format: ['template'],
        wrap_attributes: 'auto'
    },
    pugBeautify: {
        fill_tab: false
    }
};
export default ex