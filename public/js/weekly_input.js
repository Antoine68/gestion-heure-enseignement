(function() {
    var week = null;
    var courses_types = {TP:true, TD:true, CM:true, PARTIEL: true};

    function inizialize(){
        let idElement = document.getElementById("element").value;
        fetch(document.location.origin+'/elements/'+ idElement +'/initialiser', {
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            method: 'get'
        }).then(response => {
            if (response.ok) {
                response.json().then(function(data) {
                    week = data.week;
                    courses_types = data.courses_types;
                    editHeadInterventions(week);
                    getVolumes();
                    getInterventions();
                });
            } else {
                showNotification("fail", "Erreur");
            }
        });
    }

    function getVolumes(){
        let idElement = document.getElementById("element").value;
        fetch(document.location.origin+'/elements/'+ idElement +'/volumes', {
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            method: 'get'
        }).then(response => {
            if (response.ok) {
                response.json().then(function(data) {
                    createGroupScheduleTable(data.volumes);
                });
            } else {
                showNotification("fail", "Erreur de chargement des volumes d'heures");
            }
        });
    }

    function editVolumes(data){
        let idElement = document.getElementById("element").value;
        fetch(document.location.origin+'/elements/'+ idElement +'/modifier-volumes-hebdomadaires', {
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify (data),
            method: 'put'
        }).then(response => {
            if (response.ok) {
                showNotification("success", "Volumes d'heures modifiés");
            } else {
                showNotification("fail", "Erreur ");
            }
        });
    }

    function editGroupsTeacher(idSpeaker, data){
        let idElement = document.getElementById("element").value;
        fetch(document.location.origin+'/elements/'+ idElement +'/modifier-groupes-enseignants', {
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify ({
                speaker: idSpeaker,
                groups: data
            }),
            method: 'put'
        }).then(response => {
            if (response.ok) {
                showNotification("success", "Nombres de groupes modifiés");
            } else {
                showNotification("fail", "Erreur ");
            }
        });
    }

    function addUsedSpeaker(idSpeaker){
        let idElement = document.getElementById("element").value;
        fetch(document.location.origin+'/elements/'+ idElement +'/ajouter-intervenant', {
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
                getInterventions();
                showNotification("success", "Intervenant ajouté");
            } else {
                showNotification("fail", "Erreur: l'intervenant n'as pas été ajouté");
            }
        });
    }

    function removeUsedSpeaker(idSpeaker){
        let idElement = document.getElementById("element").value;
        fetch(document.location.origin+'/elements/'+ idElement +'/retirer-intervenant', {
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
                getInterventions();
                showNotification("success", "Intervenant retiré");
            } else {
                showNotification("fail", "Erreur: l'intervenant n'as pas été retiré");
            }
        });
    }

    function getInterventions(){
        let idElement = document.getElementById("element").value;
        fetch(document.location.origin+'/elements/'+ idElement +'/interventions', {
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            method: 'get'
        }).then(response => {
            if (response.ok) {
                response.json().then(function(data) {
                    populateUnusedTable(data.unused_speakers);
                    populateUsedTable(data.used_speakers, data.groups_teachers);
                });
            } else {
                showNotification("fail", "Erreur de chargement des interventions");
            }
        });
    }

    function createGroupScheduleTable(volumes){
        let table = document.getElementById("table-group-schedule");
        table.innerHTML = "";
        let trWeek = document.createElement("tr");
        let tdEmpty = document.createElement("td");
        trWeek.appendChild(tdEmpty);
        for(let i=1; i<=week; i++){
            let tdNumberWeek = document.createElement("td");
            tdNumberWeek.innerHTML = "Semaine " + i;
            trWeek.appendChild(tdNumberWeek);
        }
        table.appendChild(trWeek);
        for(key in courses_types) {
            if(courses_types[key]) {
                let tr = document.createElement("tr");
                let tdNameCourse = document.createElement("td");
                tdNameCourse.innerHTML = key;
                tr.appendChild(tdNameCourse);
                for(let i=1; i<=week; i++){
                    let tdNumber =  document.createElement("td");
                    let volume = volumes.find(v => v.week === i);
                    let input = document.createElement("input");
                    input.setAttribute("class", "input");
                    input.name = "volumes["+i+"]["+ key +"]";
                    if(typeof volume !== "undefined" && typeof volume.hour[key] !== "undefined"){
                        input.value = volume.hour[key];
                    }
                    tdNumber.appendChild(input);
                    tr.appendChild(tdNumber);
                }
                table.appendChild(tr);
            }
        }
        
    }

    function populateUsedTable(speakers, groups){
        let tbody = document.getElementById("tbody-intervention");
        tbody.innerHTML = "";
        let tdAction;
        for(let i=0; i<speakers.length; i++){
            let tr = document.createElement("tr");
            let tdName = document.createElement("td");
            tdName.innerHTML = speakers[i].teacher.first_name + " " + speakers[i].teacher.last_name;
            tdName.setAttribute("data-search", "full_name1");
            tr.appendChild(tdName);
            let count = 0;
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
                        let input = document.createElement("input");
                        input.setAttribute("class", "input");
                        input.name = speakers[i]._id + "-groups["+j+"]["+ key +"]";
                        if(typeof group !== "undefined" && typeof group.group_number[key] !== "undefined"){
                            input.value = group.group_number[key];
                        }
                        tdNumber.appendChild(input);
                        tr.appendChild(tdNumber);
                    }
                    if(count === 0){
                        tdAction = document.createElement("td");
                        let buttonEdit = document.createElement("button");
                        buttonEdit.classList.add("button-link");
                        buttonEdit.title = "Enregistrer les modifications";
                        buttonEdit.innerHTML = "<i class='fas fa-save'></i>";
                        buttonEdit.addEventListener("click", function() {
                           validateGroupChange(speakers[i]._id);
                        });
                        tdAction.appendChild(buttonEdit);
                        let buttonRemove = document.createElement("button");
                        buttonRemove.classList.add("button-link");
                        buttonRemove.title = "Retirer";
                        buttonRemove.innerHTML = "<i class='fas fa-minus'></i>";
                        buttonRemove.addEventListener("click", function() {
                           removeUsedSpeaker(speakers[i]._id);
                        });
                        tdAction.appendChild(buttonRemove);
                        tr.appendChild(tdAction);
                    }
                    count++;
                    tr.setAttribute("data-search-id", speakers[i]._id);
                    tbody.appendChild(tr);
                }
            }
            tdAction.rowSpan = count;
            tdName.rowSpan = count;
        }
    }

    function validateGroupChange(idSpeaker){
        let submitGroup = {};
        for(let i=1; i<=week; i++){
            submitGroup[i] = {};
            for(key in courses_types) {
                if(courses_types[key]) {
                    submitGroup[i][key] = document.getElementsByName(idSpeaker + "-groups["+ i +"]["+ key +"]")[0].value;
                }
            }
        }
        editGroupsTeacher(idSpeaker, submitGroup);
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
            tdLastName.innerHTML = data[i].teacher.last_name;
            tdFirstName.innerHTML = data[i].teacher.first_name;
            tdNickname.innerHTML = data[i].teacher.nickname;
            tdMandatoryHour.innerHTML = data[i].min_mandatory_hour + " - " + data[i].max_mandatory_hour;
            tdAdditionalHour.innerHTML = data[i].min_additional_hour + " - " + data[i].max_additional_hour;
            tdStatus.innerHTML = data[i].teacher.status.name;
            let buttonAdd = document.createElement("button");
            buttonAdd.classList.add("button-link");
            buttonAdd.title = "Ajouter";
            buttonAdd.innerHTML = "<i class='fas fa-plus'></i>";
            buttonAdd.addEventListener("click", function() {
                addUsedSpeaker(data[i]._id);
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

    function validateHourChange(){
        let submitVolume = {};
        for(let i=1; i<=week; i++){
            submitVolume[i] = {};
            for(key in courses_types) {
                if(courses_types[key]) {
                    submitVolume[i][key] = document.getElementsByName("volumes["+ i +"]["+ key +"]")[0].value;
                }
            }
        }
        editVolumes(submitVolume);
    }

    function editHeadInterventions(week){
        let head = document.getElementById("thead-intervention");
        head.innerHTML = "";
        let tr = document.createElement("tr");
        let tdEmpty = document.createElement("td");
        tdEmpty.colSpan = 2;
        tr.appendChild(tdEmpty);
        for(let i=1; i<=week; i++){
            let td = document.createElement("td");
            td.innerHTML = i;
            tr.appendChild(td);
        }
        let tdAction = document.createElement("td");
        tdAction.innerHTML = "Action";
        tr.appendChild(tdAction);
        head.appendChild(tr);
    }

    document.addEventListener("DOMContentLoaded", function(){
        inizialize();
        document.getElementById("button-group-schedule").addEventListener("click", function(){
            validateHourChange();
        });
        document.getElementById("button-add-speaker").addEventListener("click", function(){
            openListTeachersModal();
        })
    });
})();
