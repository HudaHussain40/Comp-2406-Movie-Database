
document.querySelectorAll(".unfollowPerson").forEach( item => {
    item.addEventListener('click', unfollowPerson);
});

document.querySelectorAll(".unfollowUser").forEach( item => {
    item.addEventListener('click', unfollowUser);
});

document.querySelectorAll(".removeMovieWatchList").forEach( item => {
    item.addEventListener('click', removeMovieWatchList);
});


document.querySelectorAll(".deleteNotif").forEach( item => {
    item.addEventListener('click', deleteNotif);
});

document.querySelectorAll(".contributingTrue").forEach( item => {
    item.addEventListener('click', contributeTrue);
});

document.querySelectorAll(".contributing").forEach( item => {
    item.addEventListener('click', contribute);
});

function contribute() {
    let m = this;
    let l = this.value;
    l = l.split(",")
    console.log(l);
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
        } 
    }
    xhttp.open("PUT", '/users/'+l[1]);
	let c = {Contributing: l[0]};
    console.log(c);
    console.log(JSON.stringify(c))
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify(c));
}

function unfollowPerson() {
    let m = this;
    let l = this.value;
    console.log(this.id);
    
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let parent = document.getElementById(m.id).parentNode;
            
            parent.remove();
        } 
    }
    xhttp.open("DELETE",l, true);
    xhttp.send();
}



function unfollowUser() {
    let m = this;
    let l = this.value;
    console.log(this.id);
    console.log(m,l);
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let parent = document.getElementById(m.id).parentNode;
            console.log(parent);
            console.log(document.getElementById(m.id).parentElement.id === "userPage");
            if(document.getElementById(m.id).parentElement.id === "userPage") {
                document.getElementById(m.id).remove();
                let message = document.createTextNode("Unfollowed");
                parent.appendChild(message);
            }
            else {
                parent.remove();
            }
        } 
    }
    xhttp.open("DELETE",l, true);
    xhttp.send();
}

function removeMovieWatchList() {
    let m = this;
    let l = this.value;
    console.log(this.id);
    console.log(m);
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById(m.id).parentNode.remove();
        } 
    }
    xhttp.open("DELETE",l, true);
    xhttp.send();
}

function removeMovieRecommend() {
    let itemName = this.value;
    console.log(itemName);
}

function deleteNotif() {
    let m = this;
    let l = this.value;
    console.log(this.id);
    console.log(m);
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById(m.id).parentNode.remove();
        } 
    }
    xhttp.open("DELETE",l, true);
    xhttp.send();
}

