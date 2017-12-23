function getCurrentTabUrl(callback) {
  var queryInfo = {
    url: '*://trello.com/*'
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    var tab = tabs[0];
    callback(tab);
  });
}

function s2ab(s) {
  if (typeof ArrayBuffer !== 'undefined') {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  } else {
    var buf = new Array(s.length);
    for (var i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }
}

function parseTrelloBoards(boardColumns) {
  var columnsHeader = [];
  var titles = [];

  for (var i =0; i< boardColumns.length; i++) {
    var dom = new DOMParser();
    var nodeList = dom.parseFromString(boardColumns[i], 'text/html');

    columnsHeader[i] = nodeList.querySelector('h2').innerText;

    var cardTitles = nodeList.querySelectorAll('.list-card-title');
    var cardsInEachColumn = []
    
    for (var j = 0; j < cardTitles.length; j++) {
      cardsInEachColumn[j] = cardTitles[j].innerText;
    }

    titles[i] = cardsInEachColumn;
  }
  
  var aoa = [
    columnsHeader,
  ];

  var ws = XLSX.utils.aoa_to_sheet(aoa);

  document.getElementById("sheet").innerHTML = XLSX.utils.sheet_to_html(ws, {
    editable: true 
  }).replace("<table>", '<table id="table" border="1">');

  var sheet = XLSX.utils.table_to_book(document.getElementById('sheet'), {
    sheet: "Trello" 
  });

  var wbout = XLSX.write(sheet, {
    bookType: 'xlsx',
    bookSST: true,
    type: 'binary'
  });

  var blob = new Blob(
    [s2ab(wbout)],
    { type: "application/octet-stream" }
  );

  var url = URL.createObjectURL(blob);

  chrome.downloads.download({
    url: url,
    filename: 'trello.xlsx',
    saveAs: true
  });
}

chrome.extension.onRequest.addListener(parseTrelloBoards);

document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabUrl((selectedTab) => {
    var download = document.getElementById('download');

    download.addEventListener('click', () => {
      var tab = selectedTab;

      chrome.tabs.executeScript(
        tab.id, { file: 'find_trello_columns.js', allFrames: true }
      );
    });
  });
});