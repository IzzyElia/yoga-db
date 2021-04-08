const userID = makeid(64)

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function getStringAsLowercaseWithNoSpaces(str) {
    return str.replace(/[^0-9a-z]/gi, '').toLowerCase();
}

function replaceUnderscoresWithSpaces(str) {
    return str.replace(/_/g, ' ');
}

function breakStringIntoIndividualWords (str) {
    return 
}

function storeCaret() {
    
    const selection = document.getSelection();
    let ranges = []
    for (let i = 0; i < selection.rangeCount; i++) {
        const x = selection.getRangeAt(0);
        ranges.push(x);
    }
    console.log('storing:'+JSON.stringify(ranges));
    return ranges;
    /*
    cursorPos=document.selection.createRange().duplicate();
    const clickx = cursorPos.getBoundingClientRect().left;
    const clicky = cursorPos.getBoundingClientRect().top;
    return {
        x: clickx,
        y: clicky
    }
    */
}

function restoreCaret(ranges) {
    let selection = document.getSelection();
    selection.removeAllRanges()
    for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        selection.addRange(range);
    }

    /*
    let cursorPos = document.body.createTextRange();
    cursorPos.moveToPoint(pos.x, pos.y);
    cursorPos.select();
    */
}