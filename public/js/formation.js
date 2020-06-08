function listElements(){
    let idFormation = document.getElementById("formation-id").value;
    fetch(document.location.origin+'/formations/'+idFormation+'/elements', {
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
            showNotification("fail", "Erreur: la formation n'a pas pu être chargée");
        }
    });
}

function getUpdateElement(idElement){
    let idFormation = document.getElementById("formation-id").value;
    fetch(document.location.origin+'/formations/'+idFormation+'/elements/' + idElement + "/get", {
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
        method: 'get'
    }).then(response => {
        if (response.ok) {
            response.json().then(function(data) {
                if(data.type === "hebdomadaire") {
                    let tBody = document.getElementById("tbody-element-" + data.element._id);
                    updateWeeklyTbody(tBody, data.element, data.week)
                } else if(data.type === "global") {
                    createTableGlobals(data, data.period);
                }
            });
        } else {
            showNotification("fail", "Erreur: l'élément' n'a pas pu être chargé");
        }
    });
}

function listGlobalsElements(idPeriod){
    let idFormation = document.getElementById("formation-id").value;
    fetch(document.location.origin+'/formations/'+idFormation+'/periodes/'+ idPeriod +'/saisies-globales', {
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
        method: 'get'
    }).then(response => {
        if (response.ok) {
            response.json().then(function(data) {
                createTableGlobals(data, data.period);
            });
        } else {
            showNotification("fail", "Erreur: la formation n'a pas pu être chargée");
        }
    });
}

function removeUsedSpeaker(element, idSpeaker){
    fetch(document.location.origin+'/elements/'+ element._id +'/retirer-intervenant', {
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify ({
            speaker: idSpeaker
        }),
        method: 'post'
    }).then(response => {
        if (response.ok) {
            getUsedSpeakers(element);
            getUpdateElement(element._id);
            showNotification("success", "Intervenant retiré");
        } else {
            showNotification("fail", "Erreur: l'intervenant n'as pas été retiré");
        }
    });
}

function addUsedSpeaker(element, idSpeaker){
    fetch(document.location.origin+'/elements/'+ element._id +'/ajouter-intervenant', {
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify ({
            speaker: idSpeaker
        }),
        method: 'post'
    }).then(response => {
        if (response.ok) {
            getUnsuedSpeakers(element);
            getUpdateElement(element._id);
            showNotification("success", "Intervenant ajouté");
        } else {
            showNotification("fail", "Erreur: l'intervenant n'as pas été ajouté");
        }
    });
}

function getUnsuedSpeakers(element){
    fetch(document.location.origin+'/elements/'+ element._id +'/interventions', {
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
        method: 'get'
    }).then(response => {
        if (response.ok) {
            response.json().then(function(data) {
                populateModal(data.unused_speakers, element, addUsedSpeaker, {indicator: "Ajouter", button:"plus", title: "Liste des intervenants du projet"});
            });
        } else {
            showNotification("fail", "Erreur de chargement des interventions");
        }
    });
}

function getUsedSpeakers(element){
    fetch(document.location.origin+'/elements/'+ element._id +'/interventions', {
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
        method: 'get'
    }).then(response => {
        if (response.ok) {
            response.json().then(function(data) {
                let elementTitle = element.title || element.buildingElement.title;
                populateModal(data.used_speakers, element, removeUsedSpeaker, {indicator: "Retirer", button:"minus", title: "Liste des intervenants de la matière " + elementTitle});
            });
        } else {
            showNotification("fail", "Erreur de chargement des interventions");
        }
    });
}

function editWeeklyElement(idElement, data){
    fetch(document.location.origin+'/elements/hebdomadaire/'+ idElement +'/modifier', {
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify (data),
        method: 'put'
    }).then(response => {
        if (response.ok) {
            getUpdateElement(idElement);
            showNotification("success", "Element modifié");
        } else {
            showNotification("fail", "Erreur ");
        }
    });
}

function editGlobalElementByPeriod(idPeriod, data){
    fetch(document.location.origin+'/periodes/'+ idPeriod +'/elements/global/modifier', {
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify (data),
        method: 'put'
    }).then(response => {
        if (response.ok) {
            listGlobalsElements(idPeriod);
            showNotification("success", "Elements globals modifiés");
        } else {
            showNotification("fail", "Erreur ");
        }
    });
}

function populateModal(data, element, callback, options){
    let tbody = document.getElementById("tbody-unused");
    tbody.innerHTML = "";
    document.getElementById("list-modal-title").innerHTML = options.title;
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
        tdLastName.innerHTML = data[i].teacher.last_name;
        tdFirstName.innerHTML = data[i].teacher.first_name;
        tdNickname.innerHTML = data[i].teacher.nickname;
        tdMandatoryHour.innerHTML = data[i].min_mandatory_hour + " - " + data[i].max_mandatory_hour;
        tdAdditionalHour.innerHTML = data[i].min_additional_hour + " - " + data[i].max_additional_hour;
        tdStatus.innerHTML = data[i].teacher.status.name;
        let buttonAdd = document.createElement("button");
        buttonAdd.classList.add("button-link");
        buttonAdd.title = options.indicator;
        buttonAdd.innerHTML = "<i class='fas fa-" + options.button + "'></i>";
        buttonAdd.addEventListener("click", function() {
            callback(element, data[i]._id);
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
    openListTeachersModal(); 
    
}


function populateTables(data){
    populateTableRoot(data.root);
    data.tree.sort(compare);
    for(let i=0; i<data.tree.length; i++){
        createTablePeriod(data.tree[i]);
    }

}

function populateTableRoot(root){
    let div = document.getElementById("root-table");
    div.innerHTML = root.buildingElement.title;
    createEventListener(div, root);
}

function createTablePeriod(periodTree){
    let tableContent = document.getElementsByClassName("tables-content")[0];
    let table = document.createElement("table");
    table.setAttribute("class", "table is-bordered");
    let tBody = document.createElement("tbody");
    let tr = document.createElement("tr");
    tr.setAttribute("data-id", periodTree._id);
    let tdPeriod = document.createElement("td");
    tdPeriod.innerHTML = periodTree.title || periodTree.buildingElement.title;
    tdPeriod.colSpan = periodTree.week + 3;
    tdPeriod.setAttribute("class","td-period pointer");
    createButtonReduce(tdPeriod, periodTree._id);
    createEventListener(tdPeriod, periodTree);
    tr.appendChild(tdPeriod);
    tBody.appendChild(tr);
    let trWeek = document.createElement("tr");
    let tdWeekBlank = document.createElement("td");
    tdWeekBlank.colSpan = 2;
    trWeek.appendChild(tdWeekBlank);
    trWeek.setAttribute("data-id-parent", periodTree._id);
    for(let i=1; i <= periodTree.week; i++){
        let tdWeek = document.createElement("td");
        tdWeek.innerHTML = i;
        tdWeek.title = "Semaine " + i;
        trWeek.appendChild(tdWeek);
    }
    let tdWeekTotal = document.createElement("td");
    tdWeekTotal.innerHTML = "total";
    trWeek.appendChild(tdWeekTotal);
    tBody.appendChild(trWeek);
    table.appendChild(tBody);
    periodTree.children.sort(compare);
    for(let i=0; i<periodTree.children.length; i++){
        addElementToTable(table, periodTree.children[i], periodTree.week);
    }
    tableContent.appendChild(table);
    let div = document.createElement("div");
    div.id = "globals-period-" + periodTree._id;
    tableContent.appendChild(div);
    listGlobalsElements(periodTree._id);

}

function createTableGlobals(data, period){
    let listGlobals = data.globals;
    let div = document.getElementById("globals-period-" + period._id);
    div.innerHTML = "";
    if(listGlobals.length === 0){
        return;
    }
    let table = document.createElement("table");
    table.setAttribute("class", "table is-bordered");
    let tBody = document.createElement("tbody");
    tBody.setAttribute("data-id-parent", period._id);
    let tr = document.createElement("tr");
    tr.setAttribute("data-id-parent", period._id);
    tr.setAttribute("data-id", "globals-" + period._id);
    let td = document.createElement("td");
    td.innerHTML = "<b>Saisies globales</b>";
    td.colSpan = listGlobals.length + 3;
    createSaveButton(td, period, formateGlobalForm);
    tr.appendChild(td);
    createButtonReduce(td, "globals-" + period._id);
    tBody.appendChild(tr);
    table.appendChild(tBody);
    let tBodyGlobals = document.createElement("tbody");
    tBodyGlobals.setAttribute("data-id-parent", "globals-" + period._id);
    table.appendChild(tBodyGlobals);
    updateGlobals(tBodyGlobals, data, period)
    div.appendChild(table);
}

function updateGlobals(tBody, data, period){
    let listGlobals = data.globals;
    tBody.innerHTML = "";
    let trNames = document.createElement("tr");
    trNames.setAttribute("data-id-parent", "globals-" + period._id);
    let tdEmpty = document.createElement("td");
    tdEmpty.colSpan = 2;
    trNames.appendChild(tdEmpty);
    for(let i = 0; i<listGlobals.length; i++){
        let tdGlobal = document.createElement("td");
        tdGlobal.innerHTML = listGlobals[i].title || listGlobals[i].buildingElement.title;
        tdGlobal.setAttribute("class","pointer has-text-weight-bold");
        createAddSpeakerButton(tdGlobal, listGlobals[i]);
        createRemoveSpeakerButton(tdGlobal, listGlobals[i]);
        createEventListener(tdGlobal, listGlobals[i]);
        trNames.appendChild(tdGlobal);
    }
    let tdTotal = document.createElement("td");
    tdTotal.innerHTML = "total HeTD";
    trNames.appendChild(tdTotal);
    tBody.appendChild(trNames);
    addTeachersGlobalInput(tBody, data, period);
}

function addTeachersGlobalInput(tBody, data, period){
    let listGlobal = data.globals;
    let formatedGlobals = data.formatedGlobals;
    for(let i=0; i<formatedGlobals.length; i++){
        let speaker = formatedGlobals[i].speaker;
        let tr = document.createElement("tr");
        tr.classList.add("tr-border-top");
        let tdName = document.createElement("td");
        tdName.rowSpan = 4;
        tdName.setAttribute("class", "td-border-bottom");
        tdName.innerHTML = speaker.teacher.first_name + " " + speaker.teacher.last_name;
        tr.appendChild(tdName);
        let count = 0;
        for(key in formatedGlobals[i].subjects) {
            let subject = formatedGlobals[i].subjects[key];
            let tdCourse = document.createElement("td");
            tdCourse.innerHTML = key;
            if(count !== 0){
                tr = document.createElement("tr");
            }
            tr.appendChild(tdCourse);
            for(let j=0; j<listGlobal.length; j++){
                let ref = listGlobal[j]._id;
                let globalTitle = listGlobal[j].title || listGlobal[j].buildingElement.title;
                let tdIntervention = document.createElement("td");
                let intervention = subject[ref];
                if(typeof intervention !== "undefined" && intervention !== null){
                    tdIntervention.contentEditable = true;
                    tdIntervention.defaultValue = intervention;
                    manageModification(tdIntervention);
                    tdIntervention.id = period._id + "-" + ref + "-" + speaker._id + "-" + key;
                    tdIntervention.innerHTML = intervention;
                    tdIntervention.title = globalTitle + " - " + key + ": " + listGlobal[j].forfait[key] + " forfait(s) × " + intervention + " intervention(s)";
                } else if(intervention === null) {
                    tdIntervention.id = period._id + "-" + ref + "-" + speaker._id + "-" + key;
                    tdIntervention.contentEditable = true;
                    manageModification(tdIntervention);
                    tdIntervention.innerHTML = "<br>";
                }else if(typeof intervention === "undefined"){
                    tdIntervention.classList.add("td-unable");
                    tdIntervention.title = "Type de cours non autorisé";
                }               
                tr.appendChild(tdIntervention);            
            }
            let tdTotalHeTD = document.createElement("td");
            tdTotalHeTD.innerHTML = formatedGlobals[i].totals[key];
            tr.setAttribute("data-id-parent", "globals-" + period._id);
            tr.appendChild(tdTotalHeTD);
            tBody.appendChild(tr);
            count++;
        }
        tr.classList.add("tr-border-bottom");
    }
}

function addElementToTable(table, element, week){
    if(element.input_type === "aucun"){
        let tBody = document.createElement("tbody");
        tBody.setAttribute("data-id-parent", element.parent);
        tBody.id = "tbody-element-" + element._id;
        table.appendChild(tBody);
        let tr = document.createElement("tr");
        tr.setAttribute("data-id", element._id);
        tr.setAttribute("data-id-parent", element.parent);
        let tdElement = document.createElement("td");
        tdElement.innerHTML = element.title || element.buildingElement.title;
        tdElement.colSpan = week + 3;
        tdElement.setAttribute("class","pointer");
        createButtonReduce(tdElement, element._id);
        createEventListener(tdElement, element);
        tr.appendChild(tdElement);
        tBody.appendChild(tr);
        element.children.sort(compare);
        for(let i=0; i<element.children.length; i++){
            addElementToTable(table, element.children[i], week);
        }
    } else if(element.input_type === "hebdomadaire") {
        let tBody = document.createElement("tbody");
        tBody.setAttribute("data-id-parent", element.parent);
        tBody.id = "tbody-element-" + element._id;
        table.appendChild(tBody);
        updateWeeklyTbody(tBody, element, week);
    }
}

function updateWeeklyTbody(tBody, element, week){
    tBody.innerHTML = "";
    let tr = document.createElement("tr");
    tr.setAttribute("class", "tr-border-top");
    let tdName = document.createElement("td");
    tdName. innerHTML = element.title || element.buildingElement.title;
    tdName.setAttribute("class","pointer has-text-weight-bold td-border-bottom");
    createAddSpeakerButton(tdName, element);
    createButtonReduce(tdName, element._id);
    createEventListener(tdName, element);
    createRemoveSpeakerButton(tdName, element);
    createSaveButton(tdName, element, formateWeeklyForm);
    tr.appendChild(tdName);
    tBody.appendChild(tr);
    let count = 0;
    for(key in element.courses_types) {
        if(element.courses_types[key]) {
            let tdNameCourse = document.createElement("td");
            tdNameCourse.innerHTML = key;
            if(count === 0) {
                tr.appendChild(tdNameCourse);
            } else {
                tr = document.createElement("tr");
                tr.appendChild(tdNameCourse);
                tBody.appendChild(tr);
            }
            for(let i=1; i<=week; i++){
                let tdNumber =  document.createElement("td");
                tdNumber.contentEditable = true;
                manageModification(tdNumber);
                tdNumber.innerHTML = "<br>";
                tdNumber.id = element._id + "-volumes-" + i + "-" + key;
                let volume = element.volumes.find(v => v.week === i);
                if(typeof volume !== "undefined" && volume.hour[key] !== null){
                    tdNumber.innerHTML = volume.hour[key];
                    tdNumber.defaultValue = volume.hour[key];
                }
                tr.appendChild(tdNumber);
            }
            let tdTotal =  document.createElement("td");
            tdTotal.innerHTML = element.totals[key];
            tr.appendChild(tdTotal);
            tr.setAttribute("data-id", element._id);
            tr.setAttribute("data-id-parent", element.parent);
            count++;
        }
    }
    tdName.rowSpan = count;
    tr.classList.add("tr-border-bottom");
    addTeachersWeeklyInput(tBody, element, week);
    
}

function addTeachersWeeklyInput(tBody, element, week){
    let totalsBySpeaker = element.totalsBySpeaker;
    let courses_types = element.courses_types;
    let volumes = element.volumes;
    let groups = element.groups_teachers;
    for(let i=0; i<totalsBySpeaker.length; i++){
        let speaker = totalsBySpeaker[i].speaker;
        let totals = totalsBySpeaker[i].totals;
        let tr = document.createElement("tr");
        tr.classList.add("tr-border-top");
        let tdName = document.createElement("td");
        tdName.setAttribute("class", "td-border-bottom");
        tdName.innerHTML = speaker.teacher.first_name + " " + speaker.teacher.last_name;
        tr.appendChild(tdName);
        let count = 0;
        let courseTitle = element.title || element.buildingElement.title;
        for(key in courses_types) {
            if(courses_types[key]) {
                let tdCourse = document.createElement("td");
                tdCourse.innerHTML = key;
                if(count !== 0){
                    tr = document.createElement("tr");
                }
                tr.appendChild(tdCourse);
                for(let j=1; j<=week; j++){
                    let tdNumber = document.createElement("td");
                    tdNumber.id = element._id + "-speakers-" + speaker._id  + "-" + j + "-" + key;
                    tdNumber.contentEditable = true;
                    manageModification(tdNumber);
                    tdNumber.innerHTML = "<br>";
                    let group = groups.find(g => (g.week === j && g.speaker.toString() === speaker._id.toString()));
                    let volume = volumes.find(v => v.week === j);
                    if(typeof group !== "undefined" && group.group_number[key] !== null){
                        tdNumber.innerHTML = group.group_number[key];
                        tdNumber.defaultValue = group.group_number[key];
                        tdNumber.title = courseTitle + " - semaine " + j + " - " + key + ": " + group.group_number[key] + " groupe(s)";
                        if(typeof volume !== "undefined" && volume.hour[key] !== null){
                            tdNumber.title += " × " + volume.hour[key] + " heure(s)";
                        }
                    }
                    tr.appendChild(tdNumber);
                }
                let tdTotal =  document.createElement("td");
                tdTotal.innerHTML = totals[key];
                tdTotal.title = speaker.teacher.first_name + " " + speaker.teacher.last_name + " - " + courseTitle + " - " + key + ": total = " + totals[key];
                tr.appendChild(tdTotal);
                count++;
                tr.setAttribute("data-id-parent", element._id);
                tBody.appendChild(tr);
            }
        }
        tdName.rowSpan = count;
        tr.classList.add("tr-border-bottom");
    }
}

function createEventListener(td, element){
    td.addEventListener("click",function() {
        openModal(element);
    });

}

function manageShow(btn, id){
    if(btn.show){
        btn.innerHTML = '<i class="fas fa-minus"></i>';
        btn.title = "Etendre";
        btn.show = false;
        reduce(id);
    }else{
        btn.innerHTML = '<i class="fas fa-angle-down"></i>';
        btn.title = "Réduire";
        btn.show = true;
        expand(id);
    }
}

function reduce(id, reducer = id){
    let trs = document.querySelectorAll("[data-id-parent='"+ id +"']");
    for(let i=0; i<trs.length; i++){
        if(!trs[i].hasAttribute("data-id-reducer")){
            trs[i].style.display = "none";
            trs[i].setAttribute("data-id-reducer", reducer);
            if(trs[i].hasAttribute("data-id")){
                reduce(trs[i].getAttribute("data-id"), id);
            }
        }
    }
}

function createAddSpeakerButton(td, element){
    let button = document.createElement("button");
    button.setAttribute("class", "button-link");
    button.innerHTML = "<i class='fas fa-user-plus'></i>";
    button.title = "Ajouter intervenants";
    button.addEventListener("click", function(ev){
        getUnsuedSpeakers(element);
        ev.stopPropagation();
    });
    td.appendChild(button);
}

function createRemoveSpeakerButton(td, element){
    let button = document.createElement("button");
    button.setAttribute("class", "button-link");
    button.innerHTML = "<i class='fas fa-user-minus'></i>";
    button.title = "Retirer intervenants";
    button.addEventListener("click", function(ev){
        getUsedSpeakers(element);
        ev.stopPropagation();
    });
    td.appendChild(button);
}

function createSaveButton(td, element, callback){
    let button = document.createElement("button");
    button.setAttribute("class", "button-link");
    button.innerHTML = "<i class='fas fa-save'></i>";
    button.title = "Sauvegarder les modifications";
    button.addEventListener("click", function(ev){
        callback(element);
        ev.stopPropagation();
    });
    td.appendChild(button);
}

function formateWeeklyForm(element){
    let volumes = document.querySelectorAll("td[id^='"+ element._id +"-volumes'][contenteditable='true']");
    let speakers = document.querySelectorAll("td[id^='"+ element._id +"-speakers'][contenteditable='true']");
    let data = {};
    data.volumes = [];
    data.speakers = [];
    for(let volume of volumes){
        let arrayId = volume.id.split("-");
        let weekVolume = data.volumes.find(v => v.week.toString() === arrayId[2]);
        if(typeof weekVolume === "undefined") {
            weekVolume = {week: arrayId[2], courses_types: {}};
            data.volumes.push(weekVolume);
        }
        weekVolume.courses_types[arrayId[3]] = volume.textContent;
    }
    for(let speaker of speakers) {
        let arrayId = speaker.id.split("-");
        let weekSpeaker = data.speakers.find(s => s.id.toString() === arrayId[2]);
        if(typeof weekSpeaker === "undefined") {
            weekSpeaker = {id: arrayId[2], groups: [{week: arrayId[3],  courses_types: {}}] };
            data.speakers.push(weekSpeaker);
        }
        let groupsSpeaker = weekSpeaker.groups.find(g => g.week.toString() === arrayId[3]);
        if(typeof groupsSpeaker === "undefined") {
            groupsSpeaker = {week: arrayId[3],  courses_types: {}};
            weekSpeaker.groups.push(groupsSpeaker);
        }
        groupsSpeaker.courses_types[arrayId[4]] = speaker.textContent;
    }
    editWeeklyElement(element._id, data);
}

function formateGlobalForm(period) {
    let interventions = document.querySelectorAll("[id^='"+ period._id +"']");
    let data = [];
    for(let intervention of interventions) {
        let arrayId = intervention.id.split("-");
        let dataSubject = data.find(d => d.id === arrayId[1]);
        if(typeof dataSubject === "undefined") {
            dataSubject = {id: arrayId[1], speakers: []};
            data.push(dataSubject);
        }
        let dataSpeaker = dataSubject.speakers.find(s => s.id === arrayId[2]);
        if(typeof dataSpeaker === "undefined") {
            dataSpeaker = {id: arrayId[2], courses_types:{}};
            dataSubject.speakers.push(dataSpeaker);
        }
        dataSpeaker.courses_types[arrayId[3]] = intervention.textContent;
    }
    editGlobalElementByPeriod(period._id, data);
}

function manageModification(tdEditable){
    tdEditable.addEventListener("blur", function(){
        let defaultValue = tdEditable.defaultValue || "<br>";
        if( (!isNaN(tdEditable.textContent)) && (parseInt(tdEditable.textContent) >= 0 || tdEditable.textContent === "")){
            tdEditable.newValue = tdEditable.textContent;
        }else {
            tdEditable.innerHTML =  tdEditable.newValue || defaultValue;
        }
        if(tdEditable.innerHTML.toString().replace(/<\/?[^>]+(>|$)/g, "") === defaultValue.toString().replace(/<\/?[^>]+(>|$)/g, "")){
            tdEditable.classList.remove("modification");
        } else {
            tdEditable.classList.add("modification");
        }
    })
}

function expand(id, opener = id){
    let trs = document.querySelectorAll("[data-id-parent='"+ id +"']");
    for(let i=0; i<trs.length; i++){
        if(trs[i].getAttribute("data-id-reducer") === opener){
            trs[i].style.display = "";
            trs[i].removeAttribute("data-id-reducer");
            if(trs[i].hasAttribute("data-id")){
                expand(trs[i].getAttribute("data-id"), id);
            }
        }
    }
}

function createButtonReduce(td, id){
    let btnContainer = document.createElement("div");
    btnContainer.setAttribute("class", "table-btn");
    let btnReduce = document.createElement("button");
    btnReduce.setAttribute("class", "button-link");
    btnReduce.title = "Réduire";
    btnReduce.innerHTML = '<i class="fas fa-angle-down"></i>';
    btnReduce.show = true;
    btnReduce.addEventListener("click", function(ev) {
        manageShow(btnReduce, id);
        ev.stopPropagation();
    })
    btnContainer.appendChild(btnReduce);
    td.appendChild(btnContainer);
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

function openModal(element){
    let idFormation = document.getElementById("formation-id").value;
    let modal = document.getElementById("element-modal");
    let content = modal.getElementsByClassName("content")[0];
    let text = {
        title: element.title || element.buildingElement.title,
        nickname: element.nickname || element.buildingElement.nickname,
        reference: element.reference || element.buildingElement.reference,
        order: element.order,
    }
    content.innerHTML = "<p>Titre: "+ text.title +"</p><p>Surnom: "+ text.nickname +"</p><p>Reference: "+ text.reference +"</p><p>Ordre: "+ text.order + "</p>";
    if (element.__t === "PedagogicalPeriod") {
        text.week = element.week;
        content.innerHTML += "<p>Nombre de semaines: " + text.week + "</p>";
        content.innerHTML += "<label>Nombre de groupes : <label>";
        content.innerHTML += "<div class='control'><div class='tags has-addons'><span class='tag is-dark'>TP</span><span class='tag is-primary'> "+ element.number_groups.TP +"</span></div></div>";
        content.innerHTML += "<div class='control'><div class='tags has-addons'><span class='tag is-dark'>TD</span><span class='tag is-primary'> "+ element.number_groups.TD +"</span></div></div>";
        content.innerHTML += "<div class='control'><div class='tags has-addons'><span class='tag is-dark'>CM</span><span class='tag is-primary'> "+ element.number_groups.CM +"</span></div></div>";
        content.innerHTML += "<div class='control'><div class='tags has-addons'><span class='tag is-dark'>PARTIEL</span><span class='tag is-primary'> "+ element.number_groups.PARTIEL +"</span></div></div>";
    }
   /* if(typeof element.buildingElement.hour_volume !== "undefined") {
        if(element.buildingElement.hour_volume.TP !== null || element.buildingElement.hour_volume.TD !== null || element.buildingElement.hour_volume.CM !== null) {
            content.innerHTML += "<label>Volume d'heures prévu : <label>";
        }
        if(element.buildingElement.hour_volume.TP !== null) {
            content.innerHTML += "<div class='control'><div class='tags has-addons'><span class='tag is-dark'>TP</span><span class='tag is-primary'> "+ element.buildingElement.hour_volume.TP +"</span></div></div>";
        }
        if(element.buildingElement.hour_volume.TD !== null) {
            content.innerHTML += "<div class='control'><div class='tags has-addons'><span class='tag is-dark'>TD</span><span class='tag is-primary'> "+ element.buildingElement.hour_volume.TD +"</span></div></div>";
        }
        if(element.buildingElement.hour_volume.CM !== null){
            content.innerHTML += "<div class='control'><div class='tags has-addons'><span class='tag is-dark'>CM</span><span class='tag is-primary'> "+ element.buildingElement.hour_volume.CM +"</span></div></div>";
        }
    }*/
    let linkContainer = modal.getElementsByClassName("link-container")[0];
    linkContainer.innerHTML = "<a class='button is-primary' href='/formation/"+ idFormation +"/element/"+ element._id +"/modifier'>Modifier</a>";
    if(typeof element.parent === "undefined") {
        linkContainer.innerHTML += "<a class='button is-primary' href='/formation/"+ idFormation +"/element/ajouter/parent/"+ element._id +"'>Ajouter une période</a>";
    } else if(element.input_type === "aucun") {
        linkContainer.innerHTML += "<a class='button is-primary' href='/formation/"+ idFormation +"/element/ajouter/parent/"+ element._id +"'>Ajouter un enfant</a>";
    }
    modal.classList.add("is-active");
}

document.addEventListener("DOMContentLoaded", function(){
    listElements();
});
