var newname = document.getElementById("newname"); 
var updatebutton = document.getElementById("tupdate");


function validateform(x) {
    if (x == null || x == "") {
        return false;
    }
    return true;
}

function checkupdate(updatebutton) {
    console.log("INNN")
    var filled = validateform(newname.value);
    if (filled == true) {
        return confirm('Are you sure?');
    }
    else {
        alert("What kind of a trainer doesn't have a name?");
        return false;
    }
}