/**
 * Force multiple attributes to wrap 
 * @param {String} str The string to be formatted 
 * @param {Number} breakLimitNum Line breaks if there are more than this number of attributes 
 */

 function breakTagAttr(str = '', breakLimitNum = 1, opt: any = {
    indentSize: 4,
    attrEndWithGt: true,
    tempConf: {}
}) {
    if (breakLimitNum === -1) {
        return str;
    }
    let {
        indentSize,
        attrEndWithGt,
        tempConf
    } = opt;
    let {
        unBreakAttrList
    } = tempConf;
    let padIndent = ' '.repeat(indentSize);
    const TAG_REG = /[\n\r\t]*(\s*)\<[A-z\-\_0-9]+/;
    const TAG_END_REG = /\s*(>|\/>)/;
    const TAG_NAME_REG = /\<([A-z][\w\-]*)/;

    const ATTR_REG = /(\s(\:|\@)?[A-z0-9\-\_\.\:]+(=("[^"]*"|'[^']+'|`[^`]+`|[A-z0-9\_]+))?)/g;
    const TAG_ATTR_REG = new RegExp(TAG_REG.source + ATTR_REG.source + '+' + TAG_END_REG.source, 'g');
    const TAG_CLOSE_REG = new RegExp(TAG_END_REG.source + '$');

    let loop = true;
    while (loop) {
        // Matches with attributes start tag
        let res = TAG_ATTR_REG.exec(str);
        if (res) {
            // indentation
            let indent = res[1];
            // tag content
            let tagContent = res[0];
            let tagName = tagContent.match(TAG_NAME_REG);
            if (tagName  && unBreakAttrList.includes(tagName[1])) {
                // Inline label 
                continue;
            }
            // console.log(tagContent + '\n\n');
            // Attr matching tagContent 
            let matchRes = tagContent.match(ATTR_REG);
            // matchRes processing 
            // console.log(matchRes);
            if (matchRes && matchRes.length > breakLimitNum) { // 一个属性强制断行，或者多属性
                // Each attr trims first, then adds newlines and spaces
                let newStr = tagContent.replace(ATTR_REG, (match, $1) => {
                    return '\n' + indent + padIndent + $1.trim();
                });
                // tag closing bracket wrap
                newStr = attrEndWithGt ? newStr : newStr.replace(TAG_CLOSE_REG, '\n' + indent + '$1');
                // Replace the corresponding content in the entire string
                str = str.replace(tagContent, newStr);
            }
        } else {
            loop = false;
        }
    }
    return str;
}

export default breakTagAttr;