document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value; // Get the password input value

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }) // Include password in the request body
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        document.location.replace('/home');
    } else {
        alert('Login failed');
    }
});
