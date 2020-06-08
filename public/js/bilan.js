function getBilan(){
    let idProject = document.getElementById("project-id").value;
    fetch(document.location.origin+'/projets/'+idProject+'/calculer-bilan', {
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
        method: 'get'
    }).then(response => {
        if (response.ok) {
            response.json().then(function(data) {
                console.log(data);
                createTablesBilan(data.bilan);
            });
        } else {
            showNotification("fail", "Erreur: le bilan n'a pas pu être chargée");
        }
    });
}

function createTablesBilan(bilan) {
    let columnNames = {
        TP: "TP",
        TD: "TD",
        CM: "CM",
        PARTIEL: "PARTIEL",
        HSUPP: "H supplémentaire",
        HETD: "HeTD",
    }
    let container = document.getElementById("bilan-container");
    let tableContainer = document.createElement("div");
    tableContainer.setAttribute("class", "table-container");
    for(let i in bilan){
        let speaker = bilan[i].speaker;
        let table = document.createElement("table");
        table.setAttribute("data-sorter", bilan[i].global.display);
        table.setAttribute("data-first-name", speaker.teacher.first_name);
        table.setAttribute("data-last-name", speaker.teacher.last_name);
        table.setAttribute("data-nickname", speaker.teacher.nickname);
        table.setAttribute("data-status", speaker.teacher.status.name);
        table.setAttribute("class", "table is-bordered has-text-centered");
        let tr = document.createElement("tr");
        let tdTeacher = document.createElement("td");
        tdTeacher.innerHTML = "<b>" + speaker.teacher.first_name + " " + speaker.teacher.last_name + "</b> | " 
                + speaker.teacher.status.name + " | H oblig. : " + speaker.min_mandatory_hour + " - " + speaker.max_mandatory_hour 
                + " | H supp. : " + speaker.min_additional_hour + " - " + speaker.max_additional_hour ;
        let count = Object.keys(columnNames).length;
        tdTeacher.colSpan = count + 1;
        tr.appendChild(tdTeacher);
        table.appendChild(tdTeacher);
        let trColumnsNames = document.createElement("tr");
        let tdType = document.createElement("td");
        tdType.innerHTML = "Type";
        trColumnsNames.appendChild(tdType);
        let trGlobalBilan = document.createElement("tr");
        let tdTypeGlobal = document.createElement("td");
        tdTypeGlobal.innerHTML = "<b>Global</b>";
        trGlobalBilan.appendChild(tdTypeGlobal);
        for(let key in columnNames){
            let tdColumn = document.createElement("td");
            tdColumn.innerHTML = columnNames[key];
            let tdGlobal = document.createElement("td");
            tdGlobal.setAttribute("class", "is-" + bilan[i].global.display);
            tdGlobal.innerHTML = bilan[i].global[key];
            trColumnsNames.appendChild(tdColumn);
            trGlobalBilan.appendChild(tdGlobal);
        }
        table.appendChild(trColumnsNames);
        table.appendChild(trGlobalBilan);
        tableContainer.appendChild(table)
        container.appendChild(tableContainer);
        
    }
}

function bilanSorter(sorter){
    let tables = document.getElementsByTagName("table");
    for(let i=0; i<tables.length; i++){
        if(tables[i].hasAttribute("data-sorter") && tables[i].getAttribute("data-sorter") !== sorter && sorter !== "all"){
            tables[i].style.display = "none";
        }else {
            tables[i].style.display = "";
        }
    }

}

function searchBilan(){
    let selectSearch = document.getElementById("select-search");
    let searchField = selectSearch.options[selectSearch.selectedIndex].value;
    let searchValue = document.getElementById("input-search").value;
    searchValue = searchValue.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let tables = document.getElementsByTagName("table");
    for(let i=0; i<tables.length; i++){
        txtValue = tables[i].getAttribute("data-"+ searchField);
        if (txtValue.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").indexOf(searchValue) > -1) {
            tables[i].style.display = "";
        } else {
            tables[i].style.display = "none";     
        }
    }
}

document.addEventListener("DOMContentLoaded", function(){
    getBilan();
});
