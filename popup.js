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
  const columnsHeader = [];
  var titles = [];

  for (var i = 0; i< boardColumns.length; i++) {
    var dom = new DOMParser();
    var nodeList = dom.parseFromString(boardColumns[i], 'text/html');

    columnsHeader[i] = nodeList.querySelector('h2').innerText;

    var cardTitles = nodeList.querySelectorAll('.list-card-title');
    var cardsInEachColumn = []

    for (var j = 0; j < cardTitles.length; j++) {
      cardsInEachColumn[j] = { title: cardTitles[j].innerText };
    }

    titles[columnsHeader[i]] = cardsInEachColumn;
  }

  var aoa = [];
  var total = 0;
  var current = 0;
  var rowCount = 0;
  var colCount = 0;

  for (let row in titles) {
    colCount = 0;

    aoa[rowCount] = new Array();

    for (let col in titles) {
        if(titles[col][rowCount]) {
            aoa[rowCount][colCount] = titles[col][rowCount].title;
        }

        colCount++;
    }

    rowCount++;
  }

  var ws = XLSX.utils.aoa_to_sheet([Object.keys(titles)]);

  XLSX.utils.sheet_add_aoa(ws, aoa, { origin: -1});

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