/**
 * @file Format single vue component file 
 * @author fe_bean
 */
import {
	window,
	Position,
	Range,
	workspace
} from 'vscode';
import * as beautify from 'js-beautify';
import  beautifyHtml from '../beautfier/html/index';


import * as pugBeautify from 'pug-beautify';
// console.log('beautifyHtml :>> ', beautifyHtml);
import breakTagAttr from './plugins';
import defaultConf from './js-beautify.conf';
let editor: any;
let methods = {
	doc: null as any,
	text: '',
	newText: '',
	lineCount: 1,
	jsBeautifyConf: defaultConf.jsBeautify,
	pugBeautifyConf: defaultConf.pugBeautify,
	editorConf: {} as any,
	vueFormatConf: {} as any,
	init() {
		// Active window tab
		editor = window.activeTextEditor;
		if (!editor) { throw new Error('no active editor'); }
		// Current window document
		this.doc = editor.document;
		// Get configuration
		this.getConfig();

		// Number of lines
		this.lineCount = this.doc.lineCount;
		// content
		this.text = this.doc.getText();
		// Clear the formatted content every time you execute
		this.newText = '';
		// Handle html (pug), css, js separately
		this.splitContent(this.text);
		// Write back content to file
		this.writeFile();
	},
	splitContent(text: string) {
		let formatNeed = this.vueFormatConf.formatNeed || ['html', 'js', 'css'];

		let htmlText = text.match(/<template[\w\W]+<\/template>\s?/);
		let jsText = text.match(/<script[\w\W]+<\/script>\s?/);
		let cssText = text.match(/<style[\w\W]+<\/style>\s?/);
		if (htmlText && formatNeed.includes('html')) {
			text = text.replace(htmlText[0], this.beautyHtml(htmlText[0]) + '\n');
		}
		if (jsText && formatNeed.includes('js')) {
			let jsArr = jsText[0].split(/<\/script>\n*/);
			jsArr.forEach((item, index) => {
				let pre = '';
				if (index === 0) {
					pre = '\n';
				}
				let str = item + '</script>';
				text = item ? text.replace(str, pre + this.beautyJs(str)) : text;
			});
		}
		if (cssText && formatNeed.includes('css')) {
			let cssArr = cssText[0].split(/<\/style>\n*/);
			cssArr.forEach((item, index) => {
				let pre = '';
				if (index === 0) {
					pre = '\n';
				}
				let str = item + '</style>';
				text = item ? text.replace(str, pre + this.beautyCss(str)) : text;
			});
		}
		this.newText = text.replace(/(\n|\t|\r)\s*(\n|\t|\r){2,}/g, '$1$1').trim() + '\n';
	},
	mergeFormatTag(arrUnFormat = [], arrForceFormat = []) {
		arrForceFormat.forEach(item => {
			let index = arrUnFormat.indexOf(item);
			if (index > -1) {
				arrUnFormat.splice(index, 1);
			}
		});
		return arrUnFormat;
	},
	beautyHtml(text: string) {
		let str = '';
		let defaultHtmlOptions = (beautify.html as any).defaultOptions();
		let htmlUnFormat = defaultHtmlOptions.inline;
		let indentRoot = this.vueFormatConf.htmlIndentRoot || false;
		let functional = /<template[^>]*\s+functional/.test(text) ? ' functional' : '';
		let lang = this.getLang(text);

		text = indentRoot ? text : text.replace(/<template[^>]*>([\w\W]+)<\/template>/, '$1');
		
		if (/pug/.test(lang)) {
			str = pugBeautify(text, this.pugBeautifyConf)
			.trim();
		} else {
			let tempConf = Object.assign(this.jsBeautifyConf, defaultConf.html);
			str = beautifyHtml(text,tempConf);
			// str = beautify.html(text, tempConf);
			if (tempConf.wrap_attributes === 'auto' && +this.vueFormatConf.breakAttrLimit > -1) {
				str = breakTagAttr(str, +this.vueFormatConf.breakAttrLimit, {
					indentSize: +defaultConf.indentSize,
					attrEndWithGt: this.vueFormatConf.attrEndWithGt,
					tempConf: Object.assign(tempConf, {
						unBreakAttrList: htmlUnFormat
					})
				});
			}
		}

		return indentRoot ? `${str}\n` : `<template${lang}${functional}>\n${str}\n</template>\n`;
	},
	beautyCss(text: string) {
		let scoped = /<style[^>]*\s+scoped/.test(text) ? ' scoped' : '';
		let lang = this.getLang(text);
		let str = text;
		text = text.replace(/<style[^>]*>([\w\W]*)<\/style>/, '$1');
		if (text.trim()) {
			let tempConf = Object.assign({}, this.jsBeautifyConf, defaultConf.css);
			str = beautify.css(text, tempConf);
			return `<style${lang}${scoped}>\n${str}\n</style>`;
		} else {
			return str;
		}
	},
	beautyJs(text: string) {
		let scoped = /<script[^>]*\s+scoped/.test(text) ? ' scoped' : '';
		let lang = this.getLang(text);
		let str = text;
		text = text.replace(/<script[^>]*>([\w\W]*)<\/script>/, '$1');
		if (text.trim()) {
			const tempConf: beautify.JSBeautifyOptions = Object.assign({}, this.jsBeautifyConf, defaultConf.js);
			str = beautify.js(text, tempConf);
			return `<script${lang}${scoped}>\n${str}\n</script>`;
		} else {
			return str;
		}
	},
	getLang(text: string) {
		// let lang = text.match(/lang=(["'])([a-zA-Z\-\_]*)\1/, '$2');
		let lang = text.match(/lang=(["'])([a-zA-Z\-\_]*)\1/);
		return lang && ` lang="${lang.pop()}"` || '';
	},
	writeFile() {
		let start = new Position(0, 0);
		let end = new Position(this.lineCount + 1, 0);
		let range = new Range(start, end);
		editor.edit((editBuilder: any, error: string) => {
			error && window.showErrorMessage(error);
			editBuilder.replace(range, this.newText);
		});
	},
	getConfig() {

		this.editorConf = Object.assign({}, workspace.getConfiguration('editor'));
		this.initDefaultJsBConf();
		let vueFormatConf = workspace.getConfiguration('vue-format');
		this.vueFormatConf = vueFormatConf;
		if (!vueFormatConf) {
			return;
		}
		let jsBConf = vueFormatConf.get('js-beautify') || {};
		this.mergeBeautifyConf(jsBConf, 'jsBeautifyConf');
		let pugBConf = vueFormatConf.get('pug-beautify') || {};
		this.mergeBeautifyConf(pugBConf, 'pugBeautifyConf');
	},
	initDefaultJsBConf() {
		defaultConf.indentSize = this.editorConf.tabSize;
		if (this.editorConf.insertSpaces) {
			this.jsBeautifyConf.indent_char = ' ';
		} else {
			// this.indent_with_tabs = true;
		}
	},
	mergeBeautifyConf(conf: any, type: string) {
		for (let k in conf) {
			// if (!this[type][k]) {
			//     continue;
			// }
			let cont = conf[k];
			if (typeof cont === 'string') {
				let teMatch = cont.match(/editor\.(\w+)/g);
				if (teMatch) {
					let editKey = teMatch[0].replace('editor.', '');
					cont = this.editorConf[editKey];
				}
			}
			if (cont instanceof Object) {
				Object.assign((this as any)[type][k], cont);
			} else {
				(this as any)[type][k] = cont;
			}
		}
		return (this as any)[type];
	}
};

export default methods;
