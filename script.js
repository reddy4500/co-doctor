// --- Dummy Data ---
const colleges = {
    "Engineering College": ["Batch A", "Batch B"],
    "Medical College": ["Batch X", "Batch Y"],
    "Business College": ["Batch 1", "Batch 2"]
};
const doctors = {
    "Batch A": ["Dr. Smith", "Dr. Johnson"],
    "Batch B": ["Dr. Adams", "Dr. Clark"],
    "Batch X": ["Dr. Emily", "Dr. David"],
    "Batch Y": ["Dr. Steve", "Dr. Laura"],
    "Batch 1": ["Dr. Mia", "Dr. Noah"],
    "Batch 2": ["Dr. Liam", "Dr. Olivia"]
};
// --- Login ---
function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    if (username === "admin" && password === "password") {
        localStorage.setItem('loggedIn', 'true');
        window.location.href = 'form.html';
    } else {
        document.getElementById('login-error').innerText = "Invalid username or password!";
    }
}
// --- Load Colleges on Form Page ---
if (document.getElementById('college')) {
    window.onload = function() {
        const collegeSelect = document.getElementById('college');
        for (const collegeName in colleges) {
            const option = document.createElement('option');
            option.value = collegeName;
            option.text = collegeName;
            collegeSelect.add(option);
        }
    }
}
// --- Load Batches based on College ---
function loadBatches() {
    const college = document.getElementById('college').value;
    const batchSelect = document.getElementById('batch');
    batchSelect.innerHTML = '<option value="">Select Batch</option>';
    if (college && colleges[college]) {
        colleges[college].forEach(batch => {
            const option = document.createElement('option');
            option.value = batch;
            option.text = batch;
            batchSelect.add(option);
        });
    }
}
// --- Submit Form and Save Data ---
function submitForm() {
    const college = document.getElementById('college').value;
    const batch = document.getElementById('batch').value;
    const name = document.getElementById('name').value.trim();
    if (!college || !batch || !name) {
        alert("Please fill all fields!");
        return;
    }
    localStorage.setItem('college', college);
    localStorage.setItem('batch', batch);
    localStorage.setItem('name', name);
    window.location.href = 'dashboard.html';
}
// --- Show Dashboard Info ---
if (document.getElementById('user-name')) {
    window.onload = function() {
        const name = localStorage.getItem('name');
        const batch = localStorage.getItem('batch');
        if (!name || !batch) {
            window.location.href = 'login.html';
            return;
        }
        document.getElementById('user-name').innerText = name;
        document.getElementById('selected-batch').innerText = batch;
        const doctorList = document.getElementById('doctor-list');
        const availableDoctors = doctors[batch] || [];
        availableDoctors.forEach(doc => {
            const li = document.createElement('li');
            li.innerText = doc;
            doctorList.appendChild(li);
        });
    }
}