document.querySelectorAll(".removeMovieWatchList").forEach( item => {
    item.addEventListener('click', removeFromWatchList);
});

function removeFromWatchList() {
    let use = this.value.split(",");
    console.log(use);
    let l = "/users/"+use[0]+"/watchList/"+use[1];
    console.log(this.id);
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let parent = document.getElementById("removeWatch").parentNode;
            document.getElementById("removeWatch").remove();
            console.log(parent);
            let message = document.createTextNode("Removed");
            parent.appendChild(message);
        } 
    }
    xhttp.open("DELETE",l, true);
    xhttp.send();
}

