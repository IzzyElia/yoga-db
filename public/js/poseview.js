function editItem(table, itemID) {
    const inputValue = document.getElementById(`id-${itemID}`).innerHTML;
    $.ajax ({
        url: `/api/pose/edit/${table}/${itemID}?userid=${userID}`,
        method: 'post',
        contentType: 'application/json',
        data: JSON.stringify({
            content: inputValue
        }),
        success: (response) => {
            
        }
    })
}

function removeItem (table, itemID) {
    $.ajax ({
        url: `/api/pose/${table}/${itemID}?userid=${userID}`,
        method: 'delete',
        success: (response) => {
            location.reload();
        }
    })
}

function addItem(table, section) {
    $.ajax ({
        url: `/api/pose/add/${table}/${section}?userid=${userID}`,
        method: 'post',
        contentType: 'application/json',
        data: JSON.stringify({
            content: ''
        }),
        success: (response) => {
            location.reload();
        }
    })
}

function generateSection (poseObj, section) {
    $(document).ready(()=>{
        let out = `<ul>`;
        let entries = poseObj[section];
        if (entries == null) {entries = [];}
        entries.forEach(entry => {
            out += `
            <li>
                <div class="button-wrapper remove-line-button-wrapper"><button onclick="removeItem('${poseObj.poseName}', '${entry.id}')">-</button></div>
                <div class="text-area-wrapper">
                    <span class="text-area" contenteditable="true" id="id-${entry.id}" onkeyup="editItem('${poseObj.poseName}','${entry.id}')">${entry.content}</span>
                </div>
            </li>
            `
        });
        out += `
        <li>
            <div class="button-wrapper add-line-button-wrapper"><button onclick="addItem('${poseObj.poseName}', '${section}')">+</button></div>
            <span></span>
        </li>
        `
        out += `</ul>`;
        let element = document.getElementById(section);
        element.innerHTML = out;
    })
}