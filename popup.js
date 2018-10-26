function getCurrentTabUrl(callback) {
  const queryInfo = {
    url: '*://trello.com/*'
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    const tab = tabs[0];
    callback(tab);
  });
}

function s2ab(s) {
  if (typeof ArrayBuffer !== 'undefined') {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  } else {
    const buf = new Array(s.length);
    for (let i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }
}

function parseTrelloBoards(boardColumns) {
  const columnsHeader = [];
  const titles = [];

  for (let i = 0; i< boardColumns.length; i++) {
    const dom = new DOMParser();
    const nodeList = dom.parseFromString(boardColumns[i], 'text/html');

    columnsHeader[i] = nodeList.querySelector('h2').innerText;

    const cardTitles = nodeList.querySelectorAll('.list-card-title');
    const cardsInEachColumn = []

    for (let j = 0; j < cardTitles.length; j++) {
      cardsInEachColumn[j] = { title: cardTitles[j].innerText };
    }

    titles[columnsHeader[i]] = cardsInEachColumn;
  }

  let aoa = [];
  let total = 0;
  let current = 0;
  let rowCount = 0;
  let colCount = 0;

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

  const ws = XLSX.utils.aoa_to_sheet([Object.keys(titles)]);

  XLSX.utils.sheet_add_aoa(ws, aoa, { origin: -1});

  document.getElementById("sheet").innerHTML = XLSX.utils.sheet_to_html(ws, {
    editable: true
  }).replace("<table>", '<table id="table" border="1">');

  const sheet = XLSX.utils.table_to_book(document.getElementById('sheet'), {
    sheet: "Trello"
  });

  const wbout = XLSX.write(sheet, {
    bookType: 'xlsx',
    bookSST: true,
    type: 'binary'
  });

  const blob = new Blob(
    [s2ab(wbout)],
    { type: "application/octet-stream" }
  );

  const url = URL.createObjectURL(blob);

  chrome.downloads.download({
    url: url,
    filename: 'trello.xlsx',
    saveAs: true
  });
}

chrome.extension.onRequest.addListener(parseTrelloBoards);

document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabUrl((selectedTab) => {
    const download = document.getElementById('download');

    download.style.display = 'none';

    if (selectedTab && selectedTab.selected && selectedTab.url.indexOf('trello.com') >= 0) {
      download.style.display = 'block';
    }
    
    download.addEventListener('click', () => {
      const tab = selectedTab;

      chrome.tabs.executeScript(
        tab.id, { file: 'find_trello_columns.js', allFrames: true }
      );
    });
  });
});