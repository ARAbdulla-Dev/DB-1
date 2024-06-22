document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });

    if (response.ok) {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('otpForm').style.display = 'block';
    } else {
        alert('Failed to send OTP');
    }
});

document.getElementById('otpForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const otp = document.getElementById('otp').value;
    const email = document.getElementById('email').value;

    const response = await fetch('/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        //alert('Login successful');
        document.location.replace('/home');
        
    } else {
        alert('Invalid OTP');
    }
});
