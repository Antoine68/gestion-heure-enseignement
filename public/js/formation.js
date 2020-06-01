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
    let tr = document.createElement("tr");
    tr.setAttribute("data-id", periodTree._id);
    let tdPeriod = document.createElement("td");
    tdPeriod.innerHTML = periodTree.title || periodTree.buildingElement.title;
    tdPeriod.colSpan = periodTree.week + 3;
    tdPeriod.setAttribute("class","td-period pointer");
    addButtonReduce(tdPeriod, periodTree._id);
    createEventListener(tdPeriod, periodTree);
    tr.appendChild(tdPeriod);
    table.appendChild(tr);
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
    table.appendChild(trWeek);
    periodTree.children.sort(compare);
    let listGlobals = [];
    for(let i=0; i<periodTree.children.length; i++){
        addElementToTable(table, periodTree.children[i], periodTree.week, listGlobals);
    }
    tableContent.appendChild(table);
    if(listGlobals.length > 0){
        createTableGlobals(listGlobals, periodTree);
    }
}

function createTableGlobals(listGlobals, period){
    let tableContent = document.getElementsByClassName("tables-content")[0];
    let table = document.createElement("table");
    table.setAttribute("class", "table is-bordered");
    let tr = document.createElement("tr");
    tr.setAttribute("data-id-parent", period._id);
    let td = document.createElement("td");
    td.innerHTML = "<b>Saisies globales</b>";
    td.colSpan = listGlobals.length + 3;
    tr.appendChild(td);
    table.appendChild(tr);
    let trNames = document.createElement("tr");
    trNames.setAttribute("data-id-parent", period._id);
    let tdEmpty = document.createElement("td");
    tdEmpty.colSpan = 2;
    trNames.appendChild(tdEmpty);
    for(let i = 0; i<listGlobals.length; i++){
        let tdGlobal = document.createElement("td");
        tdGlobal.innerHTML = listGlobals[i].title || listGlobals[i].buildingElement.title;
        trNames.appendChild(tdGlobal);
    }
    let tdTotal = document.createElement("td");
    tdTotal.innerHTML = "total HeTD";
    trNames.appendChild(tdTotal);
    table.appendChild(trNames);
    tableContent.appendChild(table);
}

function addElementToTable(table, element, week, listGlobals){
    if(element.input_type === "aucun"){
        let tr = document.createElement("tr");
        tr.setAttribute("data-id", element._id);
        tr.setAttribute("data-id-parent", element.parent);
        let tdElement = document.createElement("td");
        tdElement.innerHTML = element.title || element.buildingElement.title;
        tdElement.colSpan = week + 3;
        tdElement.setAttribute("class","pointer");
        addButtonReduce(tdElement, element._id);
        createEventListener(tdElement, element);
        tr.appendChild(tdElement);
        table.appendChild(tr);
        element.children.sort(compare);
        for(let i=0; i<element.children.length; i++){
            addElementToTable(table, element.children[i], week, listGlobals);
        }
    } else if(element.input_type === "hebdomadaire") {
        let tr = document.createElement("tr");
        tr.setAttribute("class", "tr-border-top");
        let tdName = document.createElement("td");
        tdName. innerHTML = element.title || element.buildingElement.title;
        tdName.setAttribute("class","pointer has-text-weight-bold td-border-bottom");
        addButtonReduce(tdName, element._id);
        createEventListener(tdName, element);
        tr.appendChild(tdName);
        table.appendChild(tr);
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
                    table.appendChild(tr);
                }
                for(let i=1; i<=week; i++){
                    let tdNumber =  document.createElement("td");
                    let volume = element.volumes.find(v => v.week === i);
                    if(typeof volume !== "undefined" && typeof volume.hour[key] !== "undefined"){
                        tdNumber.innerHTML = volume.hour[key];
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
        addTeachersWeeklyInput(table, element, week);
    } else if(element.input_type === "global"){
        listGlobals.push(element);
    }
}

function addTeachersWeeklyInput(table, element, week){
    let speakers = element.interventions;
    let courses_types = element.courses_types;
    let volumes = element.volumes;
    let groups = element.groups_teachers;
    for(let i=0; i<speakers.length; i++){
        let tr = document.createElement("tr");
        tr.classList.add("tr-border-top");
        let tdName = document.createElement("td");
        tdName.setAttribute("class", "td-border-bottom");
        tdName.innerHTML = speakers[i].teacher.first_name + " " + speakers[i].teacher.last_name;
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
                    let group = groups.find(g => (g.week === j && g.speaker.toString() === speakers[i]._id.toString()));
                    let volume = volumes.find(v => v.week === j);
                    if(typeof group !== "undefined" && group.group_number[key] !== null){
                        tdNumber.innerHTML = group.group_number[key];
                        tdNumber.title = courseTitle + " - semaine " + j + " - " + key + ": " + group.group_number[key] + " groupe(s)";
                        if(typeof volume !== "undefined" && volume.hour[key] !== null){
                            tdNumber.title += " × " + volume.hour[key] + " heure(s)";
                        }
                    }
                    tr.appendChild(tdNumber);
                }
                let tdTotal =  document.createElement("td");
                tdTotal.innerHTML = speakers[i].totals[key];
                tdTotal.title = speakers[i].teacher.first_name + " " + speakers[i].teacher.last_name + " - " + courseTitle + " - " + key + ": total = " + speakers[i].totals[key];
                tr.appendChild(tdTotal);
                count++;
                tr.setAttribute("data-id-parent", element._id);
                table.appendChild(tr);
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

function addButtonReduce(td, id){
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
    } else {
        linkContainer.innerHTML += "<a class='button is-primary' href='/formations/"+ idFormation +"/elements/"+ element._id +"/modifier-volumes'>Gérer les saisies</a>";
    }
    modal.classList.add("is-active");
}

document.addEventListener("DOMContentLoaded", function(){
    listElements();
});
