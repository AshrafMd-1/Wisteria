const applyBtn = document.getElementById('apply');
const rollEl = document.getElementById('roll');
const semEl = document.getElementById('sem');
const subEl = document.getElementById('sub');
const submitEl = document.getElementById('submit');
const formEl = document.getElementById('form');

const clearAll = () => {
    semEl.innerHTML = '<option value="0">Not Available</option>';
    subEl.innerHTML = '<option value="0">Not Available</option>';
};

const showAlert = (message) => {
        swal({
            title: 'Error',
            text: message,
            icon: 'error',
            button: 'Ok',
        });
        clearAll();
    }
;

const fetchOptions = async (url, method, body) => {
    try {
        return await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })
            .then((res) => res.json())
            .catch(() => {
                showAlert('Invalid Roll Number');
            });
    } catch (error) {
        showAlert(error)
    }
};

const updateSemesterOptions = (semData) => {
    semEl.innerHTML = `<option value="0">Select Semester</option>${semData
        .map((sem) => `<option value="${sem}">${sem}</option>`)
        .join('')}`;
};

const updateSubjectOptions = (subData) => {
    let subElString = '';
    for (let i = 0; i < subData.code.length; i++) {
        subElString += `<option value="${subData.code[i]}">${subData.name[i]}</option>`;
    }
    subEl.innerHTML = `<option value="0">Select Subject</option>${subElString}`;
};

applyBtn.addEventListener('click', async () => {
    if (rollEl.value.length === 0) {
        showAlert('Please Enter Roll Number');
        return;
    }

    clearAll();

    applyBtn.innerText = 'Loading...';
    applyBtn.disabled = true;

    const semResponse = await fetchOptions('/semester', 'POST', {roll: rollEl.value});
    if (semResponse) {
        updateSemesterOptions(semResponse);
    }

    applyBtn.innerText = 'Apply';
    applyBtn.disabled = false;
});

semEl.addEventListener('change', async () => {
    const sem = semEl.value;
    const roll = rollEl.value;

    if (roll.length === 0) {
        showAlert('Please Enter Roll Number');
        return;
    }

    const subResponse = await fetchOptions('/subject', 'POST', {roll, sem});
    if (subResponse) {
        updateSubjectOptions(subResponse);
    }
});

formEl.addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = new FormData(formEl);
    let roll = form.get('roll');
    const sem = form.get('sem');
    let sub = form.get('sub');
    const week = form.get('week');

    if (roll.length === 0) {
        showAlert('Please Enter Roll Number');
        return;
    } else if (sem === null) {
        showAlert('Please Apply Roll Number');
        return;
    } else if (sub === null) {
        showAlert('Please Select Subject');
        return;
    } else if (week > 15 || week <= 0) {
        showAlert('Please Enter Week Number Between 1 to 15');
        return;
    }

    roll = roll.toUpperCase();
    sub = sub.toUpperCase();

    submitEl.innerText = 'Loading...';
    submitEl.disabled = true;

    const specificResponse = await fetchOptions('/specific', 'POST', {roll, sem, sub, week});
    if (specificResponse && specificResponse.status === 200) {
        swal({
            title: 'Success',
            text: 'File Found',
            icon: 'success',
            button: 'Open',
        }).then(() => {
            window.open(specificResponse.url, '_blank');
        });
    } else {
        swal({
            title: 'Error',
            text: 'File Not Found',
            icon: 'error',
            button: 'Ok',
        });
    }

    submitEl.innerText = 'Submit';
    submitEl.disabled = false;
});
