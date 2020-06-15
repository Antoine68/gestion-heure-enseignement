function listTeachers(){
    let idProject = document.getElementById("project-id").value;
    fetch(document.location.origin+'/projets/intervenants/'+idProject+'/listes', {
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
        method: 'get'
    }).then(response => {
        if (response.ok) {
            response.json().then(function(data) {
                populateTables(data);
            });
        } else {
            showNotification("fail", "Erreur: les intervenants n'ont pas pu être chargés");
        }
    });
}

function addUsedTeacher(idTeacher, tr){    
    let idProject = document.getElementById("project-id").value;
    fetch(document.location.origin+'/projets/intervenants/store', {
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            method: 'put',
            body: JSON.stringify ({
                id_project: idProject,
                id_teacher: idTeacher,
                min_mandatory_hour: tr.getElementsByClassName("min-mandatory-hour")[0].value,
                max_mandatory_hour: tr.getElementsByClassName("max-mandatory-hour")[0].value,
                min_additional_hour: tr.getElementsByClassName("min-additional-hour")[0].value,
                max_additional_hour: tr.getElementsByClassName("max-additional-hour")[0].value
            })
        }).then(response => {
            if (response.ok) {
                showNotification("success", "Intervenant ajouté");
                listTeachers();
            } else {
                if(response.status === 403) {
                    response.json().then(errors => {
                        let err = errors.errors.errors;
                        let message = "<ul>";
                        for(let i=0; i<err.length; i++){
                            message += "<li>"+err[i].msg+"</li>";
                        }
                        message += "</ul>";
                        showNotification("fail", "Erreur dans le formulaire :" + message, false);
                    })
                }else{
                    showNotification("fail", "Erreur: l'intervenant n'as pas pu être modifié");
                }
            }
        });
    
}

function removeUsedTeacher(idSpeaker){  
    fetch(document.location.origin+'/projets/intervenants/delete/'+idSpeaker, {
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            method: 'delete',
            body: JSON.stringify ({
            })
        }).then(response => {
            if (response.ok) {
                showNotification("success", "Intervenant retiré");
                listTeachers();
            } else {
                showNotification("fail", "Erreur: l' intervenant n'a pas pu être retiré");
            }
        });
}

function editUsedTeacher(idSpeaker, tr){    
    fetch(document.location.origin+'/projets/intervenants/edit/'+idSpeaker, {
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            method: 'put',
            body: JSON.stringify ({
                min_mandatory_hour: tr.getElementsByClassName("min-mandatory-hour")[0].value,
                max_mandatory_hour: tr.getElementsByClassName("max-mandatory-hour")[0].value,
                min_additional_hour: tr.getElementsByClassName("min-additional-hour")[0].value,
                max_additional_hour: tr.getElementsByClassName("max-additional-hour")[0].value
            })
        }).then(response => {
            if (response.ok) {
                showNotification("success", "Intervenant modifié");
                listTeachers();
            } else {
                if(response.status === 403) {
                    response.json().then(errors => {
                        let err = errors.errors.errors;
                        let message = "<ul>";
                        for(let i=0; i<err.length; i++){
                            message += "<li>"+err[i].msg+"</li>";
                        }
                        message += "</ul>";
                        showNotification("fail", "Erreur dans le formulaire :" + message, false);
                    })
                }else{
                    showNotification("fail", "Erreur: l'intervenant n'as pas pu être modifié");
                }
                
            }
        });
}

function populateTables(data){
    populateUsedTable(data.usedTeachers);
    populateUnusedTable(data.unusedTeachers);
}

function manageTextTr(tr){
    let data = tr.params;
    let tdMandatoryHour = tr.getElementsByClassName("mandatory-hour")[0];
    let tdAdditionalHour = tr.getElementsByClassName("additional-hour")[0];
    let tdActions = tr.getElementsByClassName("actions")[0];
    tdActions.innerHTML = "";
    tdMandatoryHour.innerHTML = data.min_mandatory_hour + ' - '+ data.max_mandatory_hour;
    tdAdditionalHour.innerHTML = data.min_additional_hour +' - '+ data.max_additional_hour;
    let buttonEdit = document.createElement("button");
    buttonEdit.classList.add("button-link");
    buttonEdit.title = "Modifier";
    buttonEdit.innerHTML = "<i class='fas fa-edit'></i>";
    buttonEdit.addEventListener("click", function() {
        manageEditTr(tr);
    });
    let buttonRemove = document.createElement("button");
    buttonRemove.classList.add("button-link");
    buttonRemove.title = "Retirer";
    buttonRemove.innerHTML = "<i class='fas fa-minus'></i>";
    buttonRemove.addEventListener("click", function() {
        openModalRemove(data._id);
    });
    tdActions.appendChild(buttonEdit);
    tdActions.appendChild(buttonRemove);
}
function manageEditTr(tr){
    let data = tr.params;
    let tdMandatoryHour = tr.getElementsByClassName("mandatory-hour")[0];
    let tdAdditionalHour = tr.getElementsByClassName("additional-hour")[0];
    let tdActions = tr.getElementsByClassName("actions")[0];
    tdActions.innerHTML = "";
    tdMandatoryHour.innerHTML = '<div class="input-modal-container"><input class="input input-modal min-mandatory-hour" type="text" placeholder="min" value="'+ data.min_mandatory_hour  +'"> - <input class="input input-modal max-mandatory-hour" type="text" placeholder="max" value="'+ data.max_mandatory_hour +'"></div>';
    tdAdditionalHour.innerHTML ='<div class="input-modal-container"><input class="input input-modal min-additional-hour" type="text" placeholder="min" value="'+ data.min_additional_hour  +'"> - <input class="input input-modal  max-additional-hour" type="text" placeholder="max" value="'+ data.max_additional_hour +'"></div>';
    let buttonEdit = document.createElement("button");
    buttonEdit.classList.add("button-link");
    buttonEdit.title = "Enregistrer les modifications";
    buttonEdit.innerHTML = "<i class='fas fa-save'></i>";
    buttonEdit.addEventListener("click", function() {
        editUsedTeacher(data._id, tr);
    });
    let buttonCancel = document.createElement("button");
    buttonCancel.classList.add("button-link");
    buttonCancel.title = "Annuler les modifications";
    buttonCancel.innerHTML = "<i class='fas fa-times'></i>";
    buttonCancel.addEventListener("click", function() {
        manageTextTr(tr);
    });
    tdActions.appendChild(buttonEdit);
    tdActions.appendChild(buttonCancel);
}


function populateUsedTable(data){
    let tbody = document.getElementById("tbody-used");
    tbody.innerHTML = "";
    for(let i=0; i<data.length; i++){
        let tr = document.createElement("tr");
        tr.params = data[i];
        let tdLastName = document.createElement("td");
        tdLastName.setAttribute("data-search", "last_name_1");
        let tdFirstName = document.createElement("td");
        tdFirstName.setAttribute("data-search", "first_name_1");
        let tdNickname = document.createElement("td");
        tdNickname.setAttribute("data-search", "nickname_1");
        let tdMandatoryHour = document.createElement("td");
        tdMandatoryHour.setAttribute("class", "mandatory-hour");
        let tdAdditionalHour = document.createElement("td");
        tdAdditionalHour.setAttribute("class", "additional-hour");
        let tdStatus = document.createElement("td");
        tdStatus.setAttribute("data-search", "status_1");
        let tdActions = document.createElement("td");
        tdActions.setAttribute("class", "actions");
        tdLastName.innerHTML = data[i].teacher.last_name;
        tdFirstName.innerHTML = data[i].teacher.first_name;
        tdNickname.innerHTML = data[i].teacher.nickname;
        tdStatus.innerHTML = data[i].teacher.status.name;
        tr.appendChild(tdLastName);
        tr.appendChild(tdFirstName);
        tr.appendChild(tdNickname);
        tr.appendChild(tdMandatoryHour);
        tr.appendChild(tdAdditionalHour);
        tr.appendChild(tdStatus);
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
        manageTextTr(tr);
    }
}
function populateUnusedTable(data){
    let tbody = document.getElementById("tbody-unused");
    tbody.innerHTML = "";
    for(let i=0; i<data.length; i++){
        let tr = document.createElement("tr");
        let tdLastName = document.createElement("td");
        tdLastName.setAttribute("data-search", "last_name");
        let tdFirstName = document.createElement("td");
        tdFirstName.setAttribute("data-search", "first_name");
        let tdNickname = document.createElement("td");
        tdNickname.setAttribute("data-search", "nickname");
        let tdMandatoryHour = document.createElement("td");
        let tdAdditionalHour = document.createElement("td");
        let tdStatus = document.createElement("td");
        tdStatus.setAttribute("data-search", "status");
        let tdActions = document.createElement("td");
        tdLastName.innerHTML = data[i].last_name;
        tdFirstName.innerHTML = data[i].first_name;
        tdNickname.innerHTML = data[i].nickname;
        tdMandatoryHour.innerHTML = '<div class="input-modal-container"><input class="input input-modal min-mandatory-hour" type="text" placeholder="min" value="'+ data[i].status.min_mandatory_hour  +'"> - <input class="input input-modal max-mandatory-hour" type="text" placeholder="max" value="'+ data[i].status.max_mandatory_hour +'"></div>';
        tdAdditionalHour.innerHTML = '<div class="input-modal-container"><input class="input input-modal min-additional-hour" type="text" placeholder="min" value="'+ data[i].status.min_additional_hour  +'"> - <input class="input input-modal  max-additional-hour" type="text" placeholder="max" value="'+ data[i].status.max_additional_hour +'"></div>';
        tdStatus.innerHTML = data[i].status.name;
        let buttonAdd = document.createElement("button");
        buttonAdd.classList.add("button-link");
        buttonAdd.title = "Ajouter";
        buttonAdd.innerHTML = "<i class='fas fa-plus'></i>";
        buttonAdd.addEventListener("click", function() {
            addUsedTeacher(data[i]._id, tr);
        });
        tdActions.appendChild(buttonAdd);
        tr.appendChild(tdLastName);
        tr.appendChild(tdFirstName);
        tr.appendChild(tdNickname);
        tr.appendChild(tdMandatoryHour);
        tr.appendChild(tdAdditionalHour);
        tr.appendChild(tdStatus);
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
        
    }  
}

function openModalRemove(idSpeaker) {
    let modal = document.getElementById("remove-modal");
    let buttonContainer = document.getElementById("button-remove-container");
    let button = document.createElement("button");
    button.addEventListener("click", function() {
        removeUsedTeacher(idSpeaker);
        closeModals();
    });
    button.setAttribute("class", "button is-primary")
    button.innerHTML = "Retirer";
    buttonContainer.innerHTML = "";
    buttonContainer.appendChild(button);
    modal.classList.add("is-active");
}

document.addEventListener("DOMContentLoaded", function(){
    listTeachers();
});
