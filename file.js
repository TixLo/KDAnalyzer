var save = function() {
    var text = JSON.stringify(db),
        blob = new Blob([text], { type: 'text/plain' }),
        anchor = document.createElement('a');

    anchor.download = "kdanalyzer.json";
    anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
    anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
    anchor.click();
}

function read_files(event) {
    var fileList = event.target.files;

    for(var i=0; i < fileList.length; i++ ) {
        load_data(fileList[i]);
    }
}

function load_data(theFile) {
    var reader = new FileReader();

    reader.onload = function(loadedEvent) {
        var new_db = JSON.parse(loadedEvent.target.result);
        for (var key in new_db) {
            if (db[key] === undefined) {
                db[key] = new_db[key];
            }
        }
        gen_db_tbl();
    }
    reader.readAsText(theFile);
}