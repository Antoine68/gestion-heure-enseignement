function listElements(){
    let idDecomposition = document.getElementById("decomposition-id").value;
    fetch(document.location.origin+'/decompositions/elements/'+idDecomposition+'/liste', {
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
        method: 'get'
    }).then(response => {
        if (response.ok) {
            response.json().then(function(data) {
                console.log(data);
                populateTree(data);
            });
        } else {
            showNotification("fail", "Erreur: la décomposition n'a pas pu être chargée");
        }
    });
}


function populateTree(data){
    let treeDOM = document.getElementsByClassName("tree")[0];
    treeDOM.innerHTML = "";
    let liRoot = createDOMTreeElement(data.root);
    treeDOM.appendChild(liRoot);
    data.tree.sort(compare);
    for(let i=0; i<data.tree.length; i++){
        addElement(data.tree[i]);
    }
    
}

function createDOMTreeElement(element){
    let liElement = document.createElement("li");
    liElement.id = element._id;
    let span = document.createElement("span");
    span.innerHTML = element.nickname;
    span.param = element;
    span.addEventListener("click", manageElementClick, false);
    liElement.appendChild(span);
    if(element.children === undefined  || element.children.length > 0 ){
        let ul = document.createElement("ul");
        liElement.appendChild(ul);
    }
    return liElement;
}

function manageElementClick(evt) {
    let idDecomposition = document.getElementById("decomposition-id").value;
    let span = evt.currentTarget;
    let element = span.param;
    let modal = document.getElementById("element-modal");
    let content = modal.getElementsByClassName("content")[0];
    content.innerHTML = "<p>Titre: "+element.title+"</p><p>Surnom: "+ (element.nickname ? element.nickname : "non défini") +"</p><p>Reference: "+ (element.reference ? element.reference : "non défini") +"</p><p>Ordre: "+ (element.order ? element.order : "non défini")+ "</p>";
    if(typeof element.hour_volume !== "undefined") {
        if(element.hour_volume.TP !== null || element.hour_volume.TD !== null || element.hour_volume.CM !== null) {
            content.innerHTML += "<label>Volume d'heures prévu : <label>";
        }
        if(element.hour_volume.TP !== null) {
            content.innerHTML += "<div class='control'><div class='tags has-addons'><span class='tag is-dark'>TP</span><span class='tag is-primary'> "+ element.hour_volume.TP +"</span></div></div>";
        }
        if(element.hour_volume.TD !== null) {
            content.innerHTML += "<div class='control'><div class='tags has-addons'><span class='tag is-dark'>TD</span><span class='tag is-primary'> "+ element.hour_volume.TD +"</span></div></div>";
        }
        if(element.hour_volume.CM !== null){
            content.innerHTML += "<div class='control'><div class='tags has-addons'><span class='tag is-dark'>CM</span><span class='tag is-primary'> "+ element.hour_volume.CM +"</span></div></div>";
        }
    }
    modal.getElementsByClassName("button-edit")[0].href = "/decompositions/elements/"+ idDecomposition +"/modifier/"+ element._id;
    modal.getElementsByClassName("button-add-child")[0].href = "/decompositions/elements/"+ idDecomposition +"/ajouter/parent/"+ element._id;
    modal.classList.add("is-active");
    
}

function addElement(element){
    let ulParent = document.getElementById(element.parent).getElementsByTagName("ul")[0];
    let liElement = createDOMTreeElement(element);
    ulParent.appendChild(liElement);
    element.children.sort(compare);
    for(let j=0; j<element.children.length; j++){
        addElement(element.children[j]);
    }
}

function compare( a, b ) {
    if ( a.order < b.order ){
      return -1;
    }
    if ( a.order > b.order ){
      return 1;
    }
    return 0;
}




document.addEventListener("DOMContentLoaded", function(){
    listElements();
});
