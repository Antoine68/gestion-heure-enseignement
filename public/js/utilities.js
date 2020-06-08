function openDeleteModal(action){
    let deleteModal = document.getElementById("delete-modal");
    deleteModal.getElementsByClassName("form-delete")[0].action = action + "?_method=delete";
    deleteModal.classList.add("is-active"); 
}
function openArchivateModal(action){
    let archivateModal = document.getElementById("archivate-modal");
    archivateModal.getElementsByClassName("form-archivate")[0].action = action;
    archivateModal.classList.add("is-active"); 
}

function openListTeachersModal(){
    let listModal = document.getElementById("list-modal");
    listModal.classList.add("is-active"); 
}

function openInformationModal(){
    let listModal = document.getElementById("information-modal");
    listModal.classList.add("is-active"); 
}

function closeModals(){
    let modals = document.getElementsByClassName("modal");
    for(let i=0; i<modals.length; i++){
        modals[i].classList.remove("is-active");
    }
}

function generateTeacherNickname(){
    let first_name = document.querySelector("input#first_name").value;
    let last_name = document.querySelector("input#last_name").value;
    if(first_name !== null && first_name !== "" && last_name !== null && last_name !== "" && first_name.length > 0 && last_name.length > 0 && (first_name.length + last_name.length > 2)){
        let nckname = "";
        let beg = first_name.split("-",2);
        if(beg.length === 2  && beg[0] !== "" && beg[1] !== ""  || (last_name.length === 1 && beg.length < 2 ) ) {
            nckname += beg[0][0].toUpperCase();
            nckname += beg[1][0].toUpperCase();
            nckname += last_name[0].toUpperCase();
        }else{
            nckname += beg[0][0].toUpperCase();
            nckname += last_name[0].toUpperCase();
            nckname += last_name[1].toUpperCase();
        }
        document.querySelector("input#nickname").value = nckname;
    }else{
        document.querySelector("input#nickname").value = "";
    }

}

function searchTable(select = "select-search", input = "input-search" ){
    let selectSearch = document.getElementById(select);
    let searchField = selectSearch.options[selectSearch.selectedIndex].value;

    let searchValue = document.getElementById(input).value;

    searchValue = searchValue.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let tds = document.querySelectorAll("td[data-search="+ searchField +"]");
    for (i = 0; i < tds.length; i++) {
        txtValue = tds[i].textContent || tds[i].innerText;
        if (txtValue.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").indexOf(searchValue) > -1) {
            tds[i].parentNode.style.display = "";
        } else {
            tds[i].parentNode.style.display = "none";     
        }
        if(tds[i].parentNode.hasAttribute("data-search-id")){
            let others = document.querySelectorAll("[data-search-id='"+ tds[i].parentNode.getAttribute("data-search-id") +"']");
            for(let j=0; j<others.length; j++ ){
                others[j].style.display = tds[i].parentNode.style.display;
            }
        }
    }
}

function hideShowSubFolder(idFolder){
    let folderContainer = document.querySelector("li[data-id='"+ idFolder +"']");
    let buttonFolder = folderContainer.getElementsByClassName("btn-folder")[0];
    let subFolder = folderContainer.getElementsByClassName("sub-folder")[0];
    if(subFolder.style.display === "none"){
        subFolder.style.display = "";
        buttonFolder.classList.remove("fa-folder");
        buttonFolder.classList.add("fa-folder-open");
        folderContainer.style.marginBottom = "80px";
    }else{
        subFolder.style.display = "none";
        buttonFolder.classList.remove("fa-folder-open");
        buttonFolder.classList.add("fa-folder");
        folderContainer.style.marginBottom = "0";

    }
}

function showNotification(type, message, timer = true){
    let body = document.getElementsByTagName("body")[0];
    let notificationContainer = document.createElement("div");
    notificationContainer.setAttribute("class", "notification-container");
    let notification = document.createElement("div");
    notification.setAttribute("class", "notification notification-"+type);

    let button = document.createElement("button");
    button.setAttribute("class", "delete");
    button.addEventListener("click", function(){
        body.removeChild(notificationContainer);
    });
    notification.appendChild(button);
    let strong = document.createElement("strong");
    strong.innerHTML = message;
    notification.appendChild(strong);

    notificationContainer.appendChild(notification);
    body.appendChild(notificationContainer);

    notificationContainer.animate([
        { top: '-10%' }, 
        { top: '5px' }
      ], { 
        duration: 200,
      });

    if(timer){
        setTimeout(function(){ body.removeChild(notificationContainer); }, 1500); 
    }
     
}

function manageInputType(){
    let inputType = document.getElementById("input_type").value;
    let coursesTypes = document.getElementById("courses-types-container");
    let forfait = document.getElementById("forfait-container");
    if(inputType === "aucun") {
        coursesTypes.style.display = "none";
        forfait.style.display = "none";
    } else if(inputType === "hebdomadaire") {
        coursesTypes.style.display = "";
        forfait.style.display = "none";
    } else if(inputType === "global"){
        coursesTypes.style.display = "";
        forfait.style.display = "";
    }
}
