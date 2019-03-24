var htmlList = [];

var wrapper = document.querySelector('.board-wrapper');

if (wrapper) {
    wrapper = true;
}

var list = document.querySelectorAll('.js-list-content');

for (var i = 0; i < list.length; i++) {
    htmlList[i] = list[i].innerHTML;
}

chrome.extension.sendRequest({
    list: htmlList,
    isTrelloBoard: wrapper
});