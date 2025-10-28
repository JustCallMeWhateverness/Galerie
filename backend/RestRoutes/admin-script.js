fix();

function $(x) { return document.querySelector(x); }

async function fix() {
  const fixPage = ['New Rest Permissions', 'Edit Rest Permissions'].includes($('h1')?.textContent);
  if (!fixPage) { return; }
  const roles = await (await fetch('/api/system/roles')).json();
  const types = await (await fetch('/api/system/content-types')).json();
  let inputRoles = $('#RestPermissions_Roles_Text');
  let inputTypes = $('#RestPermissions_ContentTypes_Text');
  [inputRoles, inputTypes].forEach(x => x.style.display = 'none');
  inputRoles.after(makeCheckboxDiv('role-cbox', roles, inputRoles.value.split(',')));
  inputTypes.after(makeCheckboxDiv('type-cbox', types, inputTypes.value.split(',')));
  addEventListeners();
}

function makeCheckboxDiv(cssClass, arr, checked) {
  let html = '';
  for (let item of arr) {
    html += `<label style="display:inline-block;min-width:200px;padding-right:30px">
      <input class=${cssClass} value=${item} type="checkbox" ${checked.includes(item) ? 'checked' : ''}>&nbsp;${item}
      </label>`;
  }
  let d = document.createElement('div');
  d.innerHTML = html;
  return d;
}

function addEventListeners() {
  document.body.addEventListener('change', e => {
    e.target.closest('.role-cbox')
      && updateTextField($('#RestPermissions_Roles_Text'), '.role-cbox');
    e.target.closest('.type-cbox')
      && updateTextField($('#RestPermissions_ContentTypes_Text'), '.type-cbox');
  });
}

function updateTextField(input, cboxClass) {
  let values = [...document.querySelectorAll(cboxClass)].filter(x => x.checked).map(x => x.value).sort();
  input.value = values.join(',');
}