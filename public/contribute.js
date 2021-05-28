let newMovie = {Actors:[], Director:[], Writer:[], Title:"", Runtime:"", Year:0,Genre:[], Released:"", Plot:""}
let GenreOptions = {};

document.getElementById("actors").oninput = getActors;
document.getElementById("director").oninput = getDirectors;
document.getElementById("writers").oninput = getWriters;
function addMovie() {
    if (!validMovie()) {
        alert("You need to fill all the boxes");
    }
    else {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 201) {
                console.log("ok");
                console.log("this is the response"+this.response);
                let link = JSON.parse(this.response).link;
                let m = document.getElementById("movieEntry");
                m.innerHTML="";
                let a = document.createElement('a');
                let t = document.createTextNode("Sucess! Go to this link to check it out!");
                a.appendChild(t);
                a.href = link;
                m.appendChild(a);
            } 
        }
        let link = "/movies"
        xhttp.open("POST",link,true);
        console.log(JSON.stringify(newMovie))
	    xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify(newMovie));
    }
}



function validMovie() {
    if(newMovie.Actors.length <= 0) {
        return false;
    }
    if(newMovie.Director.length <= 0) {
        return false;
    }
    if(newMovie.Writer.length <= 0) {
        return false;
    }
    if(newMovie.Title.length <= 0) {
        return false;
    }
    if(newMovie.Runtime.length <= 0) {
        return false;
    }
    if(newMovie.Plot.length <= 0) {
        return false;
    }
    if(newMovie.Year <= 0) {
        return false;
    }
    if(newMovie.Released.length <= 0) {
        return false;
    }
    return true;
}

function getWriters() {
    getPeople(document.getElementById("writerSelect"), this.value);
}

function getActors() {
    getPeople(document.getElementById("actorSelect"), this.value);
}

function getDirectors() {
    getPeople(document.getElementById("directorSelect"), this.value);
}

function addReleased() {
    let released = document.getElementById("releaseYear").value;
    if(released==="") {
        return;
    }
    released = released.split("-");
    let monthText = getMonthText(Number(released[1]))
    let releasedText = released[2]+" "+monthText+" "+released[0];
    console.log(monthText);
    let Year = Number(released[0]);
    console.log(releasedText)
    console.log(Year)
    let p = document.getElementById("ReleasedInfo");
    p.innerText = releasedText;
    newMovie.Released = releasedText;
    newMovie.Year = Year;

    console.log(newMovie.Released);
    console.log(newMovie.Year);

}

function addPlot() {
    let plot = document.getElementById("plot").value;
    if(plot==="") {
        return;
    }
    let p = document.getElementById("PlotInfo");
    p.innerText = plot;
    newMovie.Plot = plot;
    console.log(newMovie.Plot);

}

function addGenre() {
    
    let genre = document.getElementById("genre").value;
    genre = genre.trim();
    if(genre === "") {
        return;
    }
    for(let i =0; i < newMovie.Genre.length; i++) {
        if(equalString(newMovie.Genre[i], genre)) {
            console.log("they are equal")
            return;
        }
    }
    newMovie.Genre.push(genre);
    let p = document.getElementById("genreList");
    p.innerText += genre+", ";
    console.log(newMovie.Genre);
    return;

}

function equalString(s1, s2) {

    if (s1.toUpperCase() === s2.toUpperCase()) {
        return true;
    }
    return false;
}

function getMonthText(m) {
    if(m<1||m>12) {
        return "Error"
    }
    let months={1:"Jan", 2:"Feb", 3:"Mar", 4:"Apr",5:"May",6:"Jun",7:"Jul",8:"Aug",9:"Sep",10:"Oct",11:"Nov",12:"Dec"}
    return months[m];
}

function addTitle() {
    let title = document.getElementById("title").value;
    if(title === "") {
        return;
    }
    newMovie.Title = title;
    let p = document.getElementById("TitleInfo");
    p.innerText = title;
    console.log(newMovie.Title)
    return;
}

function addRunTime() {
    let runtime = document.getElementById("runtime").value;
    if(runtime <=0 ) {
        return;
    }
    newMovie.Runtime = runtime+" min"
    let p = document.getElementById("RunTimeInfo");
    p.innerText = runtime+" min";
    console.log(newMovie.Runtime)
    return;
}

function getPeople(x, name) {
    console.log(name)
    if(name==="") {
        x.innerHTML=""
    }
    else{
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log(this.response);
                let options = JSON.parse(this.response);
                console.log(options);
                console.log(options.length)
                updateOptions(x, options);
                return;
            } 
        }
        let link = "/people/?Name="+name
        xhttp.open("GET",link,true);
        xhttp.setRequestHeader("Accept", "application/json");
        xhttp.send();
    }
   
}

function updateOptions(x, options) {
    x.innerHTML=""
    for(let i = 0; i < options.length; i++) {
        let option = document.createElement("option");
        option.text = options[i];
        x.add(option);
    }
}

function addWriter() {
    let writer = document.getElementById("writerSelect").value;
    if(writer==="") {
        return;
    }
    for(let i =0; i < newMovie.Writer.length; i++) {
        if(equalString(newMovie.Writer[i], writer)) {
            console.log("they are equal")
            return;
        }
    }
    console.log(writer);
    let writerList = document.getElementById("writerList")
    writerList.innerText = writerList.innerText + writer+", "
    newMovie.Writer.push(writer);
    console.log(newMovie);
    console.log(newMovie.Writer);
}

function addActor() {
    let actor = document.getElementById("actorSelect").value;
    if(actor==="") {
        return;
    }
    for(let i =0; i < newMovie.Actors.length; i++) {
        if(equalString(newMovie.Actors[i], actor)) {
            console.log("they are equal")
            return;
        }
    }
    console.log(actor);
    let actorsList = document.getElementById("actorsList")
    actorsList.innerText = actorsList.innerText + actor+", "
    newMovie.Actors.push(actor);
    console.log(newMovie);
    console.log(newMovie.Actors);
}

function addDirector() {
    let director = document.getElementById("directorSelect").value;
    if(director==="") {
        return;
    }
    for(let i =0; i < newMovie.Director.length; i++) {
        if(equalString(newMovie.Director[i], director)) {
            console.log("they are equal")
            return;
        }
    }
    let directorList = document.getElementById("directorList")
    directorList.innerText = directorList.innerText + director+", "
    newMovie.Director.push(director);
    console.log(newMovie);
    console.log(newMovie.Director);
}


function addPerson() {
    let person = document.getElementById("person").value;
    console.log(person);
	if(person.length == 0){
		alert("You must enter a persons name.");
		return;
	}
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 201) {
            console.log("ok person got added")
            let r = document.getElementById("personReponse");
            r.innerHTML="";
            let t = document.createTextNode("Successfully Added!");
            r.appendChild(t);
            return;
        } 
        else if(this.readyState == 4 && this.status == 409) {
            let r = document.getElementById("personReponse");
            r.innerHTML="";
            let t = document.createTextNode("Person Already Exists in Database!");
            r.appendChild(t);
            return;
        }
    }
    xhttp.open("POST", '/people/');
    let p = {Name: person};
    console.log(p);
    console.log(JSON.stringify(p))
	xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(p));
}

