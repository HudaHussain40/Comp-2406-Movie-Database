
document.querySelectorAll(".removePeopleFollow").forEach( item => {
    item.addEventListener('click', removeFromPeopleFollowing);
});

function removeFromPeopleFollowing() {
    let use = this.value.split(",");
    console.log(use);
    let l = "/users/"+use[0]+"/followedPeople/"+use[1];
    console.log(this.id);
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let parent = document.getElementById("removePerson").parentNode;
            document.getElementById("removePerson").remove();
            console.log(parent);
            let message = document.createTextNode("Unfollowed");
            parent.appendChild(message);
        } 
    }
    xhttp.open("DELETE",l, true);
    xhttp.send();
}

